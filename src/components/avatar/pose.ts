/**
 * A pose is a flat set of numeric channels. Every layer (emotion, idle, gestures, lip sync)
 * writes into the same channels, so new emotions or gestures never need renderer changes.
 * Angles are radians. Arm channels are relative to the rest pose (arms hanging down).
 */
export const POSE_KEYS = [
  "eyeOpen", // 1 = normal, 0 = closed
  "eyeSmile", // lower-lid arc, happy eyes
  "pupil", // pupil scale
  "browY", // light brows up (+) / down (-)
  "browTilt", // + = inner ends up (worried/sad), - = inner ends down (focused)
  "smile", // -1 frown .. 1 smile
  "mouth", // jaw open 0..1
  "mouthW", // mouth width multiplier offset
  "headPitch", // + = look down
  "headYaw",
  "headRoll",
  "bodyPitch", // + = lean forward
  "bodyYaw",
  "bodyRoll",
  "bodyY", // vertical offset
  "lShoulderPitch", // + = arm forward/up
  "lShoulderRoll", // + = arm out to the side
  "lElbow", // + = bend
  "lHand", // wrist roll
  "rShoulderPitch",
  "rShoulderRoll",
  "rElbow",
  "rHand",
  "gazeX", // -1..1
  "gazeY", // -1..1 (+ = up)
  "glow", // face light intensity multiplier offset
  "hue", // face light hue shift (-1 warm .. 1 cool)
  "energy", // idle motion amplitude
] as const;

export type PoseKey = (typeof POSE_KEYS)[number];
export type Pose = Record<PoseKey, number>;
export type PoseDelta = Partial<Pose>;

export function zeroPose(): Pose {
  const p = {} as Pose;
  for (const k of POSE_KEYS) p[k] = 0;
  return p;
}

export function basePose(): Pose {
  const p = zeroPose();
  p.eyeOpen = 1;
  p.pupil = 1;
  p.energy = 1;
  return p;
}

export function copyPose(to: Pose, from: Pose) {
  for (const k of POSE_KEYS) to[k] = from[k];
  return to;
}

export function addDelta(to: Pose, d: PoseDelta, w = 1) {
  for (const k in d) {
    const v = d[k as PoseKey];
    if (v !== undefined) to[k as PoseKey] += v * w;
  }
  return to;
}

/** Frame-rate independent exponential smoothing. */
export function damp(current: number, target: number, speed: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-speed * dt));
}

export function smooth01(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

export function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v;
}
