import { POSE_KEYS, zeroPose, type Pose } from "./pose";

const S = Math.sin;

/** Always-on subtle life: breathing, blinking, eye saccades and slow head/body drift. */
export class IdleAnimation {
  readonly out: Pose = zeroPose();
  private nextBlink = 1.5;
  private blinkT = -1;
  private doubleBlink = false;
  private nextSaccade = 0.8;
  private gaze = { x: 0, y: 0, tx: 0, ty: 0 };

  update(time: number, dt: number, energy: number, thinking: boolean) {
    const o = this.out;
    for (const k of POSE_KEYS) o[k] = 0;
    const e = Math.max(0.25, energy);

    const breath = S(time * 1.35);
    o.bodyY = breath * 0.006 * e;
    o.bodyPitch = breath * 0.012;
    o.lShoulderRoll = 0.02 + breath * 0.012;
    o.rShoulderRoll = 0.02 + breath * 0.012;
    o.lElbow = 0.12 + S(time * 0.7) * 0.03;
    o.rElbow = 0.12 + S(time * 0.63 + 1) * 0.03;

    o.headYaw = (S(time * 0.31) * 0.05 + S(time * 0.73 + 2) * 0.02) * e;
    o.headPitch = (S(time * 0.43 + 1) * 0.025 + S(time * 0.97) * 0.01) * e;
    o.headRoll = S(time * 0.27 + 0.5) * 0.03 * e;
    o.bodyYaw = S(time * 0.19) * 0.03 * e;

    this.nextBlink -= dt;
    if (this.nextBlink <= 0 && this.blinkT < 0) {
      this.blinkT = 0;
      this.doubleBlink = Math.random() < 0.18;
      this.nextBlink = 2.2 + Math.random() * 3.8;
    }
    if (this.blinkT >= 0) {
      this.blinkT += dt;
      const len = 0.16;
      const p = this.blinkT / len;
      o.eyeOpen = -Math.sin(Math.min(1, p) * Math.PI);
      if (p >= 1) {
        this.blinkT = -1;
        if (this.doubleBlink) {
          this.doubleBlink = false;
          this.nextBlink = 0.12;
        }
      }
    }

    this.nextSaccade -= dt;
    if (this.nextSaccade <= 0) {
      const r = thinking ? 0.35 : 0.22;
      this.gaze.tx = (Math.random() * 2 - 1) * r;
      this.gaze.ty = (Math.random() * 2 - 1) * r * 0.6;
      if (Math.random() < 0.45) {
        this.gaze.tx = 0;
        this.gaze.ty = 0;
      }
      this.nextSaccade = 0.7 + Math.random() * 2.2;
    }
    const k = 1 - Math.exp(-dt * 26);
    this.gaze.x += (this.gaze.tx - this.gaze.x) * k;
    this.gaze.y += (this.gaze.ty - this.gaze.y) * k;
    o.gazeX = this.gaze.x;
    o.gazeY = this.gaze.y;
    return o;
  }
}
