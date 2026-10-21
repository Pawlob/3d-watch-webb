import {
  ModelTransform,
  SectionKeyframe,
  getSectionModelTransform,
  getSectionModelVisibility,
} from '../types/builder';

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Calculates interpolated 3D transform for a given normalized scroll progress (0 to 1)
 */
export function getInterpolatedTransform(
  sections: SectionKeyframe[],
  progress: number
): ModelTransform {
  if (!sections || sections.length === 0) {
    return { scale: 69, position: [0.33, -3.5, -0.645], rotation: [-0.57, 3.17, -0.03] };
  }

  if (sections.length === 1) {
    return sections[0].modelTransform;
  }

  // Clamp progress between 0 and 1
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const segmentCount = sections.length - 1;
  const scaledProgress = clampedProgress * segmentCount;

  const segmentIndex = Math.min(Math.floor(scaledProgress), segmentCount - 1);
  const rawT = scaledProgress - segmentIndex;
  const t = easeInOutCubic(rawT);

  const fromTransform = sections[segmentIndex].modelTransform;
  const toTransform = sections[segmentIndex + 1].modelTransform;

  return {
    scale: lerp(fromTransform.scale, toTransform.scale, t),
    position: [
      lerp(fromTransform.position[0], toTransform.position[0], t),
      lerp(fromTransform.position[1], toTransform.position[1], t),
      lerp(fromTransform.position[2], toTransform.position[2], t),
    ],
    rotation: [
      lerp(fromTransform.rotation[0], toTransform.rotation[0], t),
      lerp(fromTransform.rotation[1], toTransform.rotation[1], t),
      lerp(fromTransform.rotation[2], toTransform.rotation[2], t),
    ],
  };
}

/**
 * Calculates interpolated 3D transform and visibility for a specific model ID across sections
 */
export function getInterpolatedModelTransform(
  sections: SectionKeyframe[],
  progress: number,
  modelId: string,
  modelIndex = 0
): { transform: ModelTransform; isVisible: boolean } {
  if (!sections || sections.length === 0) {
    return {
      transform: { scale: 69, position: [0.33, -3.5, -0.645], rotation: [-0.57, 3.17, -0.03] },
      isVisible: true,
    };
  }

  const clampedProgress = Math.max(0, Math.min(1, progress));
  if (sections.length === 1) {
    const t = getSectionModelTransform(sections[0], modelId, modelIndex);
    const vis = getSectionModelVisibility(sections[0], modelId);
    return { transform: t, isVisible: vis };
  }

  const segmentCount = sections.length - 1;
  const scaledProgress = clampedProgress * segmentCount;
  const segmentIndex = Math.min(Math.floor(scaledProgress), segmentCount - 1);
  const rawT = scaledProgress - segmentIndex;
  const t = easeInOutCubic(rawT);

  const fromSection = sections[segmentIndex];
  const toSection = sections[segmentIndex + 1];

  const fromTransform = getSectionModelTransform(fromSection, modelId, modelIndex);
  const toTransform = getSectionModelTransform(toSection, modelId, modelIndex);

  const fromVis = getSectionModelVisibility(fromSection, modelId);
  const toVis = getSectionModelVisibility(toSection, modelId);

  // If one of the keyframes is hidden, smoothly fade/scale out or in
  const effectiveFromScale = fromVis ? Math.max(0, fromTransform.scale) : 0;
  const effectiveToScale = toVis ? Math.max(0, toTransform.scale) : 0;

  const interpolatedScale = lerp(effectiveFromScale, effectiveToScale, t);

  return {
    transform: {
      scale: interpolatedScale,
      position: [
        lerp(fromTransform.position[0], toTransform.position[0], t),
        lerp(fromTransform.position[1], toTransform.position[1], t),
        lerp(fromTransform.position[2], toTransform.position[2], t),
      ],
      rotation: [
        lerp(fromTransform.rotation[0], toTransform.rotation[0], t),
        lerp(fromTransform.rotation[1], toTransform.rotation[1], t),
        lerp(fromTransform.rotation[2], toTransform.rotation[2], t),
      ],
    },
    isVisible: interpolatedScale > 0.05,
  };
}
