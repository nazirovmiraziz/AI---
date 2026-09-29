"use client";

import { useEffect, useRef, useState } from "react";
import { getAvatar, type AvatarMode } from "./AvatarController";
import { EMOTION_POSES, type Emotion } from "./emotions";
import { addDelta, basePose, clamp, smooth01, type Pose } from "./pose";

type Size = "xs" | "md" | "lg";

const EYE_X = [70, 130];
const EYE_Y = 45;
const EYE_R = 9;
const MOUTH_Y = 62;

function poseFor(emotion: Emotion): Pose {
  return addDelta(basePose(), EMOTION_POSES[emotion]);
}

type Parts = {
  g: SVGGElement;
  eyes: SVGEllipseElement[];
  arcs: SVGPathElement[];
  brows: SVGPathElement[];
  blush: SVGGElement;
  mouth: SVGPathElement;
};

function draw(parts: Parts, p: Pose) {
  const gx = clamp(p.gazeX, -1, 1) * 7;
  const gy = -clamp(p.gazeY, -1, 1) * 5;
  const open = clamp(p.eyeOpen, 0.06, 1.3);
  const happy = smooth01((p.eyeSmile - 0.25) / 0.35);
  const rx = EYE_R * clamp(1 + (p.pupil - 1) * 0.5, 0.8, 1.25);

  parts.eyes.forEach((el, i) => {
    el.setAttribute("cx", (EYE_X[i] + gx).toFixed(2));
    el.setAttribute("cy", (EYE_Y + gy).toFixed(2));
    el.setAttribute("rx", rx.toFixed(2));
    el.setAttribute("ry", Math.max(1.2, EYE_R * open).toFixed(2));
    el.style.opacity = (1 - happy).toFixed(3);
  });
  parts.arcs.forEach((el, i) => {
    const cx = EYE_X[i] + gx;
    const cy = EYE_Y + gy;
    el.setAttribute("d", `M${(cx - 9).toFixed(2)} ${(cy + 3).toFixed(2)} Q${cx.toFixed(2)} ${(cy - 9 * Math.max(0.2, open)).toFixed(2)} ${(cx + 9).toFixed(2)} ${(cy + 3).toFixed(2)}`);
    el.style.opacity = happy.toFixed(3);
  });

  const browVis = clamp(Math.abs(p.browTilt) * 1.3 + Math.max(0, p.browY - 0.3) * 1.5, 0, 1);
  parts.brows.forEach((el, i) => {
    const side = i === 0 ? -1 : 1;
    const cx = EYE_X[i] + gx * 0.5;
    const by = EYE_Y - 17 - p.browY * 5 + gy * 0.3;
    const inner = -p.browTilt * 5;
    el.setAttribute("d", `M${(cx + side * 9).toFixed(2)} ${(by + 1).toFixed(2)} L${(cx - side * 7).toFixed(2)} ${(by + inner).toFixed(2)}`);
    el.style.opacity = browVis.toFixed(3);
  });

  parts.blush.style.opacity = clamp(Math.max(0, p.smile) * p.eyeSmile * 0.7, 0, 0.6).toFixed(3);

  const w = 11 * (1 + p.mouthW * 0.5 + Math.max(0, p.smile) * 0.35);
  const o = clamp(p.mouth, 0, 1.2) * 11;
  const s = clamp(p.smile, -1, 1) * 7;
  const mx = 100 + gx * 0.35;
  const y0 = MOUTH_Y - s * 0.3;
  if (o < 1.2) {
    parts.mouth.setAttribute("d", `M${(mx - w).toFixed(2)} ${y0.toFixed(2)} Q${mx.toFixed(2)} ${(MOUTH_Y + s).toFixed(2)} ${(mx + w).toFixed(2)} ${y0.toFixed(2)}`);
    parts.mouth.setAttribute("fill", "none");
  } else {
    parts.mouth.setAttribute(
      "d",
      `M${(mx - w).toFixed(2)} ${y0.toFixed(2)} Q${mx.toFixed(2)} ${(MOUTH_Y + s * 0.4 - o * 0.2).toFixed(2)} ${(mx + w).toFixed(2)} ${y0.toFixed(2)} Q${mx.toFixed(2)} ${(MOUTH_Y + s + o * 1.5).toFixed(2)} ${(mx - w).toFixed(2)} ${y0.toFixed(2)}Z`,
    );
    parts.mouth.setAttribute("fill", "currentColor");
  }

  const tx = clamp(p.headYaw, -0.5, 0.5) * 10;
  const ty = clamp(p.bodyY * 90 + p.headPitch * 8, -6, 6);
  const rot = clamp(p.headRoll, -0.4, 0.4) * 24;
  parts.g.setAttribute("transform", `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) rotate(${rot.toFixed(2)} 100 45)`);
}

/**
 * The tutor's face: a rounded screen with dot eyes and a small mouth.
 * `live` faces follow the shared avatar controller (blinking, expressions, lip sync);
 * static faces just show `emotion`.
 */
export function AiFace({ size = "md", live = true, emotion = "neutral", className = "" }: { size?: Size; live?: boolean; emotion?: Emotion; className?: string }) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const eyeL = useRef<SVGEllipseElement>(null);
  const eyeR = useRef<SVGEllipseElement>(null);
  const arcL = useRef<SVGPathElement>(null);
  const arcR = useRef<SVGPathElement>(null);
  const browL = useRef<SVGPathElement>(null);
  const browR = useRef<SVGPathElement>(null);
  const blush = useRef<SVGGElement>(null);
  const mouth = useRef<SVGPathElement>(null);

  useEffect(() => {
    const parts: Parts = {
      g: gRef.current!,
      eyes: [eyeL.current!, eyeR.current!],
      arcs: [arcL.current!, arcR.current!],
      brows: [browL.current!, browR.current!],
      blush: blush.current!,
      mouth: mouth.current!,
    };
    if (!live) {
      draw(parts, poseFor(emotion));
      return;
    }
    const avatar = getAvatar();
    const wrap = wrapRef.current!;
    const sync = () => {
      wrap.dataset.mode = avatar.mode;
      wrap.dataset.emotion = avatar.emotion.emotion;
    };
    const unsub = avatar.subscribe(sync);
    let raf = 0;
    let visible = true;
    const loop = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      draw(parts, avatar.sample(now));
      raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) kick();
    });
    io.observe(wrap);
    document.addEventListener("visibilitychange", kick);
    kick();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      unsub();
      document.removeEventListener("visibilitychange", kick);
    };
  }, [live, emotion]);

  return (
    <span ref={wrapRef} className={`ai-face ai-face-${size} ${live ? "live" : ""} ${className}`} aria-hidden>
      <svg viewBox="0 0 200 90" role="presentation">
        <g ref={gRef}>
          <rect className="ai-face-shell" x="6" y="6" width="188" height="78" rx="39" />
          <g ref={blush} className="ai-face-blush" style={{ opacity: 0 }}>
            <ellipse cx="46" cy="58" rx="10" ry="4.5" />
            <ellipse cx="154" cy="58" rx="10" ry="4.5" />
          </g>
          <path ref={browL} className="ai-face-line" style={{ opacity: 0 }} />
          <path ref={browR} className="ai-face-line" style={{ opacity: 0 }} />
          <ellipse ref={eyeL} className="ai-face-eye" cx={EYE_X[0]} cy={EYE_Y} rx={EYE_R} ry={EYE_R} />
          <ellipse ref={eyeR} className="ai-face-eye" cx={EYE_X[1]} cy={EYE_Y} rx={EYE_R} ry={EYE_R} />
          <path ref={arcL} className="ai-face-line" style={{ opacity: 0 }} />
          <path ref={arcR} className="ai-face-line" style={{ opacity: 0 }} />
          <path ref={mouth} className="ai-face-mouth" d="M89 62 Q100 63 111 62" />
        </g>
      </svg>
    </span>
  );
}

const STATUS: Record<AvatarMode, string> = {
  idle: "На связи",
  listening: "Слушаю…",
  thinking: "ИИ думает…",
  typing: "Пишу ответ…",
  speaking: "Говорю…",
};

/** One-line status under the face; shows a spinner while the tutor is busy. */
export function AiFaceStatus({ className = "" }: { className?: string }) {
  const [mode, setMode] = useState<AvatarMode>("idle");
  useEffect(() => getAvatar().subscribe((s) => setMode(s.mode)), []);
  const busy = mode === "thinking" || mode === "typing";
  return (
    <p className={`ai-face-status ${className}`} data-mode={mode} role="status" aria-live="polite">
      {busy ? <span className="ai-face-spin" aria-hidden /> : <span className="ai-face-dot" aria-hidden />}
      {STATUS[mode]}
    </p>
  );
}
