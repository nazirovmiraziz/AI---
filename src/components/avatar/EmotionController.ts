import { EMOTION_POSES, type Emotion } from "./emotions";
import { POSE_KEYS, zeroPose, type Pose, type PoseKey } from "./pose";

const FACE: ReadonlySet<PoseKey> = new Set<PoseKey>(["eyeOpen", "eyeSmile", "pupil", "browY", "browTilt", "smile", "mouth", "mouthW", "glow", "hue"]);

/** Smoothly blends between emotion poses. Output is an offset layer on top of the base pose. */
export class EmotionController {
  emotion: Emotion = "neutral";
  intensity = 1;
  private target: Pose = zeroPose();
  readonly current: Pose = zeroPose();

  constructor() {
    this.set("neutral", 1);
    for (const k of POSE_KEYS) this.current[k] = this.target[k];
  }

  set(emotion: Emotion, intensity = 1) {
    this.emotion = emotion;
    this.intensity = Math.min(1, Math.max(0, intensity));
    const src = EMOTION_POSES[emotion];
    for (const k of POSE_KEYS) this.target[k] = (src[k] ?? 0) * this.intensity;
  }

  update(dt: number) {
    for (const k of POSE_KEYS) {
      const speed = FACE.has(k) ? 6.5 : 3.2;
      this.current[k] += (this.target[k] - this.current[k]) * (1 - Math.exp(-speed * dt));
    }
    return this.current;
  }
}
