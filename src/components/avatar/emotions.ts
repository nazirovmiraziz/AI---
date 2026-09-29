import type { PoseDelta } from "./pose";

export const EMOTIONS = [
  "neutral",
  "happy",
  "excited",
  "thinking",
  "explaining",
  "confused",
  "surprised",
  "worried",
  "sad",
  "encouraging",
  "proud",
  "celebrating",
  "listening",
  "greeting",
  "goodbye",
] as const;

export type Emotion = (typeof EMOTIONS)[number];

export function isEmotion(v: unknown): v is Emotion {
  return typeof v === "string" && (EMOTIONS as readonly string[]).includes(v);
}

/** Offsets from the base pose at full intensity. Add a new emotion by adding one entry. */
export const EMOTION_POSES: Record<Emotion, PoseDelta> = {
  neutral: { smile: 0.12 },
  happy: {
    smile: 0.95, eyeSmile: 0.75, eyeOpen: -0.08, browY: 0.25, headRoll: 0.06, headPitch: -0.04,
    bodyPitch: -0.02, glow: 0.25, hue: -0.25, energy: 0.3,
  },
  excited: {
    smile: 1, mouth: 0.35, eyeOpen: 0.18, pupil: 0.18, browY: 0.5, headPitch: -0.1, bodyPitch: -0.05,
    lShoulderRoll: 0.2, rShoulderRoll: 0.2, glow: 0.45, hue: -0.35, energy: 0.8,
  },
  thinking: {
    smile: -0.05, mouthW: -0.25, eyeOpen: -0.12, browY: 0.1, browTilt: -0.25, gazeX: 0.45, gazeY: 0.55,
    headRoll: 0.12, headYaw: 0.14, headPitch: -0.08, bodyYaw: 0.05, hue: 0.4, energy: -0.3,
  },
  explaining: {
    smile: 0.35, browY: 0.15, eyeOpen: 0.04, headPitch: 0.02, bodyPitch: 0.04, lElbow: 0.2, rElbow: 0.2,
    glow: 0.1, energy: 0.2,
  },
  confused: {
    smile: -0.2, mouthW: -0.3, browTilt: 0.35, browY: 0.1, headRoll: -0.22, headYaw: -0.1, gazeX: -0.3,
    gazeY: 0.2, hue: 0.2, energy: -0.1,
  },
  surprised: {
    eyeOpen: 0.35, pupil: -0.2, browY: 0.8, mouth: 0.55, mouthW: -0.35, smile: 0.1, headPitch: -0.12,
    bodyPitch: -0.08, lShoulderRoll: 0.15, rShoulderRoll: 0.15, glow: 0.35, energy: 0.2,
  },
  worried: {
    smile: -0.35, browTilt: 0.7, browY: 0.15, eyeOpen: 0.05, headPitch: 0.08, headRoll: 0.06, bodyPitch: 0.06,
    gazeY: -0.15, hue: 0.3, glow: -0.1, energy: -0.3,
  },
  sad: {
    smile: -0.7, browTilt: 0.8, eyeOpen: -0.25, headPitch: 0.2, bodyPitch: 0.1, gazeY: -0.45,
    lShoulderRoll: -0.05, rShoulderRoll: -0.05, hue: 0.55, glow: -0.3, energy: -0.6,
  },
  encouraging: {
    smile: 0.7, eyeSmile: 0.45, browTilt: 0.2, browY: 0.2, headRoll: 0.12, headPitch: 0.04,
    bodyPitch: 0.06, glow: 0.15, hue: -0.1, energy: 0.1,
  },
  proud: {
    smile: 0.85, eyeSmile: 0.6, eyeOpen: -0.1, browY: 0.2, headPitch: -0.14, bodyPitch: -0.07, bodyY: 0.02,
    lShoulderRoll: 0.08, rShoulderRoll: 0.08, glow: 0.3, hue: -0.3, energy: 0.2,
  },
  celebrating: {
    smile: 1, mouth: 0.45, eyeSmile: 0.8, browY: 0.5, headPitch: -0.12, bodyPitch: -0.06,
    glow: 0.6, hue: -0.45, energy: 1,
  },
  listening: {
    smile: 0.22, eyeOpen: 0.08, browY: 0.12, headRoll: 0.1, headPitch: 0.05, bodyPitch: 0.07,
    glow: 0.05, energy: -0.2,
  },
  greeting: {
    smile: 0.9, eyeSmile: 0.6, browY: 0.35, headRoll: 0.08, headPitch: -0.05, glow: 0.3, hue: -0.2, energy: 0.4,
  },
  goodbye: {
    smile: 0.6, eyeSmile: 0.5, browTilt: 0.2, headRoll: 0.1, headPitch: 0.04, glow: 0.1, energy: 0,
  },
};

/** Gesture played automatically when an emotion is entered (optional). */
export const EMOTION_GESTURE: Partial<Record<Emotion, string>> = {
  happy: "nod",
  excited: "bounce",
  confused: "shrug",
  surprised: "startle",
  encouraging: "thumbsUp",
  proud: "thumbsUp",
  celebrating: "celebrate",
  greeting: "wave",
  goodbye: "goodbye",
  thinking: "think",
};
