import { damp } from "./pose";

/** Mouth shape for one frame: open = jaw, round = lips rounded (о/у), wide = lips stretched (и/е). */
export type Viseme = { open: number; round: number; wide: number };

/**
 * Optional external driver, e.g. a WebAudio analyser or a viseme stream from a TTS provider.
 * Return null when it has no data so the built-in text driver keeps working.
 */
export type LipSyncSource = (time: number) => Viseme | null;

const VOWEL: Record<string, Viseme> = {
  а: { open: 1, round: 0, wide: 0.2 }, я: { open: 0.9, round: 0, wide: 0.3 },
  о: { open: 0.75, round: 0.9, wide: 0 }, ё: { open: 0.7, round: 0.8, wide: 0 },
  у: { open: 0.45, round: 1, wide: 0 }, ю: { open: 0.45, round: 0.9, wide: 0 },
  э: { open: 0.7, round: 0, wide: 0.6 }, е: { open: 0.6, round: 0, wide: 0.7 },
  и: { open: 0.4, round: 0, wide: 1 }, ы: { open: 0.45, round: 0.1, wide: 0.7 },
  a: { open: 1, round: 0, wide: 0.2 }, o: { open: 0.75, round: 0.9, wide: 0 }, u: { open: 0.45, round: 1, wide: 0 },
  e: { open: 0.6, round: 0, wide: 0.7 }, i: { open: 0.4, round: 0, wide: 1 }, y: { open: 0.45, round: 0, wide: 0.7 },
};
const CLOSED = new Set("мбпmbpвфvf");
const REST: Viseme = { open: 0, round: 0, wide: 0 };
const CHARS_PER_SEC = 13;

/**
 * Text-driven lip sync. Speech boundary events (when the browser provides them) re-anchor the
 * reading position, so the mouth follows the real voice instead of drifting.
 */
export class LipSyncController {
  private text = "";
  private active = false;
  private pos = 0;
  private rate = CHARS_PER_SEC;
  private source: LipSyncSource | null = null;
  readonly out: Viseme = { ...REST };

  setSource(src: LipSyncSource | null) {
    this.source = src;
  }

  start(text: string, rate = 1) {
    this.text = text.toLowerCase();
    this.pos = 0;
    this.rate = CHARS_PER_SEC * rate;
    this.active = true;
  }

  boundary(charIndex: number) {
    if (!this.active) return;
    if (Math.abs(charIndex - this.pos) > 2) this.pos = charIndex;
  }

  stop() {
    this.active = false;
  }

  get speaking() {
    return this.active;
  }

  update(dt: number, time: number): Viseme {
    let target: Viseme = REST;
    const ext = this.source?.(time);
    if (ext) {
      target = ext;
    } else if (this.active) {
      this.pos += dt * this.rate;
      if (this.pos >= this.text.length + 4) this.active = false;
      const i = Math.floor(this.pos);
      const ch = this.text[i] ?? " ";
      const frac = this.pos - i;
      if (VOWEL[ch]) {
        const v = VOWEL[ch];
        const shape = Math.sin(Math.min(1, frac * 1.25) * Math.PI);
        target = { open: v.open * (0.55 + 0.45 * shape), round: v.round, wide: v.wide };
      } else if (CLOSED.has(ch)) {
        target = { open: 0, round: 0.2, wide: 0 };
      } else if (/[\s.,!?;:—-]/.test(ch)) {
        target = { open: 0.05, round: 0, wide: 0 };
      } else {
        target = { open: 0.22, round: 0, wide: 0.2 };
      }
    }
    this.out.open = damp(this.out.open, target.open, 22, dt);
    this.out.round = damp(this.out.round, target.round, 14, dt);
    this.out.wide = damp(this.out.wide, target.wide, 14, dt);
    return this.out;
  }
}
