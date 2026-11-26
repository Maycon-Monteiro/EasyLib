import test from 'node:test';
import assert from 'node:assert/strict';

import {
  areConflictingOrEquivalentSigns,
  findCatalogSign,
  LIBRAS_CATALOG_255,
  LIBRAS_CATALOG_CATEGORIES,
  LIBRAS_CATALOG_FULL,
  resolveAlphabetMediaUrl,
  URLS_ALFABETO_REAIS,
  URLS_REAIS
} from '../data/librasCatalog255';
import { computeDictionaryCategoryProgress } from '../utils/dictionaryProgress';
import {
  CURATED_GLOSS_CHALLENGES,
  DUO_OUTFITS,
  evaluateSectionSummaryText,
  getActivityNodeId,
  getExercisesForActivity,
  getTrackUnlockState,
  getUnitsForSection,
  LIBRAS_ACHIEVEMENTS,
  LIBRAS_SECTIONS,
  SECTION_VIDEO_SUMMARIES,
  TRACK_STRUCTURE,
  URLS_VIDEOS_EXPLICATIVOS,
  URLS_VIDEOS_SECAO
} from '../data/librasData';
import { ARTIFACTS_CATALOG } from '../data/artifactsData';
import {
  NAMETAG_CATALOG,
  NAMETAG_IMAGE_PRESETS,
  PLAYER_CLASSES_CATALOG
} from '../data/customizationCatalog';
import {
  getInactivityTierForElapsedMs,
  NOTIFICACOES_AMEACA_EXTREMA_LIBRAS
} from '../data/notificationsData';
import { getSignEditorialDetail } from '../data/signEditorialDetails';
import {
  buildLibrasSeSignVideoUrl,
  getSignDataById,
  getSignDataBySlug,
  SIGNS_DATA
} from '../data/signsData';
import {
  generateCandidateRoomCode,
  isValidRoomCodeFormat,
  normalizeRoomCode
} from '../services/roomCodeUtils';
import {
  createPhaseTrackerState,
  evaluateSingleTargetSign,
  evaluateTargetWithSequence
} from '../services/singleTargetValidator';
import {
  DEFAULT_PROFILE,
  computeNextStreakOnPractice,
  diffCalendarDays,
  reconcileStreakOnLoad
} from '../services/storage';
import {
  getMediaCreditLabel,
  getYouTubeEmbedUrl,
  parseSignMedia
} from '../utils/mediaUtils';
import { HandednessLabel, PalmFacing, Point3D } from '../types/librasRecognition';

interface SyntheticFingerSpec {
  thumb: number;
  index: number;
  middle: number;
  ring: number;
  pinky: number;
  indexSpreadDeg?: number;
  thumbSpreadDeg?: number;
  thumbCrossInward?: boolean;
}

function rotateForFacing(local: Point3D, facing: PalmFacing, handedness: HandednessLabel): Point3D {
  const { x, y, z } = local;
  switch (facing) {
    case 'camera':
      return { x, y, z };
    case 'signer':
      return { x: -x, y, z: -z };
    case 'up':
      return { x, y: z, z: -y };
    case 'down':
      return { x, y: -z, z: y };
    case 'inward':
      return handedness === 'Right' ? { x: -z, y, z: x } : { x: z, y, z: -x };
    case 'outward':
      return handedness === 'Right' ? { x: z, y, z: -x } : { x: -z, y, z: x };
    default:
      return { x, y, z };
  }
}

function buildFinger(
  mcp: Point3D,
  dirUp: Point3D,
  palmNormal: Point3D,
  extension: number,
  palmScale: number,
  lengthFactor: number
): [Point3D, Point3D, Point3D] {
  const seg1 = palmScale * 0.34 * lengthFactor;
  const seg2 = palmScale * 0.24 * lengthFactor;
  const seg3 = palmScale * 0.20 * lengthFactor;

  const bend1 = (1 - extension) * 1.45;
  const bend2 = (1 - extension) * 2.95;
  const bend3 = (1 - extension) * 4.35;

  const step = (origin: Point3D, angle: number, len: number): Point3D => ({
    x: origin.x + (dirUp.x * Math.cos(angle) + palmNormal.x * Math.sin(angle)) * len,
    y: origin.y + (dirUp.y * Math.cos(angle) + palmNormal.y * Math.sin(angle)) * len,
    z: origin.z + (dirUp.z * Math.cos(angle) + palmNormal.z * Math.sin(angle)) * len
  });

  const pip = step(mcp, bend1, seg1);
  const dip = step(pip, bend2, seg2);
  const tip = step(dip, bend3, seg3);
  return [pip, dip, tip];
}

function makeHandLandmarks(opts: {
  wristPos: Point3D;
  palmScale?: number;
  facing?: PalmFacing;
  handedness?: HandednessLabel;
  spec: SyntheticFingerSpec;
}): Point3D[] {
  const {
    wristPos,
    palmScale = 0.095,
    facing = 'camera',
    handedness = 'Right',
    spec
  } = opts;
  const sideSign = handedness === 'Right' ? -1 : 1;

  const xf = (lx: number, ly: number, lz = 0): Point3D => {
    const r = rotateForFacing(
      { x: lx * palmScale, y: ly * palmScale, z: lz * palmScale },
      facing,
      handedness
    );
    return { x: wristPos.x + r.x, y: wristPos.y + r.y, z: wristPos.z + r.z };
  };

  const wrist = { ...wristPos };
  const indexMcp = xf(sideSign * 0.34, -0.92, 0);
  const middleMcp = xf(sideSign * 0.08, -1.0, 0);
  const ringMcp = xf(-sideSign * 0.16, -0.96, 0);
  const pinkyMcp = xf(-sideSign * 0.38, -0.88, 0);

  const palmDir = rotateForFacing({ x: 0, y: 0, z: -1 }, facing, handedness);
  const spreadRad = ((spec.indexSpreadDeg ?? 8) * Math.PI) / 180;

  const indexUp = rotateForFacing(
    { x: Math.sin(spreadRad) * sideSign, y: -Math.cos(spreadRad), z: 0 },
    facing,
    handedness
  );
  const middleUp = rotateForFacing(
    { x: -Math.sin(spreadRad * 0.4) * sideSign, y: -Math.cos(spreadRad * 0.4), z: 0 },
    facing,
    handedness
  );
  const ringUp = rotateForFacing({ x: -sideSign * 0.08, y: -0.99, z: 0 }, facing, handedness);
  const pinkyUp = rotateForFacing({ x: -sideSign * 0.16, y: -0.98, z: 0 }, facing, handedness);

  const [idxPip, idxDip, idxTip] = buildFinger(indexMcp, indexUp, palmDir, spec.index, palmScale, 1.0);
  const [midPip, midDip, midTip] = buildFinger(middleMcp, middleUp, palmDir, spec.middle, palmScale, 1.08);
  const [rngPip, rngDip, rngTip] = buildFinger(ringMcp, ringUp, palmDir, spec.ring, palmScale, 1.0);
  const [pnkPip, pnkDip, pnkTip] = buildFinger(pinkyMcp, pinkyUp, palmDir, spec.pinky, palmScale, 0.82);

  const thumbCmc = xf(sideSign * 0.32, -0.30, -0.04);
  const thumbMcp = xf(sideSign * 0.56, -0.52, -0.06);
  const thumbAngleRad = ((spec.thumbSpreadDeg ?? 48) * Math.PI) / 180;
  let thumbLocal: Point3D;
  if (spec.thumbCrossInward) {
    thumbLocal = { x: -sideSign * 0.65, y: -0.45, z: -0.55 };
  } else if (spec.thumb >= 0.7) {
    thumbLocal = {
      x: sideSign * Math.sin(thumbAngleRad),
      y: -Math.cos(thumbAngleRad),
      z: -0.05
    };
  } else {
    thumbLocal = { x: sideSign * 0.15, y: -0.82, z: -0.5 };
  }
  const tLen = Math.hypot(thumbLocal.x, thumbLocal.y, thumbLocal.z);
  const thumbUnit = rotateForFacing(
    { x: thumbLocal.x / tLen, y: thumbLocal.y / tLen, z: thumbLocal.z / tLen },
    facing,
    handedness
  );
  const thumbIp: Point3D = {
    x: thumbMcp.x + thumbUnit.x * palmScale * 0.28,
    y: thumbMcp.y + thumbUnit.y * palmScale * 0.28,
    z: thumbMcp.z + thumbUnit.z * palmScale * 0.28
  };
  const thumbTip: Point3D = {
    x: thumbIp.x + thumbUnit.x * palmScale * (0.18 + spec.thumb * 0.14),
    y: thumbIp.y + thumbUnit.y * palmScale * (0.18 + spec.thumb * 0.14),
    z: thumbIp.z + thumbUnit.z * palmScale * (0.18 + spec.thumb * 0.14)
  };

  return [
    wrist,
    thumbCmc,
    thumbMcp,
    thumbIp,
    thumbTip,
    indexMcp,
    idxPip,
    idxDip,
    idxTip,
    middleMcp,
    midPip,
    midDip,
    midTip,
    ringMcp,
    rngPip,
    rngDip,
    rngTip,
    pinkyMcp,
    pnkPip,
    pnkDip,
    pnkTip
  ];
}

function makeFaceLandmarks(center: Point3D = { x: 0.5, y: 0.27, z: 0 }, faceScale = 0.16): Point3D[] {
  const face: Point3D[] = Array.from({ length: 468 }, () => ({ ...center }));
  face[10] = { x: center.x, y: center.y - faceScale * 0.55, z: 0 };
  face[152] = { x: center.x, y: center.y + faceScale * 0.55, z: 0 };
  face[1] = { x: center.x, y: center.y, z: -0.04 };
  face[13] = { x: center.x, y: center.y + faceScale * 0.22, z: 0 };
  face[234] = { x: center.x - faceScale * 0.42, y: center.y, z: 0 };
  face[454] = { x: center.x + faceScale * 0.42, y: center.y, z: 0 };
  return face;
}

test('1. Catálogo possui exatamente 255 sinais do libras.se com slugs únicos e URLs corretas', () => {
  assert.equal(LIBRAS_CATALOG_255.length, 255);
  assert.ok(LIBRAS_CATALOG_CATEGORIES.length >= 10);

  const uniqueIds = new Set(LIBRAS_CATALOG_255.map((s) => s.id));
  const uniqueSlugs = new Set(LIBRAS_CATALOG_255.map((s) => s.slug));
  assert.equal(uniqueIds.size, 255);
  assert.equal(uniqueSlugs.size, 255);

  LIBRAS_CATALOG_255.forEach((sign, idx) => {
    assert.equal(sign.numericId, idx + 1);
    assert.ok(sign.palavra.length > 0);
    assert.ok(sign.significado.length > 0);
    assert.ok(LIBRAS_CATALOG_CATEGORIES.includes(sign.categoria));
    const expectedUrl =
      URLS_REAIS[sign.slug] ||
      URLS_REAIS[sign.palavra] ||
      `https://libras.se/assets/videos/sinais/${sign.slug}.mp4`;
    assert.equal(sign.videoUrl, expectedUrl);
    assert.ok(sign.targetLandmarks.handshapeId);
    assert.ok(sign.schematicHint.handshapeId);
  });
});

test('2. Validador de sinal único rejeita quando nenhuma mão é detectada', () => {
  const maeSign = findCatalogSign('mae');
  const res = evaluateSingleTargetSign({
    target: maeSign.targetLandmarks,
    handLandmarks: [],
    faceLandmarks: makeFaceLandmarks()
  });

  assert.equal(res.detectedHands, false);
  assert.equal(res.qualityPercent, 0);
  assert.equal(res.passed, false);
});

test('3. Validador aprova (>= 80%) quando configuração de mão e ponto de articulação correspondem ao sinal alvo', () => {
  const face = makeFaceLandmarks();

  // mae: flat_b at chin
  const maeSign = findCatalogSign('mae');
  const maeHand = makeHandLandmarks({
    wristPos: { x: 0.5, y: 0.43, z: -0.04 },
    facing: 'signer',
    spec: { thumb: 0.4, index: 1, middle: 1, ring: 1, pinky: 1, indexSpreadDeg: 5 }
  });
  const maeRes = evaluateSingleTargetSign({
    target: maeSign.targetLandmarks,
    handLandmarks: [maeHand],
    handednesses: ['Right'],
    faceLandmarks: face,
    recentCenters: [
      { x: 0.5, y: 0.37, t: 100 },
      { x: 0.5, y: 0.37, t: 180 },
      { x: 0.5, y: 0.37, t: 260 }
    ]
  });
  assert.equal(maeRes.passed, true, `Esperava aprovação em Mãe, obteve ${maeRes.qualityPercent}% (${maeRes.tip})`);
  assert.ok(maeRes.qualityPercent >= 80);

  // entender: point_1 at forehead
  const entenderSign = findCatalogSign('entender');
  const entenderHand = makeHandLandmarks({
    wristPos: { x: 0.52, y: 0.27, z: -0.04 },
    facing: 'inward',
    spec: { thumb: 0.1, index: 1, middle: 0, ring: 0, pinky: 0, thumbCrossInward: true }
  });
  const entenderRes = evaluateSingleTargetSign({
    target: entenderSign.targetLandmarks,
    handLandmarks: [entenderHand],
    handednesses: ['Right'],
    faceLandmarks: face,
    recentCenters: [
      { x: 0.52, y: 0.22, t: 100 },
      { x: 0.52, y: 0.22, t: 180 },
      { x: 0.52, y: 0.22, t: 260 }
    ]
  });
  assert.equal(entenderRes.passed, true, `Esperava aprovação em Entender, obteve ${entenderRes.qualityPercent}%`);
  assert.ok(entenderRes.qualityPercent >= 65);

  // oi: open_5 at shoulder with wave motion
  const oiSign = findCatalogSign('oi');
  const oiHand = makeHandLandmarks({
    wristPos: { x: 0.36, y: 0.44, z: -0.04 },
    facing: 'camera',
    spec: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1, indexSpreadDeg: 16 }
  });
  const oiRes = evaluateSingleTargetSign({
    target: oiSign.targetLandmarks,
    handLandmarks: [oiHand],
    handednesses: ['Right'],
    faceLandmarks: face,
    recentCenters: [
      { x: 0.33, y: 0.39, t: 100 },
      { x: 0.39, y: 0.39, t: 200 },
      { x: 0.34, y: 0.39, t: 300 }
    ]
  });
  assert.equal(oiRes.passed, true, `Esperava aprovação em Oi, obteve ${oiRes.qualityPercent}%`);
});

test('4. Guardrails bloqueiam (< 80%) quando a mão ou o local estão errados e exigem 2 mãos quando aplicável', () => {
  const face = makeFaceLandmarks();
  const maeSign = findCatalogSign('mae');

  // Wrong handshape (closed fist at chin) -> must fail
  const wrongHandshape = makeHandLandmarks({
    wristPos: { x: 0.5, y: 0.43, z: -0.04 },
    facing: 'camera',
    spec: { thumb: 0, index: 0, middle: 0, ring: 0, pinky: 0, thumbCrossInward: true }
  });
  const resWrongHand = evaluateSingleTargetSign({
    target: maeSign.targetLandmarks,
    handLandmarks: [wrongHandshape],
    handednesses: ['Right'],
    faceLandmarks: face
  });
  assert.equal(resWrongHand.passed, false);
  assert.ok(resWrongHand.qualityPercent < 80);

  // Wrong location (correct flat_b hand down at chest instead of chin) -> must fail
  const wrongLocation = makeHandLandmarks({
    wristPos: { x: 0.5, y: 0.78, z: -0.04 },
    facing: 'camera',
    spec: { thumb: 0.4, index: 1, middle: 1, ring: 1, pinky: 1, indexSpreadDeg: 5 }
  });
  const resWrongLoc = evaluateSingleTargetSign({
    target: maeSign.targetLandmarks,
    handLandmarks: [wrongLocation],
    handednesses: ['Right'],
    faceLandmarks: face
  });
  assert.equal(resWrongLoc.passed, false);
  assert.ok(resWrongLoc.qualityPercent < 80);
  assert.ok(resWrongLoc.tip.toLowerCase().includes('queixo'));

  // Two-handed sign (casa) with only 1 visible hand -> must fail and ask for 2 hands
  const casaSign = findCatalogSign('casa');
  const oneHand = makeHandLandmarks({
    wristPos: { x: 0.44, y: 0.52, z: -0.04 },
    facing: 'inward',
    handedness: 'Right',
    spec: { thumb: 0.5, index: 1, middle: 1, ring: 1, pinky: 1, indexSpreadDeg: 5 }
  });
  const resOneHandCasa = evaluateSingleTargetSign({
    target: casaSign.targetLandmarks,
    handLandmarks: [oneHand],
    handednesses: ['Right'],
    faceLandmarks: face
  });
  assert.equal(resOneHandCasa.passed, false);
  assert.ok(resOneHandCasa.tip.toLowerCase().includes('duas mãos'));

  // Both hands present -> passes
  const secondHand = makeHandLandmarks({
    wristPos: { x: 0.56, y: 0.52, z: -0.04 },
    facing: 'inward',
    handedness: 'Left',
    spec: { thumb: 0.5, index: 1, middle: 1, ring: 1, pinky: 1, indexSpreadDeg: 5 }
  });
  const resTwoHandCasa = evaluateSingleTargetSign({
    target: casaSign.targetLandmarks,
    handLandmarks: [oneHand, secondHand],
    handednesses: ['Right', 'Left'],
    faceLandmarks: face,
    recentCenters: [
      { x: 0.44, y: 0.47, t: 100 },
      { x: 0.44, y: 0.47, t: 200 },
      { x: 0.44, y: 0.47, t: 300 }
    ]
  });
  assert.equal(resTwoHandCasa.passed, true, `Esperava aprovação em Casa com 2 mãos, obteve ${resTwoHandCasa.qualityPercent}%`);

  // Strictness guardrails: Obrigado (forehead) performed down at chin must fail (< 80%)
  const obrigadoSign = findCatalogSign('obrigado');
  const obrigadoAtChin = makeHandLandmarks({
    wristPos: { x: 0.5, y: 0.43, z: -0.05 },
    facing: 'signer',
    spec: { thumb: 0.4, index: 1, middle: 1, ring: 1, pinky: 1, indexSpreadDeg: 5 }
  });
  const resObrigadoWrongZone = evaluateSingleTargetSign({
    target: obrigadoSign.targetLandmarks,
    handLandmarks: [obrigadoAtChin],
    handednesses: ['Right'],
    faceLandmarks: face,
    recentCenters: [
      { x: 0.5, y: 0.37, z: -0.01, t: 100 },
      { x: 0.5, y: 0.38, z: -0.07, t: 220 },
      { x: 0.5, y: 0.39, z: -0.14, t: 340 }
    ]
  });
  assert.equal(resObrigadoWrongZone.passed, false);
  assert.ok(resObrigadoWrongZone.qualityPercent < 80);

  // Strictness guardrails: Oi (open_5) with only 2 fingers up (V) must fail (< 80%)
  const oiSign = findCatalogSign('oi');
  const vHandAtShoulder = makeHandLandmarks({
    wristPos: { x: 0.36, y: 0.44, z: -0.04 },
    facing: 'camera',
    spec: { thumb: 0, index: 1, middle: 1, ring: 0, pinky: 0, indexSpreadDeg: 28, thumbCrossInward: true }
  });
  const resOiWrongHand = evaluateSingleTargetSign({
    target: oiSign.targetLandmarks,
    handLandmarks: [vHandAtShoulder],
    handednesses: ['Right'],
    faceLandmarks: face,
    recentCenters: [
      { x: 0.33, y: 0.39, t: 100 },
      { x: 0.39, y: 0.39, t: 200 },
      { x: 0.34, y: 0.39, t: 300 }
    ]
  });
  assert.equal(resOiWrongHand.passed, false);
  assert.ok(resOiWrongHand.qualityPercent < 80);
});

test('5. Trilha segue estrutura 10 seções × 20 etapas × 12 atividades × 5 exercícios sob demanda', () => {
  assert.equal(TRACK_STRUCTURE.sections, 10);
  assert.equal(TRACK_STRUCTURE.stagesPerSection, 20);
  assert.equal(TRACK_STRUCTURE.activitiesPerStage, 12);
  assert.equal(TRACK_STRUCTURE.exercisesPerActivity, 5);
  assert.equal(LIBRAS_SECTIONS.length, 10);

  for (let s = 1; s <= TRACK_STRUCTURE.sections; s++) {
    const units = getUnitsForSection(s);
    assert.equal(units.length, 20, `Seção ${s} deveria ter 20 etapas`);
    for (const unit of units) {
      assert.equal(unit.nodes.length, 12, `${unit.id} deveria ter 12 atividades`);
    }
  }

  // Spot-check odd and even activities across different sections
  const oddExercises = getExercisesForActivity(1, 1, 1);
  assert.equal(oddExercises.length, 5);
  assert.deepEqual(
    oddExercises.map((e) => e.type),
    ['new_sign_cards', 'slow_reading', 'match_sign_pairs', 'camera_practice', 'translate_to_libras']
  );
  assert.equal(oddExercises[0].isNewSign, true);
  assert.ok((oddExercises[0].signMeaning ?? '').length > 0);
  assert.equal(oddExercises[0].options?.length, 4);
  assert.equal(oddExercises[2].matchPairs?.length, 4);

  const evenExercises = getExercisesForActivity(3, 5, 2);
  assert.equal(evenExercises.length, 5);
  assert.deepEqual(
    evenExercises.map((e) => e.type),
    ['new_sign_cards', 'slow_reading', 'dactylology_spelling', 'camera_practice', 'dialogue_completion']
  );
  assert.equal(evenExercises[0].isNewSign, true);
  assert.ok((evenExercises[0].signMeaning ?? '').length > 0);
});

test('6. Validador avalia Expressões Não-Manuais (ENM) via faceBlendshapes e emite dica facial quando necessário', () => {
  const tudoBemSign = findCatalogSign('tudo-bem');
  const face = makeFaceLandmarks();
  const hand = makeHandLandmarks({
    wristPos: { x: 0.45, y: 0.56, z: -0.04 },
    facing: 'camera',
    spec: { thumb: 1, index: 0, middle: 0, ring: 0, pinky: 0 }
  });

  const flatBrows = evaluateSingleTargetSign({
    target: tudoBemSign.targetLandmarks,
    handLandmarks: [hand],
    handednesses: ['Right'],
    faceLandmarks: face,
    faceBlendshapes: [
      {
        categories: [
          { categoryName: 'browInnerUp', score: 0.02 },
          { categoryName: 'browOuterUpLeft', score: 0.02 },
          { categoryName: 'browOuterUpRight', score: 0.02 }
        ]
      }
    ],
    recentCenters: [
      { x: 0.45, y: 0.50, t: 100 },
      { x: 0.45, y: 0.51, t: 200 },
      { x: 0.45, y: 0.50, t: 300 }
    ]
  });

  const raisedBrows = evaluateSingleTargetSign({
    target: tudoBemSign.targetLandmarks,
    handLandmarks: [hand],
    handednesses: ['Right'],
    faceLandmarks: face,
    faceBlendshapes: [
      {
        categories: [
          { categoryName: 'browInnerUp', score: 0.78 },
          { categoryName: 'browOuterUpLeft', score: 0.72 },
          { categoryName: 'browOuterUpRight', score: 0.74 }
        ]
      }
    ],
    recentCenters: [
      { x: 0.45, y: 0.50, t: 100 },
      { x: 0.45, y: 0.51, t: 200 },
      { x: 0.45, y: 0.50, t: 300 }
    ]
  });

  assert.ok(raisedBrows.nmfScore > flatBrows.nmfScore);
  assert.ok(raisedBrows.nmfScore >= 85);
});

test('7. Progressão sequencial estrita bloqueia atividades, etapas e seções futuras até conclusão anterior', () => {
  const initialState = getTrackUnlockState([]);
  assert.equal(initialState.isActivityUnlocked(1, 1, 1), true);
  assert.equal(initialState.isActivityUnlocked(1, 1, 2), false);
  assert.equal(initialState.isStageUnlocked(1, 1), true);
  assert.equal(initialState.isStageUnlocked(1, 2), false);
  assert.equal(initialState.isSectionUnlocked(1), true);
  assert.equal(initialState.isSectionUnlocked(2), false);

  const afterOneActivity = getTrackUnlockState([getActivityNodeId(1, 1, 1)]);
  assert.equal(afterOneActivity.isActivityUnlocked(1, 1, 2), true);
  assert.equal(afterOneActivity.isActivityUnlocked(1, 1, 3), false);
  assert.equal(afterOneActivity.isStageUnlocked(1, 2), false);

  const stage1CompletedIds = Array.from({ length: 12 }, (_, idx) =>
    getActivityNodeId(1, 1, idx + 1)
  );
  const afterStage1 = getTrackUnlockState(stage1CompletedIds);
  assert.equal(afterStage1.isStageCompleted(1, 1), true);
  assert.equal(afterStage1.isStageUnlocked(1, 2), true);
  assert.equal(afterStage1.isActivityUnlocked(1, 2, 1), true);
  assert.equal(afterStage1.isActivityUnlocked(1, 2, 2), false);
  assert.equal(afterStage1.isSectionUnlocked(2), false);

  const section1CompletedIds: string[] = [];
  for (let stage = 1; stage <= 20; stage++) {
    for (let act = 1; act <= 12; act++) {
      section1CompletedIds.push(getActivityNodeId(1, stage, act));
    }
  }
  const afterSection1 = getTrackUnlockState(section1CompletedIds);
  assert.equal(afterSection1.isSectionCompleted(1), true);
  assert.equal(afterSection1.isSectionUnlocked(2), true);
  assert.equal(afterSection1.isStageUnlocked(2, 1), true);
  assert.equal(afterSection1.isActivityUnlocked(2, 1, 1), true);
  assert.equal(afterSection1.isSectionUnlocked(3), false);
});

test('8. Página de detalhe editorial gera metadados limpos, 3 exemplos e 4 sinais relacionados para todos os sinais do catálogo completo (+1000)', () => {
  assert.ok(
    LIBRAS_CATALOG_FULL.length >= 1000,
    `Esperava >= 1000 sinais no catálogo completo, obteve ${LIBRAS_CATALOG_FULL.length}`
  );
  for (const sign of LIBRAS_CATALOG_FULL) {
    const detail = getSignEditorialDetail(sign);
    assert.ok(detail.grammaticalClass.length > 0);
    assert.ok(detail.usageContext.length > 0);
    assert.equal(detail.definitions.length, 2);
    assert.equal(detail.examples.length, 3);
    assert.equal(detail.relatedSigns.length, 4);
    assert.ok(!detail.relatedSigns.some((r) => r.id === sign.id));
    assert.ok(!detail.howToMake.handshapeText.includes(sign.targetLandmarks.handshapeId));
    assert.ok(!detail.howToMake.handshapeText.toLowerCase().includes('não fechada neutra'));
  }
});

test('9. Validação de código único de sala fechada rejeita formatos inválidos e normaliza códigos válidos', () => {
  assert.equal(normalizeRoomCode('  lib-7k9  '), 'LIB7K9');
  assert.equal(isValidRoomCodeFormat('LIB7K9'), true);
  assert.equal(isValidRoomCodeFormat('abc12345'), true);
  assert.equal(isValidRoomCodeFormat(''), false);
  assert.equal(isValidRoomCodeFormat('123'), false);
  assert.equal(isValidRoomCodeFormat('LIB!@#'), false);
  assert.equal(isValidRoomCodeFormat('CODIGOMUITOGRANDE123'), false);

  const generated = generateCandidateRoomCode(6);
  assert.equal(generated.length, 6);
  assert.equal(isValidRoomCodeFormat(generated), true);
});

test('10. Validador usa worldLandmarks 3D, movimento Z (para frente) e janela curta de estabilidade (480ms)', () => {
  const face = makeFaceLandmarks();

  // OBRIGADO: flat_b at forehead moving forward along Z-axis (-0.01 -> -0.14) with 3D worldLandmarks
  const obrigadoSign = findCatalogSign('obrigado');
  const obrigadoHand2D = makeHandLandmarks({
    wristPos: { x: 0.5, y: 0.27, z: -0.05 },
    facing: 'signer',
    spec: { thumb: 0.4, index: 1, middle: 1, ring: 1, pinky: 1, indexSpreadDeg: 5 }
  });
  const obrigadoWorld = makeHandLandmarks({
    wristPos: { x: 0, y: 0, z: 0 },
    palmScale: 0.085,
    facing: 'signer',
    spec: { thumb: 0.4, index: 1, middle: 1, ring: 1, pinky: 1, indexSpreadDeg: 5 }
  });

  const obrigadoRes = evaluateSingleTargetSign({
    target: obrigadoSign.targetLandmarks,
    handLandmarks: [obrigadoHand2D],
    worldLandmarks: [obrigadoWorld],
    handednesses: ['Right'],
    faceLandmarks: face,
    recentCenters: [
      { x: 0.5, y: 0.22, z: -0.01, t: 100 },
      { x: 0.5, y: 0.23, z: -0.07, t: 220 },
      { x: 0.5, y: 0.24, z: -0.14, t: 340 }
    ]
  });
  assert.equal(
    obrigadoRes.passed,
    true,
    `Esperava aprovação em Obrigado com movimento Z, obteve ${obrigadoRes.qualityPercent}% (${obrigadoRes.tip})`
  );
  assert.ok(obrigadoRes.stabilityScore >= 78);

  // MÃE (static): hand enters frame at t=50..120 then stabilizes inside last 480ms (t=620..860)
  const maeSign = findCatalogSign('mae');
  const maeHand = makeHandLandmarks({
    wristPos: { x: 0.5, y: 0.43, z: -0.04 },
    facing: 'signer',
    spec: { thumb: 0.4, index: 1, middle: 1, ring: 1, pinky: 1, indexSpreadDeg: 5 }
  });
  const maeRes = evaluateSingleTargetSign({
    target: maeSign.targetLandmarks,
    handLandmarks: [maeHand],
    handednesses: ['Right'],
    faceLandmarks: face,
    recentCenters: [
      { x: 0.25, y: 0.72, z: 0, t: 50 },
      { x: 0.39, y: 0.54, z: -0.02, t: 120 },
      { x: 0.5, y: 0.37, z: -0.04, t: 620 },
      { x: 0.5, y: 0.37, z: -0.04, t: 740 },
      { x: 0.5, y: 0.37, z: -0.04, t: 860 }
    ]
  });
  assert.equal(maeRes.passed, true, `MÃE deveria aprovar após entrada inicial: ${maeRes.stabilityScore}%`);
  assert.ok(maeRes.stabilityScore >= 90);
});

test('11. signsData.ts expõe os +1000 sinais com { id, label, slug, videoUrl, category, grammarClass } e montagem programática de URL', () => {
  assert.equal(SIGNS_DATA.length, LIBRAS_CATALOG_FULL.length);
  assert.ok(SIGNS_DATA.length >= 1000, `Esperava >= 1000 sinais em SIGNS_DATA, obteve ${SIGNS_DATA.length}`);

  const uniqueIds = new Set(SIGNS_DATA.map((item) => item.id));
  const uniqueSlugs = new Set(SIGNS_DATA.map((item) => item.slug));
  assert.equal(uniqueIds.size, SIGNS_DATA.length);
  assert.equal(uniqueSlugs.size, SIGNS_DATA.length);

  for (const item of SIGNS_DATA) {
    assert.equal(typeof item.id, 'number');
    assert.ok(item.id >= 1 && item.id <= SIGNS_DATA.length);
    assert.ok(item.label.length > 0);
    assert.ok(item.slug.length > 0);
    assert.ok(item.videoUrl.startsWith('https://') || item.videoUrl.startsWith('/') || item.videoUrl.startsWith('http://'));
    const parsed = parseSignMedia(item.videoUrl);
    assert.ok(parsed !== null, `URL inválida em ${item.slug}: ${item.videoUrl}`);
    assert.ok(LIBRAS_CATALOG_CATEGORIES.includes(item.category));
    assert.ok(item.grammarClass.length > 0);
  }

  const bomDia = getSignDataBySlug('bom-dia');
  assert.ok(bomDia);
  assert.equal(bomDia.label, 'Bom dia');
  assert.equal(bomDia.videoUrl, URLS_REAIS['bom-dia']);
  assert.equal(getSignDataById(bomDia.id)?.slug, 'bom-dia');

  const abracar = getSignDataBySlug('abracar');
  assert.ok(abracar);
  assert.equal(abracar.category, 'Verbos');
  assert.equal(abracar.grammarClass, 'Verbo');

  assert.equal(
    buildLibrasSeSignVideoUrl('abelha', 'Abelha', 'https://cdn.exemplo.com/sinais/'),
    'https://cdn.exemplo.com/sinais/abelha.mp4'
  );
});

test('12. Progresso por categoria do Dicionário soma visualizados e favoritos sem dupla contagem', () => {
  const summary = computeDictionaryCategoryProgress(
    LIBRAS_CATALOG_FULL,
    ['oi', 'ola', 'abracar'],
    ['oi', 'eu', 'aceitar']
  );

  assert.equal(summary.totalSigns, LIBRAS_CATALOG_FULL.length);
  // 'oi' is in both viewed and favorite -> union size = 5 ('oi', 'ola', 'abracar', 'eu', 'aceitar')
  assert.equal(summary.totalExplored, 5);
  assert.equal(summary.totalViewed, 3);
  assert.equal(summary.totalFavorites, 3);

  const verbos = summary.categories.find((c) => c.category === 'Verbos');
  const saudacoes = summary.categories.find((c) => c.category === 'Saudações');
  const pronomes = summary.categories.find((c) => c.category === 'Pronomes e Perguntas');

  assert.ok(verbos && verbos.totalCount >= 200);
  assert.equal(verbos.exploredCount, 2);

  assert.ok(saudacoes && saudacoes.totalCount >= 20);
  assert.equal(saudacoes.exploredCount, 2);

  assert.ok(pronomes && pronomes.totalCount >= 40);
  assert.equal(pronomes.exploredCount, 1);
});

test('13. Catálogo de frases mantém as frases originais distribuídas nas atividades e Oi/Olá usam o mesmo vídeo', () => {
  assert.equal(
    CURATED_GLOSS_CHALLENGES.length,
    8,
    `Esperava apenas as 8 frases originais, obteve ${CURATED_GLOSS_CHALLENGES.length}`
  );
  const slugs = new Set(CURATED_GLOSS_CHALLENGES.map((p) => p.slug));
  assert.equal(slugs.size, CURATED_GLOSS_CHALLENGES.length);

  for (const phrase of CURATED_GLOSS_CHALLENGES) {
    assert.ok(phrase.portuguese.length > 0);
    assert.ok(phrase.glossTokens.length >= 2);
    assert.ok(phrase.distractors.length >= 2);
  }

  // Verify all original phrases appear in odd activities across Section 1
  const seenSentences = new Set<string>();
  for (let stage = 1; stage <= 4; stage++) {
    for (const act of [1, 3, 5, 7, 9, 11]) {
      const exs = getExercisesForActivity(1, stage, act);
      const phraseEx = exs.find((e) => e.type === 'translate_to_libras');
      if (phraseEx?.portugueseSentence) {
        seenSentences.add(phraseEx.portugueseSentence);
      }
    }
  }
  assert.equal(seenSentences.size, CURATED_GLOSS_CHALLENGES.length);

  // Verify onde-voce-mora matches the video glosses LUGAR SEU CASA
  const ondeChallenge = CURATED_GLOSS_CHALLENGES.find((c) => c.slug === 'onde-voce-mora');
  assert.deepEqual(ondeChallenge?.glossTokens, ['LUGAR', 'SEU', 'CASA']);

  // Verify Oi and Olá share the same videoUrl
  assert.equal(findCatalogSign('oi').videoUrl, findCatalogSign('ola').videoUrl);
});

test('14. Perguntas, alternativas, pares e respostas das atividades usam os mesmos vídeos da Biblioteca', () => {
  for (let stage = 1; stage <= 3; stage++) {
    for (let act = 1; act <= 6; act++) {
      const exs = getExercisesForActivity(1, stage, act);

      for (const ex of exs) {
        if (ex.targetSignId) {
          const libSign = findCatalogSign(ex.targetSignId);
          assert.ok(libSign.videoUrl.length > 0, `targetSignId ${ex.targetSignId} deve ter videoUrl da biblioteca`);
        }
        if (ex.options) {
          for (const opt of ex.options) {
            if (opt.catalogSignId) {
              const optLibSign = findCatalogSign(opt.catalogSignId);
              assert.equal(
                optLibSign.videoUrl,
                findCatalogSign(optLibSign.slug).videoUrl
              );
            }
          }
        }
        if (ex.matchPairs) {
          for (const pair of ex.matchPairs) {
            const pairLibSign = findCatalogSign(pair.catalogSignId || pair.signId);
            assert.ok(pairLibSign.videoUrl.length > 0);
            assert.equal(pairLibSign.videoUrl, findCatalogSign(pairLibSign.slug).videoUrl);
          }
        }
        if (ex.dialoguePrompt?.catalogSignId) {
          const dlgSign = findCatalogSign(ex.dialoguePrompt.catalogSignId);
          assert.ok(dlgSign.videoUrl.length > 0);
          assert.equal(dlgSign.videoUrl, findCatalogSign(dlgSign.slug).videoUrl);
        }
      }
    }
  }
});

test('15. Atividades nunca repetem o mesmo vídeo ou sinônimos (Oi/Olá), diversificam formatos e variam posições das respostas', () => {
  const answerPositions = new Set<number>();
  const exerciseSignatures = new Set<string>();
  const targetSignsSeen = new Set<string>();
  let seenWordChoiceDact = false;
  let seenLetterTileDact = false;

  for (let section = 1; section <= 5; section++) {
    for (let stage = 1; stage <= 3; stage++) {
      for (let act = 1; act <= 12; act++) {
        const exs = getExercisesForActivity(section, stage, act);
        assert.equal(exs.length, 5);

        if (section === 1 && stage === 1) {
          exerciseSignatures.add(exs.map((e) => e.type).join('|'));
          const focus = exs.find((e) => e.type === 'camera_practice')?.targetSignId;
          if (focus) targetSignsSeen.add(focus);
        }

        for (const ex of exs) {
          if (ex.type === 'dactylology_spelling') {
            if (ex.dactylologyWord) {
              assert.match(
                ex.dactylologyWord,
                /^[A-Z]+$/,
                `Palavra de datilologia não deveria ter Ç/acentos: ${ex.dactylologyWord}`
              );
            }
            if (ex.options?.length) {
              seenWordChoiceDact = true;
              for (const opt of ex.options) {
                assert.match(opt.text, /^[A-Z]+$/, `Alternativa inválida na soletragem: ${opt.text}`);
              }
            }
            if (ex.wordBank?.length) {
              seenLetterTileDact = true;
              for (const tile of ex.wordBank) {
                assert.match(tile, /^[A-Z]$/, `Letra inválida na soletragem: ${tile}`);
              }
            }
          }

          if (ex.options && ex.options.length >= 3) {
            const correctIdx = ex.options.findIndex((o) =>
              ex.correctAnswers.some(
                (ans) => ans.toLowerCase().trim() === o.text.toLowerCase().trim()
              )
            );
            assert.ok(correctIdx >= 0, `Resposta correta não encontrada em ${ex.id}`);
            answerPositions.add(correctIdx);

            // Check no conflicting signs or duplicate videoUrls among option cards
            const optSigns = ex.options
              .filter((o) => o.catalogSignId)
              .map((o) => findCatalogSign(o.catalogSignId!));

            for (let i = 0; i < optSigns.length; i++) {
              for (let j = i + 1; j < optSigns.length; j++) {
                assert.equal(
                  areConflictingOrEquivalentSigns(optSigns[i], optSigns[j]),
                  false,
                  `Opções conflitantes/mesmo vídeo em ${ex.id}: ${optSigns[i].slug} vs ${optSigns[j].slug}`
                );
              }
            }
          }

          if (ex.matchPairs) {
            const pairSigns = ex.matchPairs.map((p) =>
              findCatalogSign(p.catalogSignId || p.signId)
            );
            for (let i = 0; i < pairSigns.length; i++) {
              for (let j = i + 1; j < pairSigns.length; j++) {
                assert.equal(
                  areConflictingOrEquivalentSigns(pairSigns[i], pairSigns[j]),
                  false,
                  `Pares conflitantes/mesmo vídeo em ${ex.id}: ${pairSigns[i].slug} vs ${pairSigns[j].slug}`
                );
              }
            }
          }
        }
      }
    }
  }

  assert.ok(
    exerciseSignatures.size >= 4,
    `Esperava >= 4 combinações distintas de exercícios na Etapa 1, obteve ${exerciseSignatures.size}`
  );
  assert.ok(
    targetSignsSeen.size >= 8,
    `Esperava >= 8 sinais-alvo distintos na Etapa 1, obteve ${targetSignsSeen.size}`
  );
  assert.ok(
    answerPositions.size >= 3,
    `Esperava respostas corretas distribuídas em >= 3 posições, obteve ${[...answerPositions].join(',')}`
  );
  assert.equal(seenWordChoiceDact, true);
  assert.equal(seenLetterTileDact, true);

  // Verify all 26 alphabet images (A-Z) are wired into URLS_ALFABETO_REAIS
  assert.equal(typeof URLS_ALFABETO_REAIS, 'object');
  for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')) {
    const resolved = resolveAlphabetMediaUrl(letter);
    assert.ok(resolved && resolved.startsWith('/assets/aistudio/'), `Esperava imagem local para ${letter}`);
  }
});

test('16. Validação exige movimento dinâmico em OI e sequência de fases BOM -> DIA em BOM-DIA', () => {
  const face = makeFaceLandmarks();

  // OI with static hand should NOT pass
  const oiSign = findCatalogSign('oi');
  const oiHand = makeHandLandmarks({
    wristPos: { x: 0.78, y: 0.36, z: -0.04 },
    facing: 'camera',
    spec: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 }
  });
  const oiStaticRes = evaluateSingleTargetSign({
    target: oiSign.targetLandmarks,
    handLandmarks: [oiHand],
    handednesses: ['Right'],
    faceLandmarks: face,
    recentCenters: [
      { x: 0.78, y: 0.36, z: -0.04, t: 100 },
      { x: 0.78, y: 0.36, z: -0.04, t: 260 },
      { x: 0.78, y: 0.36, z: -0.04, t: 420 },
      { x: 0.78, y: 0.36, z: -0.04, t: 580 }
    ]
  });
  assert.equal(
    oiStaticRes.passed,
    false,
    `OI com mão parada não deve passar (stability=${oiStaticRes.stabilityScore}, quality=${oiStaticRes.qualityPercent})`
  );

  // OI with horizontal wave motion should pass
  const oiWaveRes = evaluateSingleTargetSign({
    target: oiSign.targetLandmarks,
    handLandmarks: [oiHand],
    handednesses: ['Right'],
    faceLandmarks: face,
    recentCenters: [
      { x: 0.70, y: 0.36, z: -0.04, t: 100 },
      { x: 0.80, y: 0.36, z: -0.04, t: 240 },
      { x: 0.71, y: 0.36, z: -0.04, t: 380 },
      { x: 0.81, y: 0.36, z: -0.04, t: 520 },
      { x: 0.72, y: 0.36, z: -0.04, t: 660 }
    ]
  });
  assert.equal(
    oiWaveRes.passed,
    true,
    `OI com aceno horizontal deveria passar, obteve ${oiWaveRes.qualityPercent}% (${oiWaveRes.tip})`
  );

  // BOM-DIA compound sequence: cannot skip directly to DIA without executing BOM first
  const bomDiaSign = findCatalogSign('bom-dia');
  assert.ok(bomDiaSign.targetLandmarks.motionPhases && bomDiaSign.targetLandmarks.motionPhases.length >= 2);
  const tracker = createPhaseTrackerState();

  const diaHandD = makeHandLandmarks({
    wristPos: { x: 0.52, y: 0.30, z: -0.05 },
    facing: 'inward',
    spec: { thumb: 0.1, index: 1, middle: 0, ring: 0, pinky: 0, thumbCrossInward: true }
  });
  const prematureDiaRes = evaluateTargetWithSequence({
    target: bomDiaSign.targetLandmarks,
    tracker,
    handLandmarks: [diaHandD],
    handednesses: ['Right'],
    faceLandmarks: face,
    recentCenters: [
      { x: 0.52, y: 0.28, z: -0.01, t: 100 },
      { x: 0.52, y: 0.29, z: -0.06, t: 220 },
      { x: 0.52, y: 0.30, z: -0.12, t: 340 }
    ],
    timestampMs: 340
  });
  assert.equal(prematureDiaRes.passed, false);
  assert.equal(tracker.phaseIndex, 0, 'Não deve avançar fase sem antes executar BOM');

  // Execute Phase 1 (BOM): thumb_a at mouth + forward trajectory
  const bomHand = makeHandLandmarks({
    wristPos: { x: 0.50, y: 0.36, z: -0.08 },
    facing: 'camera',
    spec: { thumb: 1, index: 0, middle: 0, ring: 0, pinky: 0 }
  });
  const phase1Res = evaluateTargetWithSequence({
    target: bomDiaSign.targetLandmarks,
    tracker,
    handLandmarks: [bomHand],
    handednesses: ['Right'],
    faceLandmarks: face,
    recentCenters: [
      { x: 0.50, y: 0.30, z: -0.01, t: 400 },
      { x: 0.50, y: 0.31, z: -0.06, t: 540 },
      { x: 0.50, y: 0.32, z: -0.12, t: 680 }
    ],
    timestampMs: 680
  });
  assert.equal(phase1Res.phaseJustAdvanced, true);
  assert.equal(tracker.phaseIndex, 1);

  // Execute Phase 2 (DIA): point_1 at forehead + forward trajectory
  const phase2Res = evaluateTargetWithSequence({
    target: bomDiaSign.targetLandmarks,
    tracker,
    handLandmarks: [diaHandD],
    handednesses: ['Right'],
    faceLandmarks: face,
    recentCenters: [
      { x: 0.52, y: 0.28, z: -0.01, t: 800 },
      { x: 0.52, y: 0.29, z: -0.06, t: 940 },
      { x: 0.52, y: 0.30, z: -0.12, t: 1080 }
    ],
    timestampMs: 1080
  });
  assert.equal(phase2Res.passed, true, `Fase 2 DIA deveria aprovar após BOM, obteve ${phase2Res.tip}`);
});

test('17. Utilitários de mídia configuram autoplay mudo do YouTube, WebP e omitindo créditos externos', () => {
  const ytShort = parseSignMedia('https://youtube.com/shorts/dQw4w9WgXcQ');
  assert.equal(ytShort?.kind, 'youtube');
  assert.equal(ytShort?.videoId, 'dQw4w9WgXcQ');

  const embed = getYouTubeEmbedUrl('dQw4w9WgXcQ', { autoplay: true, mute: true, loop: true });
  assert.ok(embed.includes('autoplay=1'));
  assert.ok(embed.includes('mute=1'));
  assert.ok(embed.includes('loop=1'));
  assert.ok(embed.includes('playlist=dQw4w9WgXcQ'));

  const webp = parseSignMedia('https://cdn.exemplo.com/sinal.webp');
  assert.equal(webp?.kind, 'image');

  assert.equal(getMediaCreditLabel('https://youtube.com/watch?v=dQw4w9WgXcQ'), '');
  assert.equal(getMediaCreditLabel('https://libras.se/sinais/oi.mp4'), '');
});

test('18. Catálogo possui 30 artefatos colecionáveis sem compra por moedas nem trajes compráveis', () => {
  assert.equal(ARTIFACTS_CATALOG.length, 30);
  const artifactIds = new Set(ARTIFACTS_CATALOG.map((a) => a.id));
  assert.equal(artifactIds.size, 30);

  for (const artifact of ARTIFACTS_CATALOG) {
    assert.ok(
      ['free_starter', 'xp', 'nodes', 'streak', 'section'].includes(artifact.unlockType),
      `Artefato ${artifact.id} deve usar desbloqueio por trilha/XP/ofensiva`
    );
    assert.equal(/EasyLib/i.test(artifact.title), false, `Artefato ${artifact.id} não deve mencionar EasyLib`);
  }

  assert.equal(DUO_OUTFITS.length, 1);
  assert.equal(DUO_OUTFITS[0].id, 'classic');
  assert.equal(DUO_OUTFITS[0].price, 0);
});

test('19. Atividade 6 insere vídeo explicativo no meio (Saudações em Libras 0.1.1) sem créditos e resumo de seção valida determinístico', () => {
  const act6Sec1 = getExercisesForActivity(1, 1, 6);
  assert.equal(act6Sec1.length, 5);
  assert.equal(act6Sec1[2].type, 'explanatory_video');
  assert.match(act6Sec1[2].videoTitle || '', /Saudações em Libras 0\.1\.1/i);
  assert.ok(!act6Sec1[2].videoCredit);

  assert.equal(SECTION_VIDEO_SUMMARIES.length, 10);
  assert.ok(URLS_VIDEOS_EXPLICATIVOS.s1_a6_saudacoes !== undefined);
  assert.ok(URLS_VIDEOS_SECAO.secao_1 !== undefined);

  const sec1SummarySpec = SECTION_VIDEO_SUMMARIES[0];
  const shortFail = evaluateSectionSummaryText('bom dia', sec1SummarySpec);
  assert.equal(shortFail.valid, false);

  const validSummary = evaluateSectionSummaryText(
    'Aprendi os cumprimentos em Libras: oi, bom dia, boa tarde e boa noite, cuidando da expressão facial.',
    sec1SummarySpec
  );
  assert.equal(validSummary.valid, true);
});

test('20. Controle de Ofensiva reconcilia dias perdidos, usa congelamento e incrementa por dia calendário', () => {
  assert.equal(diffCalendarDays('2026-11-20', '2026-11-21'), 1);

  const keptYesterday = reconcileStreakOnLoad(5, '2026-11-24', '2026-11-25', 1);
  assert.equal(keptYesterday.streakDays, 5);
  assert.equal(keptYesterday.streakFreezeCount, 1);

  const frozeOneDayGap = reconcileStreakOnLoad(5, '2026-11-23', '2026-11-25', 1);
  assert.equal(frozeOneDayGap.streakDays, 5);
  assert.equal(frozeOneDayGap.streakFreezeCount, 0);

  const resetWithoutFreeze = reconcileStreakOnLoad(5, '2026-11-22', '2026-11-25', 0);
  assert.equal(resetWithoutFreeze.streakDays, 0);

  assert.equal(computeNextStreakOnPractice(5, '2026-11-24', '2026-11-25'), 6);
  assert.equal(computeNextStreakOnPractice(5, '2026-11-25', '2026-11-25'), 5);
  assert.equal(computeNextStreakOnPractice(0, null, '2026-11-25'), 1);
});

test('21. Loja (NameTAG, Presets Visuais, Classes) sem emojis e 18 notificações engraçadas de inatividade (24h/48h/72h) estão completos', () => {
  assert.equal(NOTIFICACOES_AMEACA_EXTREMA_LIBRAS.length, 18);
  for (const item of NOTIFICACOES_AMEACA_EXTREMA_LIBRAS) {
    assert.ok(item.titulo.length > 0 && item.corpo.length > 0);
  }
  assert.equal(getInactivityTierForElapsedMs(10 * 3_600_000), null);
  assert.equal(getInactivityTierForElapsedMs(24 * 3_600_000), 24);
  assert.equal(getInactivityTierForElapsedMs(48 * 3_600_000), 48);
  assert.equal(getInactivityTierForElapsedMs(72 * 3_600_000), 72);

  const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

  assert.equal(NAMETAG_CATALOG.length, 6);
  assert.equal(NAMETAG_CATALOG[0].price, 0);
  for (const tag of NAMETAG_CATALOG) {
    assert.equal(emojiRegex.test(tag.badgeIcon), false, `NameTAG ${tag.id} não deve usar emoji`);
    assert.equal(emojiRegex.test(tag.name), false);
  }

  assert.equal(NAMETAG_IMAGE_PRESETS.length, 6);
  for (const preset of NAMETAG_IMAGE_PRESETS) {
    assert.ok(preset.id.startsWith('preset:'));
    assert.equal(emojiRegex.test(preset.label), false);
  }

  assert.equal(PLAYER_CLASSES_CATALOG.length, 6);
  assert.equal(PLAYER_CLASSES_CATALOG[0].price, 0);
  for (const cls of PLAYER_CLASSES_CATALOG) {
    assert.equal(emojiRegex.test(cls.icon), false, `Classe ${cls.id} não deve usar emoji`);
    assert.equal(emojiRegex.test(cls.name), false);
  }
});

test('22. Perguntas de parâmetros/expressão facial foram removidas e perfil padrão inicia zerado', () => {
  for (let section = 1; section <= TRACK_STRUCTURE.sections; section++) {
    for (let stage = 1; stage <= 3; stage++) {
      for (let act = 1; act <= TRACK_STRUCTURE.activitiesPerStage; act++) {
        const exercises = getExercisesForActivity(section, stage, act);
        for (const ex of exercises) {
          assert.notEqual(ex.type, 'parameter_quiz');
          assert.notEqual(ex.type, 'nmf_facial_quiz');
        }
      }
    }
  }

  assert.equal(DEFAULT_PROFILE.xp, 0);
  assert.equal(DEFAULT_PROFILE.gems, 0);
  assert.equal(DEFAULT_PROFILE.streakDays, 0);
  assert.equal(DEFAULT_PROFILE.completedNodeIds.length, 0);
  assert.equal(DEFAULT_PROFILE.learnedSignIds.length, 0);
  assert.equal(DEFAULT_PROFILE.viewedSignIds.length, 0);
  assert.equal(DEFAULT_PROFILE.favoriteSignIds.length, 0);
  assert.equal(DEFAULT_PROFILE.currentLeague, 'Bronze');
  assert.equal(DEFAULT_PROFILE.hasActiveStreakFreeze, false);
  assert.equal(DEFAULT_PROFILE.streakFreezeCount, 0);
  assert.equal(LIBRAS_ACHIEVEMENTS[0].currentProgress, 0);
});

