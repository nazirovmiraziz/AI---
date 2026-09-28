"use client";

import { useEffect, useRef, useState } from "react";

export function VoiceWave({ active }: { active: boolean }) {
  const bars = useRef<HTMLSpanElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let ctx: AudioContext | null = null;
    let raf = 0;
    let dead = false;

    async function start() {
      if (!active || !bars.current) return;
      if (!navigator.mediaDevices?.getUserMedia) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (dead) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        ctx = new AudioContext();
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 32;
        src.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);
        const nodes = [...bars.current.querySelectorAll("i")];
        setLive(true);
        const tick = () => {
          if (dead) return;
          analyser.getByteFrequencyData(data);
          nodes.forEach((n, i) => {
            const v = data[i + 2] ?? 0;
            const h = 4 + (v / 255) * 16;
            n.style.height = `${h}px`;
          });
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch {
        setLive(false);
      }
    }

    if (active) start();
    return () => {
      dead = true;
      setLive(false);
      cancelAnimationFrame(raf);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      ctx?.close().catch(() => undefined);
    };
  }, [active]);

  if (!active) return null;
  return (
    <span ref={bars} className={`voice-live ${live ? "live" : ""}`} aria-hidden>
      <i /><i /><i /><i /><i /><i /><i />
    </span>
  );
}
