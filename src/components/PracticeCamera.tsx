import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  FlipHorizontal,
  Hand,
  MapPin,
  Activity,
  Smile,
  VideoOff
} from 'lucide-react';
import type {
  FaceLandmarker,
  FaceLandmarkerResult,
  HandLandmarker,
  HandLandmarkerResult,
  NormalizedLandmark
} from '@mediapipe/tasks-vision';
import { CatalogSign, TargetLandmarks } from '../data/librasCatalog255';
import { SignMediaPlayer } from './SignSchematicVisualizer';
import {
  createPhaseTrackerState,
  evaluateTargetWithSequence,
  PhaseTrackerState,
  RecentHandSample,
  SingleTargetValidationResult
} from '../services/singleTargetValidator';
import { HandednessLabel } from '../types/librasRecognition';
import { soundService } from '../services/soundService';
import type { WorkerInMessage, WorkerOutMessage } from '../workers/mediapipeVision.worker';

export interface PracticeCameraProps {
  targetSign: CatalogSign;
  onPassed: (qualityPercent: number) => void;
  onSkipWithoutCamera?: () => void;
}

export type CameraDetectionState =
  | 'idle'
  | 'initializing'
  | 'detecting'
  | 'holding'
  | 'validated'
  | 'paused';

const HOLD_CONFIRMATION_MS = 850;
const HOLD_FLICKER_GRACE_MS = 220;
const WASM_CDN_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';
const HAND_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const FACE_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

// Standard MediaPipe 21-landmark hand skeleton connections
const HAND_CONNECTIONS: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20]
];

function targetRequiresFace(target: TargetLandmarks): boolean {
  if (
    target.articulationZone !== 'neutral_space' ||
    Boolean(target.expectedNmf && target.expectedNmf !== 'neutral')
  ) {
    return true;
  }
  return Boolean(target.motionPhases?.some((p) => p.articulationZone !== 'neutral_space'));
}

function getCameraErrorText(err: unknown): string {
  const name =
    err && typeof err === 'object' && 'name' in err ? String((err as { name: string }).name) : '';
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return 'Permissão da câmera bloqueada ou negada no navegador. Autorize a câmera ou toque em "Não usar câmera agora".';
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return 'Nenhuma câmera encontrada neste dispositivo. Toque em "Não usar câmera agora" para continuar.';
  }
  if (name === 'NotReadableError' || name === 'TrackStartError') {
    return 'A câmera está ocupada em outro aplicativo ou aba. Feche o outro uso e tente novamente.';
  }
  if (name === 'SecurityError') {
    return 'Acesso à câmera requer HTTPS ou contexto seguro. Você pode continuar sem câmera.';
  }
  const detail = err instanceof Error && err.message ? ` (${err.message})` : '';
  return `Não foi possível ativar a câmera neste ambiente${detail}. Você pode continuar sem câmera.`;
}

function drawLandmarksOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  handLandmarks: Array<Array<{ x: number; y: number }>>,
  faceAnchors: { chin?: { x: number; y: number }; forehead?: { x: number; y: number } },
  validated: boolean
) {
  ctx.clearRect(0, 0, width, height);

  if (faceAnchors.chin && faceAnchors.forehead) {
    ctx.fillStyle = validated ? 'rgba(22, 163, 74, 0.85)' : 'rgba(13, 148, 136, 0.75)';
    ctx.beginPath();
    ctx.arc(faceAnchors.chin.x * width, faceAnchors.chin.y * height, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const hand of handLandmarks) {
    ctx.strokeStyle = validated ? '#16A34A' : '#0D9488';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
      const a = hand[startIdx];
      const b = hand[endIdx];
      if (!a || !b) continue;
      ctx.moveTo(a.x * width, a.y * height);
      ctx.lineTo(b.x * width, b.y * height);
    }
    ctx.stroke();

    ctx.fillStyle = validated ? '#16A34A' : '#EA580C';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    for (const pt of hand) {
      ctx.beginPath();
      ctx.arc(pt.x * width, pt.y * height, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
}

async function waitForVideoReady(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= 1 && video.videoWidth > 0) return;

  await new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      video.removeEventListener('loadedmetadata', finish);
      video.removeEventListener('canplay', finish);
      resolve();
    };
    video.addEventListener('loadedmetadata', finish);
    video.addEventListener('canplay', finish);
    setTimeout(finish, 2500);
  });
}

const INITIAL_VALIDATION: SingleTargetValidationResult = {
  qualityPercent: 0,
  handshapeScore: 0,
  locationScore: 0,
  stabilityScore: 0,
  nmfScore: 0,
  detectedHands: false,
  detectedFace: false,
  passed: false,
  tip: 'Ative a câmera para praticar ou escolha "Não usar câmera agora".'
};

export const PracticeCamera = ({
  targetSign,
  onPassed,
  onSkipWithoutCamera
}: PracticeCameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const rafRef = useRef<number>(0);
  const workerInFlightRef = useRef<boolean>(false);
  const sessionIdRef = useRef<number>(0);
  const isFrontCameraRef = useRef<boolean>(true);
  const targetSignRef = useRef<CatalogSign>(targetSign);
  targetSignRef.current = targetSign;

  // Main-thread fallback detector refs (used only if Web Worker initialization fails)
  const fallbackHandRef = useRef<HandLandmarker | null>(null);
  const fallbackFaceRef = useRef<FaceLandmarker | null>(null);
  const usingFallbackEngineRef = useRef<boolean>(false);
  const fallbackLastHandTsRef = useRef<number>(0);
  const fallbackLastFaceTsRef = useRef<number>(0);
  const fallbackLastFaceInferMsRef = useRef<number>(0);
  const fallbackCachedFaceRef = useRef<FaceLandmarkerResult | undefined>(undefined);
  const fallbackLastValidFaceMsRef = useRef<number>(0);
  const fallbackRecentSamplesRef = useRef<RecentHandSample[]>([]);
  const fallbackPhaseTrackerRef = useRef<PhaseTrackerState>(createPhaseTrackerState());
  const lastFrameDispatchMsRef = useRef<number>(0);

  const passTimerStartRef = useRef<number | null>(null);
  const lastPassTimestampRef = useRef<number>(0);
  const hasPassedRef = useRef<boolean>(false);
  const detectionPausedRef = useRef<boolean>(false);
  const lastUiUpdateMsRef = useRef<number>(0);
  const onPassedRef = useRef(onPassed);
  onPassedRef.current = onPassed;

  // Explicit opt-in inside lessons: webcam is NEVER requested until user taps "Ativar câmera"
  const [cameraState, setCameraState] = useState<'prompt' | 'loading' | 'ready' | 'error'>('prompt');
  const [modelsStatus, setModelsStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [detectionState, setDetectionState] = useState<CameraDetectionState>('idle');
  const [holdProgressPercent, setHoldProgressPercent] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMirrored, setIsMirrored] = useState(true);
  const [validation, setValidation] = useState<SingleTargetValidationResult>(INITIAL_VALIDATION);
  const [confirmedQuality, setConfirmedQuality] = useState<number | null>(null);

  const disposeFallbackModels = useCallback(() => {
    usingFallbackEngineRef.current = false;
    try {
      fallbackHandRef.current?.close();
    } catch {
      // ignore
    }
    fallbackHandRef.current = null;
    try {
      fallbackFaceRef.current?.close();
    } catch {
      // ignore
    }
    fallbackFaceRef.current = null;
    fallbackCachedFaceRef.current = undefined;
    fallbackRecentSamplesRef.current = [];
    fallbackPhaseTrackerRef.current = createPhaseTrackerState();
  }, []);

  const pauseDetectionImmediately = useCallback(() => {
    detectionPausedRef.current = true;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    workerInFlightRef.current = false;
    if (workerRef.current) {
      try {
        workerRef.current.postMessage({ type: 'PAUSE' } satisfies WorkerInMessage);
      } catch {
        // ignore
      }
    }
  }, []);

  const stopCameraAndWorker = useCallback(() => {
    sessionIdRef.current += 1;
    detectionPausedRef.current = true;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    workerInFlightRef.current = false;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (workerRef.current) {
      try {
        workerRef.current.postMessage({ type: 'DISPOSE' } satisfies WorkerInMessage);
        workerRef.current.terminate();
      } catch {
        // ignore
      }
      workerRef.current = null;
    }

    disposeFallbackModels();
  }, [disposeFallbackModels]);

  const handleValidationOutput = useCallback(
    (
      handLandmarks: NormalizedLandmark[][],
      faceAnchors: { chin?: { x: number; y: number }; forehead?: { x: number; y: number } },
      nextValidation: SingleTargetValidationResult,
      timestampMs: number
    ) => {
      if (detectionPausedRef.current || hasPassedRef.current) return;

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawLandmarksOverlay(
            ctx,
            canvas.width,
            canvas.height,
            handLandmarks,
            faceAnchors,
            nextValidation.passed
          );
        }
      }

      if (nextValidation.passed) {
        if (passTimerStartRef.current === null) {
          passTimerStartRef.current = timestampMs;
        }
        lastPassTimestampRef.current = timestampMs;
        const elapsed = timestampMs - passTimerStartRef.current;
        const pct = Math.min(100, Math.round((elapsed / HOLD_CONFIRMATION_MS) * 100));

        if (elapsed >= HOLD_CONFIRMATION_MS) {
          hasPassedRef.current = true;
          setHoldProgressPercent(100);
          setDetectionState('validated');
          setValidation(nextValidation);
          setConfirmedQuality(nextValidation.qualityPercent);
          pauseDetectionImmediately();
          soundService.playCorrect();
          onPassedRef.current(nextValidation.qualityPercent);
          return;
        }

        if (timestampMs - lastUiUpdateMsRef.current >= 70) {
          lastUiUpdateMsRef.current = timestampMs;
          setDetectionState('holding');
          setHoldProgressPercent(pct);
          setValidation(nextValidation);
        }
      } else {
        const withinGrace =
          passTimerStartRef.current !== null &&
          nextValidation.detectedHands &&
          nextValidation.qualityPercent >= 62 &&
          timestampMs - lastPassTimestampRef.current <= HOLD_FLICKER_GRACE_MS;

        if (!withinGrace) {
          passTimerStartRef.current = null;
        }
        if (timestampMs - lastUiUpdateMsRef.current >= 80) {
          lastUiUpdateMsRef.current = timestampMs;
          setDetectionState(withinGrace ? 'holding' : 'detecting');
          if (!withinGrace) {
            setHoldProgressPercent(0);
          }
          setValidation(nextValidation);
        }
      }
    },
    [pauseDetectionImmediately]
  );

  const activateMainThreadFallback = useCallback(
    async (sessionId: number) => {
      if (usingFallbackEngineRef.current || sessionIdRef.current !== sessionId) return;
      usingFallbackEngineRef.current = true;
      setModelsStatus('loading');
      setDetectionState('initializing');
      setValidation((prev) => ({
        ...prev,
        tip: 'Inicializando detector focado para este sinal...'
      }));

      if (workerRef.current) {
        try {
          workerRef.current.postMessage({ type: 'DISPOSE' } satisfies WorkerInMessage);
          workerRef.current.terminate();
        } catch {
          // ignore
        }
        workerRef.current = null;
      }

      const { FilesetResolver, HandLandmarker: HandLmClass, FaceLandmarker: FaceLmClass } =
        await import('@mediapipe/tasks-vision');

      const target = targetSignRef.current.targetLandmarks;
      const numHands = target.twoHanded === 2 ? 2 : 1;
      const wasmBases = ['/mediapipe-wasm', WASM_CDN_URL];

      let resolvedVision: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>> | null = null;
      let resolvedHand: HandLandmarker | null = null;

      for (const base of wasmBases) {
        if (sessionIdRef.current !== sessionId) return;
        let vision: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>;
        try {
          vision = await FilesetResolver.forVisionTasks(base);
        } catch {
          continue;
        }
        for (const delegate of ['GPU', 'CPU'] as const) {
          if (sessionIdRef.current !== sessionId) return;
          try {
            const hand = await HandLmClass.createFromOptions(vision, {
              baseOptions: { modelAssetPath: HAND_MODEL_URL, delegate },
              runningMode: 'VIDEO',
              numHands,
              minHandDetectionConfidence: 0.5,
              minHandPresenceConfidence: 0.5,
              minTrackingConfidence: 0.5
            });
            resolvedVision = vision;
            resolvedHand = hand;
            break;
          } catch {
            // Try CPU / CDN fallback
          }
        }
        if (resolvedHand) break;
      }

      if (sessionIdRef.current !== sessionId) {
        resolvedHand?.close();
        return;
      }

      if (!resolvedHand || !resolvedVision) {
        usingFallbackEngineRef.current = false;
        setModelsStatus('error');
        setDetectionState('paused');
        setValidation((prev) => ({
          ...prev,
          tip: 'Não foi possível carregar o detector MediaPipe neste navegador.'
        }));
        return;
      }

      fallbackHandRef.current = resolvedHand;
      setModelsStatus('ready');
      setDetectionState('detecting');
      setValidation((prev) => ({
        ...prev,
        tip: `Mostre o sinal "${targetSignRef.current.palavra}" e mantenha por 1 segundo.`
      }));

      // Only load FaceLandmarker if this target sign needs face landmarks
      if (targetRequiresFace(target)) {
        for (const delegate of ['GPU', 'CPU'] as const) {
          if (sessionIdRef.current !== sessionId) return;
          try {
            const face = await FaceLmClass.createFromOptions(resolvedVision, {
              baseOptions: { modelAssetPath: FACE_MODEL_URL, delegate },
              runningMode: 'VIDEO',
              numFaces: 1,
              outputFaceBlendshapes: true,
              minFaceDetectionConfidence: 0.5,
              minFacePresenceConfidence: 0.5,
              minTrackingConfidence: 0.5
            });
            if (sessionIdRef.current !== sessionId) {
              face.close();
              return;
            }
            fallbackFaceRef.current = face;
            break;
          } catch {
            // Optional face enrichment
          }
        }
      }
    },
    []
  );

  // Reset and re-focus detection exclusively onto the current targetSign when exercise changes
  useEffect(() => {
    hasPassedRef.current = false;
    detectionPausedRef.current = false;
    passTimerStartRef.current = null;
    fallbackRecentSamplesRef.current = [];
    fallbackPhaseTrackerRef.current = createPhaseTrackerState();
    setHoldProgressPercent(0);
    setConfirmedQuality(null);
    setDetectionState(cameraState === 'ready' ? 'detecting' : 'idle');
    setValidation({
      ...INITIAL_VALIDATION,
      tip:
        cameraState === 'ready'
          ? `Mostre o sinal "${targetSign.palavra}" e mantenha por 1 segundo.`
          : INITIAL_VALIDATION.tip
    });

    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'SET_TARGET',
        target: targetSign.targetLandmarks
      } satisfies WorkerInMessage);
    }
    if (fallbackHandRef.current) {
      const targetHands = targetSign.targetLandmarks.twoHanded === 2 ? 2 : 1;
      fallbackHandRef.current.setOptions({ numHands: targetHands }).catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetSign.id]);

  // Full cleanup on unmount to prevent stream/model leaks
  useEffect(() => {
    return () => {
      stopCameraAndWorker();
    };
  }, [stopCameraAndWorker]);

  const startCameraAndWorker = useCallback(async () => {
    stopCameraAndWorker();
    const sessionId = sessionIdRef.current;
    detectionPausedRef.current = false;
    hasPassedRef.current = false;
    passTimerStartRef.current = null;

    setCameraState('loading');
    setModelsStatus('loading');
    setDetectionState('initializing');
    setHoldProgressPercent(0);
    setErrorMessage(null);
    setConfirmedQuality(null);
    setValidation({
      ...INITIAL_VALIDATION,
      tip: 'Iniciando câmera (640×480) e detector focado...'
    });

    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('Navegador sem suporte a câmera (getUserMedia indisponível).');
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: { ideal: 'user' } },
          audio: false
        });
      } catch (primaryErr: unknown) {
        const errName =
          primaryErr && typeof primaryErr === 'object' && 'name' in primaryErr
            ? String((primaryErr as { name: string }).name)
            : '';
        if (errName === 'OverconstrainedError' || errName === 'ConstraintNotSatisfiedError') {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 },
            audio: false
          });
        } else {
          throw primaryErr;
        }
      }

      if (sessionIdRef.current !== sessionId) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      const trackSettings = stream.getVideoTracks()[0]?.getSettings?.();
      isFrontCameraRef.current = trackSettings?.facingMode !== 'environment';
      streamRef.current = stream;

      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await waitForVideoReady(video);
        if (sessionIdRef.current !== sessionId) return;
        try {
          await video.play();
        } catch {
          // autoPlay fallback; stream tracks remain live
        }
      }

      if (sessionIdRef.current !== sessionId) return;
      setCameraState('ready');

      const canUseWorker =
        typeof Worker !== 'undefined' && typeof createImageBitmap === 'function';

      if (canUseWorker) {
        try {
          const worker = new Worker(
            new URL('../workers/mediapipeVision.worker.ts', import.meta.url),
            { type: 'module' }
          );
          workerRef.current = worker;

          worker.onmessage = (ev: MessageEvent<WorkerOutMessage>) => {
            if (sessionIdRef.current !== sessionId) return;
            const data = ev.data;
            if (data.type === 'STATUS') {
              if (data.status === 'error') {
                void activateMainThreadFallback(sessionId);
                return;
              }
              setModelsStatus(data.status);
              if (data.status === 'ready') {
                setDetectionState('detecting');
                setValidation((prev) => ({
                  ...prev,
                  tip: `Mostre o sinal "${targetSignRef.current.palavra}" e mantenha por 1 segundo.`
                }));
              }
              return;
            }

            if (data.type === 'RESULT') {
              workerInFlightRef.current = false;
              handleValidationOutput(
                data.handLandmarks,
                data.faceAnchors,
                data.validation,
                data.timestampMs
              );
            }
          };

          worker.onerror = () => {
            if (sessionIdRef.current !== sessionId) return;
            workerInFlightRef.current = false;
            void activateMainThreadFallback(sessionId);
          };

          worker.postMessage({
            type: 'INIT',
            origin: window.location.origin,
            target: targetSignRef.current.targetLandmarks
          } satisfies WorkerInMessage);
        } catch {
          void activateMainThreadFallback(sessionId);
        }
      } else {
        void activateMainThreadFallback(sessionId);
      }

      let lastVideoTime = -1;
      const pumpFrames = async () => {
        if (
          sessionIdRef.current !== sessionId ||
          detectionPausedRef.current ||
          hasPassedRef.current
        ) {
          return;
        }

        const currentVideo = videoRef.current;
        const currentCanvas = canvasRef.current;
        const activeWorker = workerRef.current;
        const activeFallbackHand = fallbackHandRef.current;

        if (
          currentVideo &&
          currentCanvas &&
          currentVideo.readyState >= 2 &&
          currentVideo.videoWidth > 0 &&
          currentVideo.videoHeight > 0 &&
          currentVideo.currentTime !== lastVideoTime
        ) {
          if (
            currentCanvas.width !== currentVideo.videoWidth ||
            currentCanvas.height !== currentVideo.videoHeight
          ) {
            currentCanvas.width = currentVideo.videoWidth;
            currentCanvas.height = currentVideo.videoHeight;
          }

          const nowDispatchMs = performance.now();
          if (activeWorker && !usingFallbackEngineRef.current) {
            if (!workerInFlightRef.current && nowDispatchMs - lastFrameDispatchMsRef.current >= 55) {
              lastFrameDispatchMsRef.current = nowDispatchMs;
              lastVideoTime = currentVideo.currentTime;
              workerInFlightRef.current = true;
              try {
                const bitmap = await createImageBitmap(currentVideo);
                if (
                  sessionIdRef.current !== sessionId ||
                  !workerRef.current ||
                  usingFallbackEngineRef.current ||
                  detectionPausedRef.current ||
                  hasPassedRef.current
                ) {
                  bitmap.close();
                  workerInFlightRef.current = false;
                } else {
                  workerRef.current.postMessage(
                    {
                      type: 'FRAME',
                      bitmap,
                      timestampMs: nowDispatchMs,
                      isFrontCamera: isFrontCameraRef.current
                    } satisfies WorkerInMessage,
                    [bitmap]
                  );
                }
              } catch {
                workerInFlightRef.current = false;
              }
            }
          } else if (activeFallbackHand && nowDispatchMs - lastFrameDispatchMsRef.current >= 55) {
            lastFrameDispatchMsRef.current = nowDispatchMs;
            lastVideoTime = currentVideo.currentTime;
            const nowMs = nowDispatchMs;
            const currentTarget = targetSignRef.current.targetLandmarks;
            const needsFace = targetRequiresFace(currentTarget);

            let handRes: HandLandmarkerResult | undefined;
            try {
              const handTs = Math.max(Math.round(nowMs), fallbackLastHandTsRef.current + 1);
              fallbackLastHandTsRef.current = handTs;
              handRes = activeFallbackHand.detectForVideo(currentVideo, handTs);
            } catch {
              // Skip transient frame failure
            }

            if (
              needsFace &&
              fallbackFaceRef.current &&
              nowMs - fallbackLastFaceInferMsRef.current >= 160
            ) {
              fallbackLastFaceInferMsRef.current = nowMs;
              try {
                const faceTs = Math.max(Math.round(nowMs), fallbackLastFaceTsRef.current + 1);
                fallbackLastFaceTsRef.current = faceTs;
                const nextFace = fallbackFaceRef.current.detectForVideo(
                  currentVideo,
                  faceTs
                );
                if (nextFace.faceLandmarks && nextFace.faceLandmarks.length > 0) {
                  fallbackCachedFaceRef.current = nextFace;
                  fallbackLastValidFaceMsRef.current = nowMs;
                } else if (nowMs - fallbackLastValidFaceMsRef.current > 2500) {
                  fallbackCachedFaceRef.current = undefined;
                }
              } catch {
                // Keep cached face result
              }
            } else if (!needsFace) {
              fallbackCachedFaceRef.current = undefined;
              fallbackLastValidFaceMsRef.current = 0;
            }

            const primaryLm = handRes?.landmarks?.[0];
            if (primaryLm && primaryLm[9] && primaryLm[0]) {
              const cx = (primaryLm[0].x + primaryLm[9].x) / 2;
              const cy = (primaryLm[0].y + primaryLm[9].y) / 2;
              const cz = ((primaryLm[0].z ?? 0) + (primaryLm[9].z ?? 0)) / 2;
              fallbackRecentSamplesRef.current.push({ x: cx, y: cy, z: cz, t: nowMs });
              fallbackRecentSamplesRef.current = fallbackRecentSamplesRef.current.filter(
                (s) => nowMs - s.t <= 1050
              );
            } else {
              fallbackRecentSamplesRef.current = [];
            }

            const handednesses: HandednessLabel[] = (handRes?.handedness || []).map((cats) => {
              const rawLabel = cats?.[0]?.categoryName;
              if (isFrontCameraRef.current) {
                if (rawLabel === 'Left') return 'Right';
                if (rawLabel === 'Right') return 'Left';
                return 'Unknown';
              }
              return rawLabel === 'Left' || rawLabel === 'Right' ? rawLabel : 'Unknown';
            });

            const cachedFace0 = needsFace
              ? fallbackCachedFaceRef.current?.faceLandmarks?.[0]
              : undefined;
            const nextValidation = evaluateTargetWithSequence({
              target: currentTarget,
              tracker: fallbackPhaseTrackerRef.current,
              handLandmarks: handRes?.landmarks || [],
              worldLandmarks: handRes?.worldLandmarks,
              handednesses,
              faceLandmarks: cachedFace0,
              faceBlendshapes: needsFace
                ? fallbackCachedFaceRef.current?.faceBlendshapes
                : undefined,
              recentCenters: fallbackRecentSamplesRef.current,
              timestampMs: nowMs
            });

            if (nextValidation.phaseJustAdvanced) {
              fallbackRecentSamplesRef.current = [];
            }

            handleValidationOutput(
              handRes?.landmarks || [],
              {
                chin: cachedFace0?.[152]
                  ? { x: cachedFace0[152].x, y: cachedFace0[152].y }
                  : undefined,
                forehead: cachedFace0?.[10]
                  ? { x: cachedFace0[10].x, y: cachedFace0[10].y }
                  : undefined
              },
              nextValidation,
              nowMs
            );
          }
        }

        if (
          sessionIdRef.current === sessionId &&
          !detectionPausedRef.current &&
          !hasPassedRef.current &&
          streamRef.current
        ) {
          rafRef.current = requestAnimationFrame(() => {
            void pumpFrames();
          });
        }
      };

      rafRef.current = requestAnimationFrame(() => {
        void pumpFrames();
      });
    } catch (err) {
      if (sessionIdRef.current !== sessionId) return;
      stopCameraAndWorker();
      setCameraState('error');
      setModelsStatus('idle');
      setDetectionState('idle');
      setErrorMessage(getCameraErrorText(err));
    }
  }, [activateMainThreadFallback, handleValidationOutput, stopCameraAndWorker]);

  const handleDeactivateCamera = () => {
    soundService.playTap();
    stopCameraAndWorker();
    setCameraState('prompt');
    setModelsStatus('idle');
    setDetectionState('idle');
    setHoldProgressPercent(0);
    setValidation(INITIAL_VALIDATION);
  };

  const handleSkip = () => {
    stopCameraAndWorker();
    if (onSkipWithoutCamera) {
      onSkipWithoutCamera();
    }
  };

  const isValidated = confirmedQuality !== null || detectionState === 'validated';
  const frameBorderClass = isValidated
    ? 'border-4 border-[#16A34A] ring-4 ring-[#16A34A]/20'
    : detectionState === 'holding'
    ? 'border-4 border-[#0D9488] ring-2 ring-[#0D9488]/20'
    : cameraState === 'loading'
    ? 'border-2 border-[#0D9488]/60'
    : 'border-2 border-[#E8E2D9]';

  const qualityColor = isValidated
    ? 'bg-[#16A34A]'
    : validation.qualityPercent >= 74
    ? 'bg-[#0D9488]'
    : validation.qualityPercent >= 52
    ? 'bg-[#EA580C]'
    : 'bg-[#D97706]';

  return (
    <div className="max-w-2xl mx-auto w-full space-y-4">
      {/* 1. Centered 4:3 Responsive Camera Card */}
      <div className="bg-white rounded-2xl border border-[#E8E2D9] p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E] flex items-center gap-1.5 whitespace-nowrap">
              <Camera className="w-3.5 h-3.5" />
              <span>Câmera de Prática · {targetSign.palavra}</span>
            </span>
          </div>

          {cameraState === 'ready' && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  soundService.playTap();
                  setIsMirrored((m) => !m);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F3F0EA] hover:bg-[#E8E2D9] text-[#57534E] font-bold text-[11px] cursor-pointer whitespace-nowrap shrink-0"
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
                <span>Espelhar</span>
              </button>
              <button
                type="button"
                onClick={handleDeactivateCamera}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F3F0EA] hover:bg-[#E8E2D9] text-[#57534E] font-bold text-[11px] cursor-pointer whitespace-nowrap shrink-0"
              >
                <VideoOff className="w-3.5 h-3.5" />
                <span>Desativar</span>
              </button>
            </div>
          )}
        </div>

        {/* Centered 4:3 Rounded Video Viewport */}
        <div
          className={`relative max-w-md mx-auto w-full aspect-[4/3] bg-stone-950 rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-200 ${frameBorderClass}`}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{ transform: isMirrored ? 'scaleX(-1)' : 'none' }}
            className={`w-full h-full object-cover ${
              cameraState === 'ready' ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <canvas
            ref={canvasRef}
            style={{ transform: isMirrored ? 'scaleX(-1)' : 'none' }}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />

          {/* Opt-In Screen inside Lesson */}
          {cameraState === 'prompt' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#FAF9F6] text-[#1C1917] p-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#F0FDFA] text-[#0D9488] border border-[#CCFBF1] flex items-center justify-center">
                <Camera className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-xs">
                <p className="text-sm font-bold text-[#1C1917]">
                  Pratique "{targetSign.palavra}" na câmera
                </p>
                <p className="text-xs text-[#57534E]">
                  Foco exclusivo nos pontos deste sinal. Acesso opcional e usado apenas nesta etapa.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundService.playTap();
                    void startCameraAndWorker();
                  }}
                  className="tactile-btn px-4 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs border-b-[3px] border-[#115E59] cursor-pointer whitespace-nowrap"
                >
                  Ativar câmera
                </button>
                {onSkipWithoutCamera && (
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="px-3.5 py-2.5 rounded-xl bg-[#F3F0EA] hover:bg-[#E8E2D9] text-[#1C1917] font-bold text-xs cursor-pointer whitespace-nowrap"
                  >
                    Não usar câmera agora
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Loading Spinner while camera stream starts */}
          {cameraState === 'loading' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-stone-950/90 text-white text-xs font-semibold p-4 text-center">
              <RefreshCw className="w-7 h-7 animate-spin text-[#0D9488]" />
              <span>Iniciando câmera (640×480)...</span>
            </div>
          )}

          {/* Background model initialization badge */}
          {cameraState === 'ready' && modelsStatus === 'loading' && !isValidated && (
            <div className="absolute top-2.5 left-2.5 px-2.5 py-1.5 rounded-lg bg-black/75 text-white text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-sm">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0D9488]" />
              <span>Carregando detector de {targetSign.palavra}...</span>
            </div>
          )}

          {/* 1-Second Hold Confirmation Bar */}
          {cameraState === 'ready' && detectionState === 'holding' && !isValidated && (
            <div className="absolute bottom-3 left-3 right-3 px-3 py-2 rounded-xl bg-black/80 text-white text-xs font-bold space-y-1.5 backdrop-blur-sm">
              <div className="flex items-center justify-between tabular-nums">
                <span>Mantenha o sinal firme...</span>
                <span className="text-[#5EEAD4]">{holdProgressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#16A34A] rounded-full transition-all duration-75"
                  style={{ width: `${holdProgressPercent}%` }}
                />
              </div>
            </div>
          )}

          {cameraState === 'ready' && modelsStatus === 'error' && (
            <div className="absolute top-2.5 left-2.5 right-2.5 px-3 py-2 rounded-xl bg-rose-950/90 border border-rose-500/50 text-white text-[11px] font-semibold flex items-center justify-between gap-2">
              <span>Não foi possível inicializar o detector de mãos.</span>
              <button
                type="button"
                onClick={() => void startCameraAndWorker()}
                className="px-2.5 py-1 rounded-lg bg-[#EA580C] text-white font-bold shrink-0 cursor-pointer"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {cameraState === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#FAF9F6] text-[#1C1917] p-5 text-center">
              <AlertTriangle className="w-7 h-7 text-[#EA580C]" />
              <p className="text-xs font-semibold text-[#57534E] max-w-xs">{errorMessage}</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => void startCameraAndWorker()}
                  className="tactile-btn px-3.5 py-2 rounded-xl bg-[#EA580C] text-white font-bold text-xs border-b-[3px] border-[#9A3412] cursor-pointer"
                >
                  Tentar novamente
                </button>
                {onSkipWithoutCamera && (
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="px-3.5 py-2 rounded-xl bg-[#F3F0EA] hover:bg-[#E8E2D9] text-[#1C1917] font-bold text-xs cursor-pointer"
                  >
                    Não usar câmera agora
                  </button>
                )}
              </div>
            </div>
          )}

          {isValidated && (
            <div className="absolute top-3 left-3 right-3 px-3 py-2 rounded-xl bg-[#16A34A] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Sinal validado ({confirmedQuality ?? validation.qualityPercent}%) · Detecção pausada</span>
            </div>
          )}
        </div>

        {/* Real-Time Quality Bar + Score Breakdown */}
        <div className="space-y-2.5 max-w-md mx-auto w-full">
          {targetSign.targetLandmarks.motionPhases && targetSign.targetLandmarks.motionPhases.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {targetSign.targetLandmarks.motionPhases.map((ph, idx) => {
                const currentIdx = validation.phaseIndex ?? 0;
                const done = isValidated || idx < currentIdx;
                const active = !isValidated && idx === currentIdx;
                return (
                  <span
                    key={idx}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                      done
                        ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]'
                        : active
                        ? 'bg-[#FFF1E6] text-[#9A3412] border-[#EA580C]'
                        : 'bg-[#F3F0EA] text-[#78716C] border-[#E8E2D9]'
                    }`}
                  >
                    {idx + 1}. {ph.label}
                  </span>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between text-xs font-bold tabular-nums">
            <span className="text-[#1C1917]">Precisão em {targetSign.palavra}</span>
            <span className={isValidated ? 'text-[#15803D]' : validation.qualityPercent >= 74 ? 'text-[#0F766E]' : 'text-[#EA580C]'}>
              {confirmedQuality ?? validation.qualityPercent}% · Meta 74% (0,9s)
            </span>
          </div>

          <div className="w-full h-3 bg-[#F3F0EA] rounded-full overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-150 ${qualityColor}`}
              style={{ width: `${confirmedQuality ?? validation.qualityPercent}%` }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-[#1C1917]/30"
              style={{ left: '74%' }}
              title="Meta mínima: 74%"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-semibold text-[#57534E] tabular-nums">
            <div className="flex items-center gap-1 bg-[#FAF9F6] px-2 py-1.5 rounded-lg border border-[#E8E2D9] min-w-0">
              <Hand className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
              <span className="truncate">Mão {validation.handshapeScore}%</span>
            </div>
            <div className="flex items-center gap-1 bg-[#FAF9F6] px-2 py-1.5 rounded-lg border border-[#E8E2D9] min-w-0">
              <MapPin className="w-3.5 h-3.5 text-[#EA580C] shrink-0" />
              <span className="truncate">Local {validation.locationScore}%</span>
            </div>
            <div className="flex items-center gap-1 bg-[#FAF9F6] px-2 py-1.5 rounded-lg border border-[#E8E2D9] min-w-0">
              <Activity className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
              <span className="truncate">Mov. {validation.stabilityScore}%</span>
            </div>
            <div className="flex items-center gap-1 bg-[#FAF9F6] px-2 py-1.5 rounded-lg border border-[#E8E2D9] min-w-0">
              <Smile className="w-3.5 h-3.5 text-[#B45309] shrink-0" />
              <span className="truncate">ENM {validation.nmfScore}%</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div
              className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold border ${
                isValidated || validation.passed
                  ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]'
                  : 'bg-[#FFF1E6] text-[#9A3412] border-[#FED7AA]'
              }`}
            >
              {isValidated
                ? 'Muito bem! Sinal confirmado e detecção pausada.'
                : validation.tip}
            </div>

            {onSkipWithoutCamera && !isValidated && (
              <button
                type="button"
                onClick={handleSkip}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#F3F0EA] hover:bg-[#E8E2D9] text-[#57534E] font-bold text-xs cursor-pointer shrink-0 whitespace-nowrap"
              >
                <VideoOff className="w-3.5 h-3.5" />
                <span>Não usar câmera agora</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Target Sign Instructions & Reference Below Centered Camera */}
      <div className="bg-white rounded-2xl border border-[#E8E2D9] p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E]">
              Instruções do sinal
            </span>
            <span className="text-[11px] font-bold text-[#57534E]">{targetSign.categoria}</span>
          </div>
          <h3 className="font-display text-xl font-bold text-[#1C1917]">{targetSign.palavra}</h3>
          <p className="text-xs font-medium text-[#57534E]">{targetSign.significado}</p>
        </div>

        <SignMediaPlayer sign={targetSign} compact={true} />
      </div>
    </div>
  );
};
