"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { getAvatar } from "./AvatarController";
import { buildProceduralRobot, type AvatarRig } from "./robotModel";

type Quality = "low" | "medium" | "high";

function detectQuality(): Quality {
  const coarse = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
  const cores = navigator.hardwareConcurrency || 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  if (coarse && (cores <= 4 || mem <= 3)) return "low";
  if (coarse || cores <= 4) return "medium";
  return "high";
}

const MAX_DPR: Record<Quality, number> = { low: 1, medium: 1.5, high: 2 };

export type AIAvatarProps = {
  /** "bust" frames head and chest, "full" the whole robot, "auto" picks by panel shape. */
  framing?: "auto" | "bust" | "full";
  className?: string;
  onReady?: (ok: boolean) => void;
};

/** Three.js renderer for the tutor avatar. All behaviour comes from the shared AvatarController. */
export function AIAvatar({ framing = "auto", className = "", onReady }: AIAvatarProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framingRef = useRef(framing);
  const [failed, setFailed] = useState(false);
  framingRef.current = framing;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const avatar = getAvatar();
    const quality = detectQuality();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: quality !== "low", alpha: true, powerPreference: "high-performance" });
    } catch {
      setFailed(true);
      onReady?.(false);
      return;
    }
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);
    let dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR[quality]);
    renderer.setPixelRatio(dpr);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const envTex = pmrem.fromScene(room, 0.04).texture;
    scene.environment = envTex;
    room.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      }
    });
    pmrem.dispose();

    scene.add(new THREE.HemisphereLight(0xffffff, 0xb9dcff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(2.5, 4, 3.5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x7fd0ff, 1.3);
    rim.position.set(-3, 2.5, -2.5);
    scene.add(rim);
    const fill = new THREE.PointLight(0xcfe9ff, 0.6, 10);
    fill.position.set(-1.5, 1.2, 2.5);
    scene.add(fill);

    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
    let rig: AvatarRig = buildProceduralRobot(quality);
    scene.add(rig.root);

    let disposed = false;
    const glb = process.env.NEXT_PUBLIC_AVATAR_GLB;
    if (glb) {
      import("./glbRig")
        .then(({ loadGlbRig }) => loadGlbRig(glb))
        .then((custom) => {
          if (disposed) return custom.dispose();
          scene.remove(rig.root);
          rig.dispose();
          rig = custom;
          scene.add(rig.root);
          avatar.onGesture = (name) => void custom.playClip(name);
        })
        .catch(() => {
          /* keep the built-in robot */
        });
    }

    const cam = { az: 0, el: 0, taz: 0, tel: 0, zoom: 1.35, tzoom: 1, lastDrag: -10 };
    let w = 1;
    let h = 1;
    const resize = () => {
      w = Math.max(1, wrap.clientWidth);
      h = Math.max(1, wrap.clientHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const target = new THREE.Vector3();
    const placeCamera = (time: number) => {
      const mode = framingRef.current === "auto" ? (camera.aspect > 1.2 ? "bust" : "full") : framingRef.current;
      let [fh, cy] = mode === "bust" ? rig.frame.bust : rig.frame.full;
      if (mode === "bust" && camera.aspect > 2) {
        fh *= 0.8;
        cy += fh * 0.12;
      }
      const halfV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const needW = mode === "bust" ? 2.1 : 2.25;
      const dist = Math.max((fh / 2) / halfV, (needW / 2) / (halfV * camera.aspect)) * 1.02 * cam.zoom;
      const sway = reduced ? 0 : Math.sin(time * 0.23) * 0.06;
      const az = cam.az + sway;
      const el = 0.06 + cam.el + (reduced ? 0 : Math.sin(time * 0.17) * 0.02);
      target.set(0, cy, 0);
      camera.position.set(Math.sin(az) * Math.cos(el) * dist, cy + Math.sin(el) * dist, Math.cos(az) * Math.cos(el) * dist);
      camera.lookAt(target);
    };

    let dragging: { x: number; y: number; id: number } | null = null;
    const onDown = (e: PointerEvent) => {
      dragging = { x: e.clientX, y: e.clientY, id: e.pointerId };
      canvas.setPointerCapture(e.pointerId);
    };
    const onDrag = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== dragging.id) return;
      cam.taz = THREE.MathUtils.clamp(cam.taz - (e.clientX - dragging.x) * 0.006, -0.7, 0.7);
      cam.tel = THREE.MathUtils.clamp(cam.tel + (e.clientY - dragging.y) * 0.004, -0.2, 0.3);
      dragging.x = e.clientX;
      dragging.y = e.clientY;
      cam.lastDrag = clock;
    };
    const onUp = (e: PointerEvent) => {
      if (dragging?.id === e.pointerId) dragging = null;
    };
    const onDouble = () => {
      cam.tzoom = cam.tzoom < 1 ? 1 : 0.78;
      cam.lastDrag = clock;
    };
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const onLook = (e: PointerEvent) => {
      const b = canvas.getBoundingClientRect();
      const x = ((e.clientX - b.left) / b.width) * 2 - 1;
      const y = -(((e.clientY - b.top) / b.height) * 2 - 1);
      avatar.lookAt(x * 0.8, y * 0.6, 0.9);
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onDrag);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("dblclick", onDouble);
    if (!coarse) window.addEventListener("pointermove", onLook, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) kick();
    });
    io.observe(wrap);

    let raf = 0;
    let last = performance.now();
    let clock = 0;
    let acc = 0;
    let frames = 0;
    let slowSum = 0;
    let readySent = false;

    const frame = (now: number) => {
      raf = 0;
      if (disposed || !visible || document.hidden) return;
      raf = requestAnimationFrame(frame);
      const minStep = avatar.enabled ? 0 : 1 / 24;
      const rawDt = (now - last) / 1000;
      if (rawDt < minStep) return;
      last = now;
      const dt = Math.min(0.05, rawDt);
      clock += dt;

      if (clock - cam.lastDrag > 2.5 && !dragging) {
        cam.taz *= 1 - Math.min(1, dt * 1.2);
        cam.tel *= 1 - Math.min(1, dt * 1.2);
      }
      const k = 1 - Math.exp(-dt * 5);
      cam.az += (cam.taz - cam.az) * k;
      cam.el += (cam.tel - cam.el) * k;
      cam.zoom += (cam.tzoom - cam.zoom) * (1 - Math.exp(-dt * 2.2));

      const pose = avatar.update(dt);
      rig.apply(pose, clock, dt);
      placeCamera(clock);
      renderer.render(scene, camera);

      if (!readySent) {
        readySent = true;
        onReady?.(true);
      }

      acc += rawDt * 1000;
      frames++;
      if (rawDt * 1000 > 26) slowSum++;
      if (frames >= 90) {
        const avg = acc / frames;
        if (slowSum > 30 && dpr > 0.75) {
          dpr = Math.max(0.75, dpr - 0.25);
          renderer.setPixelRatio(dpr);
          resize();
        } else if (avg < 12 && dpr < Math.min(window.devicePixelRatio || 1, MAX_DPR[quality])) {
          dpr = Math.min(MAX_DPR[quality], dpr + 0.25);
          renderer.setPixelRatio(dpr);
          resize();
        }
        acc = 0;
        frames = 0;
        slowSum = 0;
      }
    };
    const kick = () => {
      if (raf || disposed) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const onVis = () => kick();
    document.addEventListener("visibilitychange", onVis);
    kick();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onDrag);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("dblclick", onDouble);
      window.removeEventListener("pointermove", onLook);
      avatar.onGesture = null;
      rig.dispose();
      envTex.dispose();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={wrapRef} className={`ai-avatar ${className}`}>
      {failed ? (
        <div className="ai-avatar-fallback">3D недоступно в этом браузере</div>
      ) : (
        <canvas ref={canvasRef} className="ai-avatar-canvas" aria-label="3D AI-репетитор" role="img" />
      )}
    </div>
  );
}

export default AIAvatar;
