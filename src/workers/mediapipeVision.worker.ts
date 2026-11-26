import {
  FaceLandmarker,
  FaceLandmarkerResult,
  FilesetResolver,
  HandLandmarker,
  HandLandmarkerResult,
  NormalizedLandmark
} from '@mediapipe/tasks-vision';
import { TargetLandmarks } from '../data/librasCatalog255';
import {
  createPhaseTrackerState,
  evaluateTargetWithSequence,
  PhaseTrackerState,
  RecentHandSample,
  SingleTargetValidationResult
} from '../services/singleTargetValidator';
import { HandednessLabel } from '../types/librasRecognition';

const WASM_CDN_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';
const HAND_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const FACE_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

export type WorkerInMessage =
  | {
      type: 'INIT';
      origin: string;
      target: TargetLandmarks;
    }
  | {
      type: 'SET_TARGET';
      target: TargetLandmarks;
    }
  | {
      type: 'PAUSE';
    }
  | {
      type: 'RESUME';
    }
  | {
      type: 'RESET_HISTORY';
    }
  | {
      type: 'FRAME';
      bitmap: ImageBitmap;
      timestampMs: number;
      isFrontCamera: boolean;
    }
  | {
      type: 'DISPOSE';
    };

export type WorkerOutMessage =
  | {
      type: 'STATUS';
      status: 'loading' | 'ready' | 'error';
      error?: string;
    }
  | {
      type: 'RESULT';
      handLandmarks: NormalizedLandmark[][];
      faceAnchors: { chin?: { x: number; y: number }; forehead?: { x: number; y: number } };
      validation: SingleTargetValidationResult;
      timestampMs: number;
    };

interface WorkerPort {
  postMessage: (msg: WorkerOutMessage) => void;
  onmessage: ((ev: MessageEvent<WorkerInMessage>) => void) | null;
}

const workerScope = self as unknown as WorkerPort;

let handLandmarker: HandLandmarker | null = null;
let faceLandmarker: FaceLandmarker | null = null;
let lastHandTs = 0;
let lastFaceTs = 0;
let lastFaceInferMs = 0;
let cachedFaceRes: FaceLandmarkerResult | undefined;
let recentSamples: RecentHandSample[] = [];
let activeTarget: TargetLandmarks | null = null;
let phaseTracker: PhaseTrackerState = createPhaseTrackerState();
let currentNumHands = 1;
let isPaused = false;
let initGeneration = 0;

function targetRequiresFace(target: TargetLandmarks | null): boolean {
  if (!target) return false;
  if (
    target.articulationZone !== 'neutral_space' ||
    Boolean(target.expectedNmf && target.expectedNmf !== 'neutral')
  ) {
    return true;
  }
  return Boolean(target.motionPhases?.some((p) => p.articulationZone !== 'neutral_space'));
}

function disposeModels() {
  try {
    handLandmarker?.close();
  } catch {
    // ignore close error
  }
  handLandmarker = null;
  try {
    faceLandmarker?.close();
  } catch {
    // ignore close error
  }
  faceLandmarker = null;
  cachedFaceRes = undefined;
  recentSamples = [];
  phaseTracker = createPhaseTrackerState();
  isPaused = false;
}

async function createHandWithVisionCandidates(
  origin: string,
  numHands: number,
  generation: number
) {
  const cleanOrigin = origin.replace(/\/$/, '');
  const wasmCandidates: Array<{ base: string; useModule: boolean }> = [
    { base: `${cleanOrigin}/mediapipe-wasm`, useModule: true },
    { base: WASM_CDN_URL, useModule: true }
  ];

  let lastError: unknown = null;

  for (const candidate of wasmCandidates) {
    if (generation !== initGeneration) return null;
    let vision: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>;
    try {
      vision = await FilesetResolver.forVisionTasks(candidate.base, candidate.useModule);
    } catch (err) {
      lastError = err;
      continue;
    }

    for (const delegate of ['GPU', 'CPU'] as const) {
      if (generation !== initGeneration) return null;
      try {
        const hand = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: HAND_MODEL_URL, delegate },
          runningMode: 'VIDEO',
          numHands,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
        return { vision, hand };
      } catch (err) {
        lastError = err;
      }
    }
  }

  throw lastError ?? new Error('Falha ao carregar WASM/modelo de mãos no Web Worker.');
}

async function initModels(origin: string, target: TargetLandmarks) {
  const generation = ++initGeneration;
  activeTarget = target;
  currentNumHands = target.twoHanded === 2 ? 2 : 1;
  isPaused = false;
  disposeModels();
  workerScope.postMessage({ type: 'STATUS', status: 'loading' });

  if (typeof OffscreenCanvas === 'undefined') {
    workerScope.postMessage({
      type: 'STATUS',
      status: 'error',
      error: 'OffscreenCanvas indisponível neste Web Worker.'
    });
    return;
  }

  try {
    const resolved = await createHandWithVisionCandidates(origin, currentNumHands, generation);
    if (!resolved || generation !== initGeneration) {
      resolved?.hand.close();
      return;
    }

    handLandmarker = resolved.hand;
    workerScope.postMessage({ type: 'STATUS', status: 'ready' });

    // Load FaceLandmarker only when the active target sign requires facial/body anchor landmarks
    if (targetRequiresFace(activeTarget)) {
      for (const delegate of ['GPU', 'CPU'] as const) {
        if (generation !== initGeneration) return;
        try {
          const face = await FaceLandmarker.createFromOptions(resolved.vision, {
            baseOptions: { modelAssetPath: FACE_MODEL_URL, delegate },
            runningMode: 'VIDEO',
            numFaces: 1,
            outputFaceBlendshapes: true,
            minFaceDetectionConfidence: 0.5,
            minFacePresenceConfidence: 0.5,
            minTrackingConfidence: 0.5
          });
          if (generation !== initGeneration) {
            face.close();
            return;
          }
          faceLandmarker = face;
          break;
        } catch {
          // Optional face enrichment
        }
      }
    }
  } catch (err) {
    if (generation !== initGeneration) return;
    workerScope.postMessage({
      type: 'STATUS',
      status: 'error',
      error: err instanceof Error ? err.message : 'Erro ao carregar modelos MediaPipe no Worker.'
    });
  }
}

workerScope.onmessage = async (event: MessageEvent<WorkerInMessage>) => {
  const msg = event.data;

  if (msg.type === 'INIT') {
    await initModels(msg.origin, msg.target);
    return;
  }

  if (msg.type === 'SET_TARGET') {
    activeTarget = msg.target;
    recentSamples = [];
    phaseTracker = createPhaseTrackerState();
    cachedFaceRes = undefined;
    isPaused = false;
    const nextHands = msg.target.twoHanded === 2 ? 2 : 1;
    if (handLandmarker && currentNumHands !== nextHands) {
      currentNumHands = nextHands;
      try {
        await handLandmarker.setOptions({ numHands: currentNumHands });
      } catch {
        // Ignore dynamic numHands update failure cleanly
      }
    }
    return;
  }

  if (msg.type === 'PAUSE') {
    isPaused = true;
    return;
  }

  if (msg.type === 'RESUME') {
    isPaused = false;
    return;
  }

  if (msg.type === 'RESET_HISTORY') {
    recentSamples = [];
    phaseTracker = createPhaseTrackerState();
    return;
  }

  if (msg.type === 'DISPOSE') {
    initGeneration += 1;
    activeTarget = null;
    disposeModels();
    return;
  }

  if (msg.type === 'FRAME') {
    const { bitmap, timestampMs, isFrontCamera } = msg;
    try {
      if (isPaused || !activeTarget) {
        return;
      }

      let handRes: HandLandmarkerResult | undefined;
      if (handLandmarker) {
        const handTs = Math.max(Math.round(timestampMs), lastHandTs + 1);
        lastHandTs = handTs;
        try {
          handRes = handLandmarker.detectForVideo(bitmap, handTs);
        } catch {
          // Skip transient frame failure
        }
      }

      const needsFace = targetRequiresFace(activeTarget);
      if (needsFace && faceLandmarker && timestampMs - lastFaceInferMs >= 160) {
        lastFaceInferMs = timestampMs;
        const faceTs = Math.max(Math.round(timestampMs), lastFaceTs + 1);
        lastFaceTs = faceTs;
        try {
          cachedFaceRes = faceLandmarker.detectForVideo(bitmap, faceTs);
        } catch {
          // Retain cached face result on transient failure
        }
      } else if (!needsFace) {
        cachedFaceRes = undefined;
      }

      const primaryLm = handRes?.landmarks?.[0];
      if (primaryLm && primaryLm[9] && primaryLm[0]) {
        const cx = (primaryLm[0].x + primaryLm[9].x) / 2;
        const cy = (primaryLm[0].y + primaryLm[9].y) / 2;
        const cz = ((primaryLm[0].z ?? 0) + (primaryLm[9].z ?? 0)) / 2;
        recentSamples.push({ x: cx, y: cy, z: cz, t: timestampMs });
        recentSamples = recentSamples.filter((s) => timestampMs - s.t <= 1050);
      } else {
        recentSamples = [];
      }

      const handednesses: HandednessLabel[] = (handRes?.handedness || []).map((cats) => {
        const rawLabel = cats?.[0]?.categoryName;
        if (isFrontCamera) {
          if (rawLabel === 'Left') return 'Right';
          if (rawLabel === 'Right') return 'Left';
          return 'Unknown';
        }
        return rawLabel === 'Left' || rawLabel === 'Right' ? rawLabel : 'Unknown';
      });

      const face0 = needsFace ? cachedFaceRes?.faceLandmarks?.[0] : undefined;
      const validation = evaluateTargetWithSequence({
        target: activeTarget,
        tracker: phaseTracker,
        handLandmarks: handRes?.landmarks || [],
        worldLandmarks: handRes?.worldLandmarks,
        handednesses,
        faceLandmarks: face0,
        faceBlendshapes: needsFace ? cachedFaceRes?.faceBlendshapes : undefined,
        recentCenters: recentSamples,
        timestampMs
      });

      if (validation.phaseJustAdvanced) {
        recentSamples = [];
      }

      workerScope.postMessage({
        type: 'RESULT',
        handLandmarks: handRes?.landmarks || [],
        faceAnchors: {
          chin: face0?.[152] ? { x: face0[152].x, y: face0[152].y } : undefined,
          forehead: face0?.[10] ? { x: face0[10].x, y: face0[10].y } : undefined
        },
        validation,
        timestampMs
      });
    } finally {
      bitmap.close();
    }
  }
};
