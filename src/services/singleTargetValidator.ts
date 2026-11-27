import { TargetArticulationZone, TargetLandmarks } from '../data/librasCatalog255';
import { clamp01, dist2D, extractFaceExpressions, extractHandGeometry } from './multimodalGeometry';
import { HandednessLabel, HandGeometryFeatures } from '../types/librasRecognition';

export interface RecentHandSample {
  x: number;
  y: number;
  z?: number;
  t: number;
}

export interface SingleTargetValidationResult {
  qualityPercent: number;
  handshapeScore: number;
  locationScore: number;
  stabilityScore: number;
  nmfScore: number;
  detectedHands: boolean;
  detectedFace: boolean;
  passed: boolean;
  tip: string;
  phaseIndex?: number;
  totalPhases?: number;
  phaseLabel?: string;
  phaseJustAdvanced?: boolean;
}

export interface PhaseTrackerState {
  phaseIndex: number;
  phaseStartedAt: number;
}

export function createPhaseTrackerState(): PhaseTrackerState {
  return { phaseIndex: 0, phaseStartedAt: 0 };
}

function scoreRange(value: number, [min, max]: [number, number], softMargin = 0.55): number {
  if (value >= min && value <= max) return 1;
  const dist = value < min ? min - value : value - max;
  return clamp01(1 - dist / softMargin);
}

function getZoneTip(zone: TargetArticulationZone): string {
  switch (zone) {
    case 'chin':
      return 'Posicione a mão próxima ao queixo.';
    case 'forehead':
      return 'Leve a mão até a altura da testa.';
    case 'nose_mouth':
      return 'Posicione a mão próxima à boca ou ao nariz.';
    case 'ear':
      return 'Aproxime a mão da altura da orelha.';
    case 'eye_cheek':
      return 'Posicione a mão na lateral do rosto (olho/bochecha).';
    case 'chest':
      return 'Traga a mão para a região do peito.';
    case 'shoulder':
      return 'Posicione a mão na altura do ombro, ao lado do rosto.';
    case 'neutral_space':
    default:
      return 'Posicione a mão no espaço neutro à frente do corpo.';
  }
}

export const SINGLE_TARGET_PASS_THRESHOLD = 74;

function scoreSingleHandshape(
  geo: HandGeometryFeatures,
  target: TargetLandmarks,
  forgiving = true
): { score: number; fingerTip: string | null } {
  const thumbMargin = forgiving ? 0.28 : 0.23;
  const fingerMargin = forgiving ? 0.25 : 0.21;
  const thumbDistMargin = forgiving ? 0.30 : 0.25;
  const minDistMargin = forgiving ? 0.30 : 0.25;
  const spreadMargin = forgiving ? 12 : 9;

  const thumbScore = scoreRange(geo.fingers.thumb.extensionScore, target.fingers.thumb, thumbMargin);
  const indexScore = scoreRange(geo.fingers.index.extensionScore, target.fingers.index, fingerMargin);
  const middleScore = scoreRange(geo.fingers.middle.extensionScore, target.fingers.middle, fingerMargin);
  const ringScore = scoreRange(geo.fingers.ring.extensionScore, target.fingers.ring, fingerMargin);
  const pinkyScore = scoreRange(geo.fingers.pinky.extensionScore, target.fingers.pinky, fingerMargin);

  let fingerWeighted =
    thumbScore * 0.18 +
    indexScore * 0.24 +
    middleScore * 0.22 +
    ringScore * 0.18 +
    pinkyScore * 0.18;

  const penalties: number[] = [];
  if (typeof target.maxThumbIndexTipDist === 'number') {
    const excess = Math.max(0, geo.normalizedTipDistances.thumbToIndexTip - target.maxThumbIndexTipDist);
    penalties.push(clamp01(1 - excess / thumbDistMargin));
  }
  if (typeof target.minThumbIndexTipDist === 'number') {
    const deficit = Math.max(0, target.minThumbIndexTipDist - geo.normalizedTipDistances.thumbToIndexTip);
    penalties.push(clamp01(1 - deficit / minDistMargin));
  }
  if (typeof target.minIndexMiddleSpread === 'number') {
    const deficit = Math.max(0, target.minIndexMiddleSpread - geo.spreadAnglesDeg.indexMiddle);
    penalties.push(clamp01(1 - deficit / spreadMargin));
  }
  if (typeof target.maxIndexMiddleSpread === 'number') {
    const excess = Math.max(0, geo.spreadAnglesDeg.indexMiddle - target.maxIndexMiddleSpread);
    penalties.push(clamp01(1 - excess / spreadMargin));
  }

  if (penalties.length > 0) {
    const constraintAvg = penalties.reduce((acc, v) => acc + v, 0) / penalties.length;
    fingerWeighted = fingerWeighted * 0.72 + constraintAvg * 0.28;
    if (constraintAvg < 0.38) {
      fingerWeighted = Math.min(fingerWeighted, 0.56);
    }
  }

  // Strong mismatch on core fingers (and strict thumb targets) caps score so wrong handshapes cannot pass
  const thumbStrict = target.fingers.thumb[0] >= 0.55 || target.fingers.thumb[1] <= 0.45;
  const minCore = thumbStrict
    ? Math.min(thumbScore, indexScore, middleScore, ringScore, pinkyScore)
    : Math.min(indexScore, middleScore, ringScore, pinkyScore);
  if (minCore < 0.30) {
    fingerWeighted = Math.min(fingerWeighted, 0.44);
  } else if (minCore < 0.48) {
    fingerWeighted = Math.min(fingerWeighted, 0.62);
  }

  let fingerTip: string | null = null;
  if (fingerWeighted < 0.74) {
    const fingerScores: Array<[string, number]> = [
      ['polegar', thumbScore],
      ['indicador', indexScore],
      ['dedo médio', middleScore],
      ['anelar', ringScore],
      ['dedo mínimo', pinkyScore]
    ];
    fingerScores.sort((a, b) => a[1] - b[1]);
    fingerTip = `Ajuste a posição do ${fingerScores[0][0]} conforme o modelo.`;
  }

  return { score: clamp01(fingerWeighted), fingerTip };
}

function scoreArticulationZone(
  geo: HandGeometryFeatures,
  zone: TargetArticulationZone,
  faceLandmarks?: { x: number; y: number; z?: number }[]
): { score: number; detectedFace: boolean } {
  const detectedFace = Boolean(faceLandmarks && faceLandmarks.length >= 455);
  const handPt = geo.handCenter;
  const wristPt = geo.landmarks[0] || handPt;
  const indexTip = geo.landmarks[8] || handPt;
  const middleTip = geo.landmarks[12] || handPt;
  const thumbTip = geo.landmarks[4] || handPt;
  const probeY = (handPt.y + wristPt.y) * 0.5;
  const probeX = (handPt.x + wristPt.x) * 0.5;
  const probePt = { x: probeX, y: probeY };

  const forehead = detectedFace && faceLandmarks![10] ? faceLandmarks![10] : { x: 0.5, y: 0.21 };
  const nose = detectedFace && faceLandmarks![1] ? faceLandmarks![1] : { x: 0.5, y: 0.35 };
  const mouth = detectedFace && faceLandmarks![13] ? faceLandmarks![13] : { x: 0.5, y: 0.41 };
  const chin = detectedFace && faceLandmarks![152] ? faceLandmarks![152] : { x: 0.5, y: 0.46 };
  const leftCheek = detectedFace && faceLandmarks![234] ? faceLandmarks![234] : { x: 0.40, y: 0.35 };
  const rightCheek = detectedFace && faceLandmarks![454] ? faceLandmarks![454] : { x: 0.60, y: 0.35 };

  const faceHeight = Math.max(0.14, Math.abs(chin.y - forehead.y));
  const faceWidth = Math.max(0.12, Math.abs(rightCheek.x - leftCheek.x));
  const horizScale = detectedFace ? faceWidth * 1.25 : faceWidth * 1.85;

  if (zone === 'neutral_space') {
    const minX = 0.08;
    const maxX = 0.92;
    const minY = detectedFace ? chin.y - 0.35 * faceHeight : 0.08;
    const maxY = detectedFace ? Math.min(0.98, chin.y + 2.4 * faceHeight) : 0.96;

    const outX = probeX < minX ? minX - probeX : probeX > maxX ? probeX - maxX : 0;
    const outY = probeY < minY ? minY - probeY : probeY > maxY ? probeY - maxY : 0;
    const outDist = Math.hypot(outX / 0.16, outY / 0.18);
    if (outDist === 0) return { score: 0.96, detectedFace };
    return { score: clamp01(0.94 - outDist * 0.45), detectedFace };
  }

  if (zone === 'shoulder') {
    const minLateral = faceWidth * 0.28;
    const maxLateral = faceWidth * 2.35;
    const minY = forehead.y - 0.22 * faceHeight;
    const maxY = chin.y + 1.15 * faceHeight;

    const bestScore = Math.max(
      ...[probePt, handPt].map((pt) => {
        const dx = Math.abs(pt.x - nose.x);
        const lateralScore = !detectedFace
          ? 0.9
          : dx >= minLateral && dx <= maxLateral
          ? 1
          : dx < minLateral
          ? clamp01(1 - (minLateral - dx) / (faceWidth * 0.65))
          : clamp01(1 - (dx - maxLateral) / (faceWidth * 0.85));

        const vertScore =
          pt.y >= minY && pt.y <= maxY
            ? 1
            : pt.y < minY
            ? clamp01(1 - (minY - pt.y) / (faceHeight * 0.72))
            : clamp01(1 - (pt.y - maxY) / (faceHeight * 0.78));

        return clamp01(lateralScore * 0.45 + vertScore * 0.55);
      })
    );

    return { score: bestScore, detectedFace };
  }

  if (zone === 'chest') {
    const targetPt = { x: nose.x, y: chin.y + faceHeight * 0.85 };
    const bestDist = Math.min(
      ...[probePt, handPt, wristPt].map((pt) => {
        const dx = Math.abs(pt.x - targetPt.x) / (horizScale * 1.15);
        const dy = Math.abs(pt.y - targetPt.y) / (faceHeight * 0.95);
        return Math.hypot(dx, dy);
      })
    );
    return { score: clamp01(1.06 - Math.max(0, bestDist - 0.26) * 0.68), detectedFace };
  }

  if (zone === 'ear') {
    const leftEarPt = { x: leftCheek.x - faceWidth * 0.16, y: nose.y };
    const rightEarPt = { x: rightCheek.x + faceWidth * 0.16, y: nose.y };
    const candidates = [probePt, handPt, indexTip, middleTip, thumbTip];
    const minDist = Math.min(
      ...candidates.flatMap((pt) => [
        dist2D(pt, leftCheek) / Math.max(faceHeight, faceWidth),
        dist2D(pt, rightCheek) / Math.max(faceHeight, faceWidth),
        dist2D(pt, leftEarPt) / Math.max(faceHeight, faceWidth),
        dist2D(pt, rightEarPt) / Math.max(faceHeight, faceWidth)
      ])
    );
    return { score: clamp01(1.06 - Math.max(0, minDist - 0.28) * 0.66), detectedFace };
  }

  if (zone === 'eye_cheek') {
    const anchorL = { x: nose.x - faceWidth * 0.36, y: nose.y };
    const anchorR = { x: nose.x + faceWidth * 0.36, y: nose.y };
    const candidates = [probePt, handPt, indexTip, middleTip, thumbTip];
    const minDist = Math.min(
      ...candidates.flatMap((pt) => [
        dist2D(pt, anchorL) / faceHeight,
        dist2D(pt, anchorR) / faceHeight
      ])
    );
    return { score: clamp01(1.06 - Math.max(0, minDist - 0.28) * 0.66), detectedFace };
  }

  let anchor = chin;
  let tolerance = faceHeight * 0.54;
  const candidatePoints = [probePt, handPt, indexTip, middleTip, thumbTip];

  if (zone === 'forehead') {
    anchor = forehead;
    tolerance = faceHeight * 0.44;
  } else if (zone === 'nose_mouth') {
    anchor = { x: (nose.x + mouth.x) * 0.5, y: (nose.y + mouth.y) * 0.5 };
    tolerance = faceHeight * 0.52;
  } else if (zone === 'chin') {
    anchor = { x: chin.x, y: (mouth.y + chin.y) * 0.52 };
    tolerance = faceHeight * 0.54;
  }

  const bestNormalizedDist = Math.min(
    ...candidatePoints.map((pt) => {
      const dx = (pt.x - anchor.x) / horizScale;
      const dy = (pt.y - anchor.y) / tolerance;
      return Math.hypot(dx, dy);
    })
  );

  return {
    score: clamp01(1.06 - Math.max(0, bestNormalizedDist - 0.22) * 0.82),
    detectedFace
  };
}

function getDynamicMotionTip(motionType: TargetLandmarks['motionType']): string {
  switch (motionType) {
    case 'wave':
      return 'Movimente a mão para os lados (aceno contínuo), sem deixá-la parada.';
    case 'forward':
      return 'Execute o deslocamento da mão para frente a partir do ponto de articulação.';
    case 'downward':
      return 'Movimente a mão suavemente para baixo concluindo o trajeto.';
    case 'vertical':
      return 'Movimente a mão para cima e para baixo conforme o modelo.';
    case 'circular':
      return 'Descreva um movimento circular contínuo com a mão.';
    case 'static':
    case 'tap':
    default:
      return 'Mantenha a mão firme por um instante.';
  }
}

function scoreStabilityAndMotion(
  motionType: TargetLandmarks['motionType'],
  recentCenters: RecentHandSample[]
): number {
  const isStaticLike = motionType === 'static' || motionType === 'tap';
  if (recentCenters.length < 3) {
    return isStaticLike ? 0.58 : 0.22;
  }

  const latestT = recentCenters[recentCenters.length - 1].t;
  const windowed = isStaticLike
    ? recentCenters.filter((s) => latestT - s.t <= 480)
    : recentCenters;
  const samples = windowed.length >= 2 ? windowed : recentCenters;

  let path = 0;
  let pathX = 0;
  let pathY = 0;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  let lastXDir = 0;
  let xReversals = 0;
  let lastYDir = 0;
  let yReversals = 0;

  for (let i = 0; i < samples.length; i++) {
    const pt = samples[i];
    const z = pt.z ?? 0;
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
    if (i > 0) {
      const prev = samples[i - 1];
      const dx = pt.x - prev.x;
      const dy = pt.y - prev.y;
      const dz = (pt.z ?? 0) - (prev.z ?? 0);
      path += Math.hypot(dx, dy, dz * 0.85);
      pathX += Math.abs(dx);
      pathY += Math.abs(dy);

      if (Math.abs(dx) >= 0.006) {
        const dir = dx > 0 ? 1 : -1;
        if (lastXDir !== 0 && dir !== lastXDir) {
          xReversals += 1;
        }
        lastXDir = dir;
      }
      if (Math.abs(dy) >= 0.006) {
        const dirY = dy > 0 ? 1 : -1;
        if (lastYDir !== 0 && dirY !== lastYDir) {
          yReversals += 1;
        }
        lastYDir = dirY;
      }
    }
  }

  const first = samples[0];
  const last = samples[samples.length - 1];
  const netDx = last.x - first.x;
  const netDy = last.y - first.y;
  const netDz = (last.z ?? 0) - (first.z ?? 0);
  const netDist = Math.hypot(netDx, netDy, netDz * 0.85);

  const spanX = maxX - minX;
  const spanY = maxY - minY;
  const spanZ = maxZ - minZ;

  if (isStaticLike) {
    return clamp01(1 - Math.max(0, path - 0.12) / 0.34);
  }

  if (motionType === 'wave') {
    if (spanX >= 0.052 && xReversals >= 1 && pathX >= 0.080) {
      return clamp01(0.84 + Math.min(0.16, (spanX - 0.05) * 2.2));
    }
    if (spanX >= 0.036 || pathX >= 0.055) {
      return 0.58;
    }
    return 0.24;
  }

  if (motionType === 'forward') {
    if (spanZ >= 0.045 || netDist >= 0.050 || path >= 0.065) {
      return clamp01(0.82 + Math.min(0.18, Math.max(spanZ, netDist, path) * 1.4));
    }
    if (Math.max(spanX, spanY, spanZ) >= 0.028 || path >= 0.038) {
      return 0.54;
    }
    return 0.24;
  }

  if (motionType === 'downward') {
    if ((netDy >= 0.028 && spanY >= 0.040) || (spanY >= 0.055 && pathY >= 0.062)) {
      return clamp01(0.82 + Math.min(0.18, spanY * 1.8));
    }
    if (spanY >= 0.030 || pathY >= 0.038) {
      return 0.54;
    }
    return 0.24;
  }

  if (motionType === 'vertical') {
    if (spanY >= 0.048 && (yReversals >= 1 || pathY >= 0.068)) {
      return clamp01(0.82 + Math.min(0.18, spanY * 1.8));
    }
    if (spanY >= 0.030 || pathY >= 0.038) {
      return 0.55;
    }
    return 0.24;
  }

  if (motionType === 'circular') {
    if ((spanX >= 0.038 && spanY >= 0.038) || (path >= 0.075 && Math.min(spanX, spanY) >= 0.024)) {
      return clamp01(0.82 + Math.min(0.18, path * 1.5));
    }
    if (Math.max(spanX, spanY) >= 0.026 && path >= 0.040) {
      return 0.54;
    }
    return 0.24;
  }

  return 0.24;
}

function scoreNonManualExpression(
  expectedNmf: TargetLandmarks['expectedNmf'],
  faceLandmarks?: { x: number; y: number; z?: number }[],
  faceBlendshapes?: { categories?: { categoryName: string; score: number }[] }[]
): { score: number; tip?: string } {
  const nmfMode = expectedNmf ?? 'neutral';
  const face = extractFaceExpressions(faceLandmarks, faceBlendshapes);

  if (!face.detected) {
    // Allow fallback when camera doesn't capture face, but avoid passing non-neutral NMF too easily
    return { score: nmfMode === 'neutral' ? 0.85 : 0.64 };
  }

  if (nmfMode === 'interrogative_brows_up') {
    const signal = Math.max(face.browRaiseScore, face.headPitchDeg > 4 ? 0.68 : 0);
    if (signal >= 0.28) return { score: clamp01(0.75 + signal * 0.25) };
    return {
      score: clamp01(0.6 + signal * 0.6),
      tip: 'Levante levemente as sobrancelhas para marcar a pergunta.'
    };
  }

  if (nmfMode === 'wh_brows_furrowed') {
    const signal = Math.max(face.browFurrowScore, Math.abs(face.headYawDeg) > 10 ? 0.72 : 0);
    if (signal >= 0.25) return { score: clamp01(0.75 + signal * 0.25) };
    return {
      score: clamp01(0.62 + signal * 0.6),
      tip: 'Franza levemente as sobrancelhas ou negue com a cabeça.'
    };
  }

  if (nmfMode === 'positive_smile') {
    if (face.smileScore >= 0.25) return { score: clamp01(0.8 + face.smileScore * 0.2) };
    return { score: clamp01(0.75 + face.smileScore * 0.4) };
  }

  return { score: 0.96 };
}

export function evaluateSingleTargetSign(params: {
  target: TargetLandmarks;
  handLandmarks: { x: number; y: number; z?: number }[][];
  worldLandmarks?: { x: number; y: number; z?: number }[][];
  handednesses?: HandednessLabel[];
  faceLandmarks?: { x: number; y: number; z?: number }[];
  faceBlendshapes?: { categories?: { categoryName: string; score: number }[] }[];
  recentCenters?: RecentHandSample[];
  forgiving?: boolean;
}): SingleTargetValidationResult {
  const {
    target,
    handLandmarks,
    worldLandmarks,
    handednesses = [],
    faceLandmarks,
    faceBlendshapes,
    recentCenters = [],
    forgiving = true
  } = params;

  if (!handLandmarks || handLandmarks.length === 0 || handLandmarks[0].length < 21) {
    return {
      qualityPercent: 0,
      handshapeScore: 0,
      locationScore: 0,
      stabilityScore: 0,
      nmfScore: 0,
      detectedHands: false,
      detectedFace: Boolean(faceLandmarks && faceLandmarks.length >= 455),
      passed: false,
      tip: 'Mostre sua mão diante da câmera para iniciar.'
    };
  }

  if (target.twoHanded === 2 && handLandmarks.length < 2) {
    const primary = extractHandGeometry(
      handLandmarks[0],
      handednesses[0] || 'Unknown',
      worldLandmarks?.[0]
    );
    const hsEval = scoreSingleHandshape(primary, target, forgiving);
    const loc = scoreArticulationZone(primary, target.articulationZone, faceLandmarks);
    const qualityPercent = Math.min(64, Math.round((hsEval.score * 0.45 + loc.score * 0.35 + 0.4 * 0.2) * 100));
    return {
      qualityPercent,
      handshapeScore: Math.round(hsEval.score * 100),
      locationScore: Math.round(loc.score * 100),
      stabilityScore: 40,
      nmfScore: 80,
      detectedHands: true,
      detectedFace: loc.detectedFace,
      passed: false,
      tip: 'Este sinal usa as duas mãos. Mostre ambas na câmera.'
    };
  }

  let bestHandshape = 0;
  let bestFingerTip: string | null = null;
  let bestLocation = 0;
  let detectedFace = false;

  handLandmarks.forEach((rawPts, idx) => {
    if (rawPts.length < 21) return;
    const geo = extractHandGeometry(
      rawPts,
      handednesses[idx] || 'Unknown',
      worldLandmarks?.[idx]
    );
    const hsEval = scoreSingleHandshape(geo, target, forgiving);
    const loc = scoreArticulationZone(geo, target.articulationZone, faceLandmarks);
    detectedFace = detectedFace || loc.detectedFace;

    if (hsEval.score * 0.6 + loc.score * 0.4 >= bestHandshape * 0.6 + bestLocation * 0.4) {
      bestHandshape = hsEval.score;
      bestFingerTip = hsEval.fingerTip;
      bestLocation = loc.score;
    }
  });

  const stability = scoreStabilityAndMotion(target.motionType, recentCenters);
  const nmfEval = scoreNonManualExpression(target.expectedNmf, faceLandmarks, faceBlendshapes);

  const hasExplicitNmf = Boolean(target.expectedNmf && target.expectedNmf !== 'neutral');
  const isDynamicMotion = target.motionType !== 'static' && target.motionType !== 'tap';

  let overall = hasExplicitNmf
    ? bestHandshape * 0.47 + bestLocation * 0.25 + stability * 0.16 + nmfEval.score * 0.12
    : bestHandshape * 0.52 + bestLocation * 0.26 + stability * 0.22;

  // Guardrails: reject wrong handshape, wrong location, or frozen hand on dynamic signs
  if (bestHandshape < 0.62) {
    overall = Math.min(overall, 0.60);
  }
  if (bestLocation < 0.56) {
    overall = Math.min(overall, 0.64);
  }
  if (isDynamicMotion && stability < 0.48) {
    overall = Math.min(overall, 0.58);
  }

  const qualityPercent = Math.round(clamp01(overall) * 100);
  const passed = qualityPercent >= SINGLE_TARGET_PASS_THRESHOLD;

  let tip = 'Excelente! Mantenha o sinal por um instante.';
  if (!passed) {
    if (bestHandshape < 0.74) {
      tip = bestFingerTip || 'Ajuste a configuração dos dedos conforme o modelo.';
    } else if (bestLocation < 0.68) {
      tip = getZoneTip(target.articulationZone);
    } else if (isDynamicMotion && stability < 0.68) {
      tip = getDynamicMotionTip(target.motionType);
    } else if (hasExplicitNmf && nmfEval.score < 0.74 && nmfEval.tip) {
      tip = nmfEval.tip;
    } else if (stability < 0.68) {
      tip = getDynamicMotionTip(target.motionType);
    } else {
      tip = 'Quase lá! Ajuste levemente a posição da mão.';
    }
  }

  return {
    qualityPercent,
    handshapeScore: Math.round(bestHandshape * 100),
    locationScore: Math.round(bestLocation * 100),
    stabilityScore: Math.round(stability * 100),
    nmfScore: Math.round(nmfEval.score * 100),
    detectedHands: true,
    detectedFace,
    passed,
    tip
  };
}

export function evaluateTargetWithSequence(params: {
  target: TargetLandmarks;
  tracker: PhaseTrackerState;
  handLandmarks: { x: number; y: number; z?: number }[][];
  worldLandmarks?: { x: number; y: number; z?: number }[][];
  handednesses?: HandednessLabel[];
  faceLandmarks?: { x: number; y: number; z?: number }[];
  faceBlendshapes?: { categories?: { categoryName: string; score: number }[] }[];
  recentCenters?: RecentHandSample[];
  timestampMs?: number;
}): SingleTargetValidationResult {
  const { target, tracker, timestampMs = Date.now(), ...rest } = params;
  const phases = target.motionPhases;

  if (!phases || phases.length <= 1) {
    const single = evaluateSingleTargetSign({ target, ...rest });
    return {
      ...single,
      phaseIndex: 0,
      totalPhases: 1
    };
  }

  // Timeout guard: if stalled in phase > 0 for over 6 seconds without hands or completion, restart from phase 0
  if (
    tracker.phaseIndex > 0 &&
    tracker.phaseStartedAt > 0 &&
    timestampMs - tracker.phaseStartedAt > 6500
  ) {
    tracker.phaseIndex = 0;
    tracker.phaseStartedAt = timestampMs;
  }

  const safeIdx = Math.min(tracker.phaseIndex, phases.length - 1);
  const currentPhase = phases[safeIdx];

  const phaseTarget: TargetLandmarks = {
    ...target,
    handshapeId: currentPhase.handshapeId,
    fingers: currentPhase.fingers,
    maxThumbIndexTipDist: currentPhase.maxThumbIndexTipDist,
    minThumbIndexTipDist: currentPhase.minThumbIndexTipDist,
    minIndexMiddleSpread: currentPhase.minIndexMiddleSpread,
    maxIndexMiddleSpread: currentPhase.maxIndexMiddleSpread,
    articulationZone: currentPhase.articulationZone,
    motionType: currentPhase.motionType
  };

  const res = evaluateSingleTargetSign({ target: phaseTarget, forgiving: false, ...rest });

  if (safeIdx < phases.length - 1) {
    if (res.passed) {
      tracker.phaseIndex = safeIdx + 1;
      tracker.phaseStartedAt = timestampMs;
      const nextPhase = phases[tracker.phaseIndex];
      return {
        ...res,
        passed: false,
        phaseJustAdvanced: true,
        qualityPercent: Math.min(76, Math.round(res.qualityPercent * 0.78)),
        phaseIndex: tracker.phaseIndex,
        totalPhases: phases.length,
        phaseLabel: nextPhase.label,
        tip: `Etapa ${safeIdx + 1}/${phases.length} concluída! Agora faça: ${nextPhase.label}.`
      };
    }

    return {
      ...res,
      passed: false,
      qualityPercent: Math.round(res.qualityPercent * 0.65),
      phaseIndex: safeIdx,
      totalPhases: phases.length,
      phaseLabel: currentPhase.label,
      tip: res.detectedHands
        ? `Etapa ${safeIdx + 1}/${phases.length} (${currentPhase.label}): ${res.tip}`
        : `Etapa ${safeIdx + 1}/${phases.length}: mostre ${currentPhase.label}.`
    };
  }

  return {
    ...res,
    phaseIndex: safeIdx,
    totalPhases: phases.length,
    phaseLabel: currentPhase.label,
    tip: res.passed
      ? 'Movimento completo validado! Mantenha por 1 segundo.'
      : `Etapa ${safeIdx + 1}/${phases.length} (${currentPhase.label}): ${res.tip}`
  };
}

