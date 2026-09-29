import { AnimationController, type PlayOptions } from "./AnimationController";
import { EMOTION_GESTURE, isEmotion, type Emotion } from "./emotions";
import { EmotionController } from "./EmotionController";
import { IdleAnimation } from "./IdleAnimation";
import { LipSyncController, type LipSyncSource } from "./LipSyncController";
import { addDelta, basePose, clamp, copyPose, damp, type Pose } from "./pose";
import type { AvatarReaction } from "./protocol";

export type AvatarMode = "idle" | "listening" | "thinking" | "typing" | "speaking";

export type AvatarState = { mode: AvatarMode; emotion: Emotion; enabled: boolean };

const MODE_EMOTION: Record<AvatarMode, [Emotion, number]> = {
  idle: ["neutral", 1],
  listening: ["listening", 0.9],
  thinking: ["thinking", 0.9],
  typing: ["explaining", 0.6],
  speaking: ["explaining", 0.85],
};

const SPEAK_GESTURES = ["explainOpen", "explainPoint", "explainCount", "explainLeft", "nod", "headTilt"];

/**
 * Orchestrates every layer into one pose per frame:
 * base + emotion + idle + gestures + lip sync + look-at.
 * Public API: setEmotion, playAnimation, setMode, react, speech hooks, lookAt.
 */
export class AvatarController {
  readonly emotion = new EmotionController();
  readonly animation = new AnimationController();
  readonly lipSync = new LipSyncController();
  readonly idle = new IdleAnimation();
  readonly pose: Pose = basePose();

  mode: AvatarMode = "idle";
  enabled = true;
  /** Called with the resolved gesture name whenever one starts (used by GLB rigs to play matching clips). */
  onGesture: ((name: string) => void) | null = null;
  private reaction: { emotion: Emotion; intensity: number; until: number } | null = null;
  private time = 0;
  private nextAuto = 2;
  private lastGesture = "";
  private look = { x: 0, y: 0, tx: 0, ty: 0, until: 0 };
  private listeners = new Set<(s: AvatarState) => void>();
  private lastEmitted = "";

  get state(): AvatarState {
    return { mode: this.mode, emotion: this.emotion.emotion, enabled: this.enabled };
  }

  subscribe(fn: (s: AvatarState) => void) {
    this.listeners.add(fn);
    fn(this.state);
    return () => void this.listeners.delete(fn);
  }

  private emit() {
    const s = this.state;
    const key = `${s.mode}|${s.emotion}|${s.enabled}`;
    if (key === this.lastEmitted) return;
    this.lastEmitted = key;
    for (const fn of this.listeners) fn(s);
  }

  /** Show an emotion now; after `hold` seconds the avatar returns to the mode's emotion. */
  setEmotion(emotion: Emotion | string, intensity = 1, hold = 4.5, withGesture = false) {
    if (!isEmotion(emotion)) return;
    this.reaction = { emotion, intensity, until: this.time + hold };
    this.emotion.set(emotion, intensity);
    if (withGesture) {
      const g = EMOTION_GESTURE[emotion];
      if (g) this.play(g, { intensity: 0.6 + intensity * 0.4 });
    }
    this.emit();
  }

  playAnimation(name: string, opts?: PlayOptions) {
    if (!this.enabled && !opts?.force) return false;
    const ok = this.play(name, opts);
    if (ok) this.nextAuto = Math.max(this.nextAuto, 2.5);
    return ok;
  }

  private play(name: string, opts?: PlayOptions) {
    const ok = this.animation.play(name, opts);
    if (ok) {
      this.lastGesture = name;
      const key = AnimationController.resolve(name);
      if (key) this.onGesture?.(key);
    }
    return ok;
  }

  setMode(mode: AvatarMode) {
    if (mode === this.mode) return;
    const prev = this.mode;
    this.mode = mode;
    if (mode === "thinking") {
      this.nextAuto = 0.6;
      this.lookAtUser(0);
    }
    if (mode === "listening") this.lookAtUser(2.5);
    if (mode === "speaking" && prev !== "speaking") this.nextAuto = 0.4;
    if (!this.reactionActive) {
      const [e, i] = MODE_EMOTION[mode];
      this.emotion.set(e, i);
    }
    this.emit();
  }

  /** Apply a reaction coming from the AI reply (or local inference). */
  react(r: AvatarReaction, hold = 6) {
    const intensity = clamp(r.intensity ?? 0.8, 0.2, 1);
    this.setEmotion(r.emotion, intensity, hold);
    const anim = r.animation ?? EMOTION_GESTURE[r.emotion];
    if (anim) this.playAnimation(anim, { intensity: 0.65 + intensity * 0.35, priority: 3 });
    this.lookAtUser(1.5);
  }

  speechStart(text: string, rate = 1) {
    this.lipSync.start(text, rate);
    this.setMode("speaking");
  }

  speechBoundary(charIndex: number) {
    this.lipSync.boundary(charIndex);
  }

  speechEnd() {
    this.lipSync.stop();
    if (this.mode === "speaking") this.setMode("idle");
  }

  setLipSyncSource(src: LipSyncSource | null) {
    this.lipSync.setSource(src);
  }

  /** Pointer position in -1..1 screen space; the avatar glances there briefly. */
  lookAt(x: number, y: number, seconds = 1.2) {
    this.look.tx = clamp(x, -1, 1);
    this.look.ty = clamp(y, -1, 1);
    this.look.until = this.time + seconds;
  }

  lookAtUser(seconds = 1.5) {
    this.look.tx = 0;
    this.look.ty = 0;
    this.look.until = this.time + seconds;
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (!on) this.animation.stopAll();
    this.emit();
  }

  private get reactionActive() {
    return !!this.reaction && this.time < this.reaction.until;
  }

  private autoGestures(dt: number) {
    this.nextAuto -= dt;
    if (this.nextAuto > 0 || !this.enabled) return;
    const busy = this.animation.activePriority >= 1;
    const r = Math.random();
    switch (this.mode) {
      case "speaking": {
        if (!busy) {
          const pool = SPEAK_GESTURES.filter((g) => g !== this.lastGesture);
          const pick = pool[Math.floor(Math.random() * pool.length)];
          this.play(pick, { intensity: 0.7 + Math.random() * 0.3 });
          if (Math.random() < 0.35) this.lookAtUser(1.2);
        }
        this.nextAuto = 1.6 + Math.random() * 1.6;
        break;
      }
      case "thinking":
        if (!busy) this.play(r < 0.7 ? "think" : "headTilt");
        this.nextAuto = 3.2 + Math.random() * 1.5;
        break;
      case "typing":
        if (!busy) this.play(r < 0.5 ? "nod" : "headTilt", { intensity: 0.6 });
        this.nextAuto = 2.2 + Math.random() * 1.8;
        break;
      case "listening":
        if (!busy) this.play(r < 0.6 ? "listenNod" : "headTilt");
        this.nextAuto = 2.4 + Math.random() * 2;
        break;
      default:
        if (!busy && r < 0.5) this.play("headTilt", { intensity: 0.6 });
        this.nextAuto = 7 + Math.random() * 7;
    }
  }

  update(dt: number): Pose {
    this.time += dt;
    if (this.reaction && this.time >= this.reaction.until) {
      this.reaction = null;
      const [e, i] = MODE_EMOTION[this.mode];
      this.emotion.set(e, i);
      this.emit();
    }
    this.autoGestures(dt);

    const emo = this.emotion.update(dt);
    const p = copyPose(this.pose, basePose());
    addDelta(p, emo);
    const idle = this.idle.update(this.time, dt, 1 + emo.energy, this.mode === "thinking");
    addDelta(p, idle, this.enabled ? 1 : 0.35);
    p.eyeOpen = basePose().eyeOpen + emo.eyeOpen + idle.eyeOpen;
    addDelta(p, this.animation.update(dt));

    if (this.time > this.look.until) {
      this.look.tx *= 0.98;
      this.look.ty *= 0.98;
    }
    this.look.x = damp(this.look.x, this.look.tx, 5, dt);
    this.look.y = damp(this.look.y, this.look.ty, 5, dt);
    p.gazeX += this.look.x * 0.6;
    p.gazeY += this.look.y * 0.6;
    p.headYaw += this.look.x * 0.22;
    p.headPitch -= this.look.y * 0.12;

    const v = this.lipSync.update(dt, this.time);
    p.mouth += v.open * 0.85;
    p.mouthW += v.wide * 0.35 - v.round * 0.45;

    p.eyeOpen = clamp(p.eyeOpen, 0, 1.4);
    p.mouth = clamp(p.mouth, 0, 1.2);
    p.gazeX = clamp(p.gazeX, -1, 1);
    p.gazeY = clamp(p.gazeY, -1, 1);
    return p;
  }
}

let shared: AvatarController | null = null;

/** One controller per page, shared by the chat bridge and the renderer. */
export function getAvatar() {
  if (!shared) {
    shared = new AvatarController();
    if (typeof window !== "undefined") (window as unknown as { microAvatar?: AvatarController }).microAvatar = shared;
  }
  return shared;
}
