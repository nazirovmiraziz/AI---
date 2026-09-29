import { smooth01, zeroPose, POSE_KEYS, type Pose, type PoseDelta } from "./pose";

type GestureFn = (t: number, p: number, seed: number) => PoseDelta;

export type Gesture = {
  duration: number;
  priority: number;
  fadeIn?: number;
  fadeOut?: number;
  fn: GestureFn;
};

const S = Math.sin;
const bell = (p: number, a = 0.15, b = 0.85) => smooth01(p / a) * (1 - smooth01((p - b) / (1 - b)));

/** Gesture library. Add a gesture by adding one entry; it becomes available to playAnimation(). */
export const GESTURES: Record<string, Gesture> = {
  wave: {
    duration: 2.4, priority: 3,
    fn: (t, p) => {
      const w = bell(p, 0.18, 0.8);
      return {
        rShoulderRoll: 2.35 * w, rShoulderPitch: 0.35 * w, rElbow: (0.85 + 0.35 * S(t * 8.5)) * w, rHand: 0.35 * S(t * 8.5) * w,
        headRoll: -0.1 * w, bodyRoll: -0.03 * w, smile: 0.2 * w,
      };
    },
  },
  goodbye: {
    duration: 3, priority: 3,
    fn: (t, p) => {
      const w = bell(p, 0.15, 0.78);
      const bow = S(Math.min(1, p / 0.35) * Math.PI) * 0.18;
      return {
        rShoulderRoll: 2.1 * w, rShoulderPitch: 0.3 * w, rElbow: (0.7 + 0.3 * S(t * 5.5)) * w, rHand: 0.3 * S(t * 5.5) * w,
        headPitch: bow, bodyPitch: bow * 0.6, headRoll: -0.08 * w,
      };
    },
  },
  nod: {
    duration: 1.2, priority: 1,
    fn: (t, p) => ({ headPitch: 0.16 * S(p * Math.PI * 2) * (1 - p) + 0.06 * S(p * Math.PI) }),
  },
  listenNod: {
    duration: 1.8, priority: 0,
    fn: (_t, p) => ({ headPitch: 0.09 * S(p * Math.PI), headRoll: 0.05 * S(p * Math.PI) }),
  },
  headTilt: {
    duration: 1.6, priority: 0,
    fn: (_t, p, seed) => ({ headRoll: (seed > 0.5 ? 0.16 : -0.16) * bell(p, 0.3, 0.6) }),
  },
  bounce: {
    duration: 1.5, priority: 2,
    fn: (t, p) => {
      const w = bell(p, 0.1, 0.8);
      return {
        bodyY: Math.abs(S(t * 9)) * 0.05 * w, lShoulderRoll: 0.5 * w, rShoulderRoll: 0.5 * w, lElbow: 0.9 * w, rElbow: 0.9 * w,
        lShoulderPitch: 0.5 * w, rShoulderPitch: 0.5 * w, headPitch: -0.08 * w,
      };
    },
  },
  celebrate: {
    duration: 2.8, priority: 4,
    fn: (t, p) => {
      const w = bell(p, 0.12, 0.82);
      const shake = S(t * 13) * 0.18;
      return {
        lShoulderRoll: (2.5 + shake) * w, rShoulderRoll: (2.5 - shake) * w, lElbow: 0.35 * w, rElbow: 0.35 * w,
        lHand: S(t * 11) * 0.5 * w, rHand: -S(t * 11) * 0.5 * w,
        bodyY: Math.abs(S(t * 7)) * 0.07 * w, headPitch: -0.16 * w, bodyRoll: S(t * 3.5) * 0.05 * w, smile: 0.3 * w,
      };
    },
  },
  thumbsUp: {
    duration: 2, priority: 2,
    fn: (_t, p) => {
      const w = bell(p, 0.2, 0.75);
      return {
        rShoulderPitch: 1.05 * w, rShoulderRoll: 0.25 * w, rElbow: 1.35 * w, rHand: -0.6 * w,
        headPitch: 0.1 * S(p * Math.PI * 3) * w, headRoll: 0.08 * w,
      };
    },
  },
  shrug: {
    duration: 1.8, priority: 2,
    fn: (_t, p) => {
      const w = bell(p, 0.25, 0.7);
      return {
        lShoulderRoll: 0.55 * w, rShoulderRoll: 0.55 * w, lElbow: 1.3 * w, rElbow: 1.3 * w, lShoulderPitch: 0.35 * w,
        rShoulderPitch: 0.35 * w, lHand: 0.8 * w, rHand: -0.8 * w, bodyY: 0.02 * w, headRoll: -0.15 * w,
      };
    },
  },
  startle: {
    duration: 1.2, priority: 3,
    fn: (_t, p) => {
      const w = bell(p, 0.08, 0.55);
      return { bodyY: 0.04 * w, bodyPitch: -0.1 * w, lShoulderRoll: 0.6 * w, rShoulderRoll: 0.6 * w, lElbow: 0.6 * w, rElbow: 0.6 * w };
    },
  },
  think: {
    duration: 3.6, priority: 1, fadeIn: 0.5, fadeOut: 0.6,
    fn: (t, p) => {
      const w = bell(p, 0.18, 0.85);
      return {
        rShoulderPitch: 1.3 * w, rShoulderRoll: -0.5 * w, rElbow: 2.05 * w, rHand: 0.3 * w,
        headRoll: (0.1 + 0.03 * S(t * 1.3)) * w, headPitch: 0.04 * w, lShoulderRoll: 0.08 * w,
      };
    },
  },
  explainOpen: {
    duration: 2.3, priority: 1,
    fn: (t, p) => {
      const w = bell(p, 0.2, 0.75);
      const beat = 0.12 * S(t * 4.2);
      return {
        lShoulderPitch: (0.75 + beat) * w, rShoulderPitch: (0.75 - beat) * w, lShoulderRoll: 0.35 * w, rShoulderRoll: 0.35 * w,
        lElbow: 1.15 * w, rElbow: 1.15 * w, lHand: 0.7 * w, rHand: -0.7 * w, bodyPitch: 0.03 * w,
      };
    },
  },
  explainPoint: {
    duration: 2.1, priority: 1,
    fn: (t, p) => {
      const w = bell(p, 0.2, 0.75);
      return {
        rShoulderRoll: 1.05 * w, rShoulderPitch: (0.55 + 0.05 * S(t * 5)) * w, rElbow: 0.35 * w, headYaw: -0.18 * w,
        gazeX: -0.5 * w, bodyYaw: -0.06 * w,
      };
    },
  },
  explainCount: {
    duration: 2.2, priority: 1,
    fn: (t, p) => {
      const w = bell(p, 0.15, 0.8);
      const beat = Math.max(0, S(t * 7.5)) * 0.18;
      return { rShoulderPitch: (0.8 + beat) * w, rShoulderRoll: 0.2 * w, rElbow: (1.4 - beat) * w, headPitch: beat * 0.35 * w };
    },
  },
  explainLeft: {
    duration: 2.2, priority: 1,
    fn: (t, p) => {
      const w = bell(p, 0.2, 0.75);
      return {
        lShoulderPitch: (0.85 + 0.08 * S(t * 3.6)) * w, lShoulderRoll: 0.45 * w, lElbow: 1.05 * w, lHand: 0.9 * w,
        headYaw: 0.1 * w, bodyYaw: 0.05 * w,
      };
    },
  },
  comfort: {
    duration: 2.4, priority: 2,
    fn: (_t, p) => {
      const w = bell(p, 0.25, 0.75);
      return {
        lShoulderPitch: 0.9 * w, rShoulderPitch: 0.9 * w, lElbow: 1.5 * w, rElbow: 1.5 * w, lHand: 0.5 * w, rHand: -0.5 * w,
        headRoll: 0.14 * w, headPitch: 0.1 * w, bodyPitch: 0.05 * w,
      };
    },
  },
};

export const ANIMATION_ALIASES: Record<string, string> = {
  greeting: "wave",
  hello: "wave",
  celebrating: "celebrate",
  explain: "explainOpen",
  explaining: "explainOpen",
  thinking: "think",
  happy: "nod",
  approve: "thumbsUp",
  confused: "shrug",
  surprised: "startle",
  encouraging: "comfort",
  excited: "bounce",
  proud: "thumbsUp",
  sad: "comfort",
  listening: "listenNod",
};

type Track = { name: string; g: Gesture; t: number; weight: number; fadingOut: boolean; seed: number; intensity: number };

export type PlayOptions = { priority?: number; intensity?: number; force?: boolean; queue?: boolean };

/** Plays gestures on top of the emotion pose with priorities and crossfades. */
export class AnimationController {
  private tracks: Track[] = [];
  private queued: { name: string; opts: PlayOptions } | null = null;
  readonly out: Pose = zeroPose();

  static resolve(name: string) {
    return GESTURES[name] ? name : ANIMATION_ALIASES[name] && GESTURES[ANIMATION_ALIASES[name]] ? ANIMATION_ALIASES[name] : null;
  }

  /** Priority of the gesture currently holding the stage (-1 if none). */
  get activePriority() {
    let p = -1;
    for (const tr of this.tracks) if (!tr.fadingOut) p = Math.max(p, tr.g.priority);
    return p;
  }

  get busy() {
    return this.tracks.some((tr) => !tr.fadingOut);
  }

  play(name: string, opts: PlayOptions = {}): boolean {
    const key = AnimationController.resolve(name);
    if (!key) return false;
    const g = GESTURES[key];
    const priority = opts.priority ?? g.priority;
    const blocking = this.tracks.find((tr) => !tr.fadingOut && tr.g.priority > priority && tr.t < tr.g.duration * 0.85);
    if (blocking && !opts.force) {
      if (opts.queue) this.queued = { name: key, opts };
      return false;
    }
    for (const tr of this.tracks) tr.fadingOut = true;
    this.tracks.push({ name: key, g: { ...g, priority }, t: 0, weight: 0, fadingOut: false, seed: Math.random(), intensity: opts.intensity ?? 1 });
    return true;
  }

  stopAll() {
    for (const tr of this.tracks) tr.fadingOut = true;
    this.queued = null;
  }

  isPlaying(name: string) {
    const key = AnimationController.resolve(name);
    return this.tracks.some((tr) => tr.name === key && !tr.fadingOut);
  }

  update(dt: number) {
    for (const k of POSE_KEYS) this.out[k] = 0;
    for (const tr of this.tracks) {
      tr.t += dt;
      const fi = tr.g.fadeIn ?? 0.25;
      const fo = tr.g.fadeOut ?? 0.35;
      if (tr.t >= tr.g.duration) tr.fadingOut = true;
      const target = tr.fadingOut ? 0 : 1;
      const rate = dt / (tr.fadingOut ? fo : fi);
      tr.weight = target > tr.weight ? Math.min(1, tr.weight + rate) : Math.max(0, tr.weight - rate);
      const p = Math.min(1, tr.t / tr.g.duration);
      const d = tr.g.fn(tr.t, p, tr.seed);
      const w = smooth01(tr.weight) * tr.intensity;
      for (const k in d) this.out[k as keyof Pose] += (d[k as keyof Pose] ?? 0) * w;
    }
    this.tracks = this.tracks.filter((tr) => !(tr.fadingOut && tr.weight <= 0));
    if (this.queued && !this.busy) {
      const q = this.queued;
      this.queued = null;
      this.play(q.name, q.opts);
    }
    return this.out;
  }
}
