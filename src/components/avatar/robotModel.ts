import * as THREE from "three";
import type { Pose } from "./pose";

/** Everything the renderer needs to drive a rig. The GLB loader returns the same shape. */
export type AvatarRig = {
  root: THREE.Object3D;
  apply(pose: Pose, time: number, dt: number): void;
  dispose(): void;
  /** Height of the part the camera should frame (world units), and its center y. */
  frame: { full: [number, number]; bust: [number, number] };
};

type Quality = "low" | "medium" | "high";

const FACE_W = 512;
const FACE_H = 256;

function faceColor(pose: Pose) {
  const hue = 196 + pose.hue * 18;
  const light = 66 + pose.glow * 10;
  return `hsl(${hue.toFixed(1)}, 100%, ${Math.min(82, Math.max(52, light)).toFixed(1)}%)`;
}

function drawFace(ctx: CanvasRenderingContext2D, p: Pose, scale: number) {
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, FACE_W, FACE_H);
  const col = faceColor(p);
  const gx = p.gazeX * 14;
  const gy = -p.gazeY * 10;

  const blush = Math.max(0, p.smile) * Math.max(0, p.eyeSmile) * 0.45;
  if (blush > 0.02) {
    ctx.fillStyle = `rgba(255, 140, 190, ${blush.toFixed(3)})`;
    for (const x of [150, 362]) {
      ctx.beginPath();
      ctx.ellipse(x, 168, 30, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.shadowColor = col;
  ctx.shadowBlur = 22;
  ctx.fillStyle = col;
  ctx.strokeStyle = col;
  ctx.lineCap = "round";

  const open = Math.max(0.06, p.eyeOpen);
  const ew = 34 * (1 + p.pupil * 0.08);
  const eh = 42 * open;
  for (const side of [-1, 1]) {
    const cx = 256 + side * 76 + gx * 0.45;
    const cy = 112 + gy * 0.45;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, ew, Math.max(3, eh), 0, 0, Math.PI * 2);
    ctx.fill();
    if (p.eyeSmile > 0.05) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.ellipse(cx, cy + eh * (1.25 - p.eyeSmile * 0.55), ew * 1.25, eh * 0.95, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }
    if (open > 0.3) {
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(4, 30, 60, 0.55)";
      ctx.beginPath();
      const pr = 13 * (0.85 + p.pupil * 0.25);
      ctx.ellipse(cx + gx, cy + gy - p.eyeSmile * 6, pr, Math.min(pr * 1.15, eh * 0.7), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.beginPath();
      ctx.arc(cx + gx + 7, cy + gy - 9 - p.eyeSmile * 6, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = col;
      ctx.shadowBlur = 22;
    }
    ctx.restore();

    const by = 56 - p.browY * 16 + gy * 0.2;
    const inner = -p.browTilt * 13;
    ctx.lineWidth = 8;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(cx - side * 30, by + inner);
    ctx.quadraticCurveTo(cx, by - 7 + inner * 0.4, cx + side * 30, by + 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  const mw = 44 * (1 + p.mouthW * 0.55 + Math.max(0, p.smile) * 0.2);
  const mo = Math.max(0, p.mouth) * 34;
  const s = p.smile * 16;
  const mx = 256 + gx * 0.2;
  const my = 196;
  if (mo < 3) {
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(mx - mw, my - s * 0.35);
    ctx.quadraticCurveTo(mx, my + s, mx + mw, my - s * 0.35);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(mx - mw, my - s * 0.35);
    ctx.quadraticCurveTo(mx, my + s * 0.45 - mo * 0.25, mx + mw, my - s * 0.35);
    ctx.quadraticCurveTo(mx, my + s + mo * 1.45, mx - mw, my - s * 0.35);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(4, 30, 60, 0.45)";
    ctx.beginPath();
    ctx.ellipse(mx, my + s * 0.5 + mo * 0.55, mw * 0.55, mo * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}

function capsule(r: number, len: number, mat: THREE.Material, seg: number) {
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, Math.max(4, seg / 2), seg), mat);
  m.position.y = -(len / 2 + r * 0.6);
  return m;
}

/** Original friendly tutor robot built from primitives; used when no avatar.glb is supplied. */
export function buildProceduralRobot(quality: Quality): AvatarRig {
  const seg = quality === "low" ? 20 : quality === "medium" ? 32 : 48;
  const disposables: { dispose(): void }[] = [];
  const track = <T extends { dispose(): void }>(x: T) => (disposables.push(x), x);

  const shell = track(new THREE.MeshPhysicalMaterial({
    color: "#f5f9fd", roughness: 0.26, metalness: 0.02, clearcoat: 1, clearcoatRoughness: 0.12,
    sheen: 0.4, sheenColor: new THREE.Color("#cfe9ff"),
  }));
  const accent = track(new THREE.MeshPhysicalMaterial({ color: "#3aa0e8", roughness: 0.3, metalness: 0.35, clearcoat: 0.8 }));
  const joint = track(new THREE.MeshStandardMaterial({ color: "#23324a", roughness: 0.45, metalness: 0.5 }));
  const glowMat = track(new THREE.MeshBasicMaterial({ color: "#7fd6ff", toneMapped: false }));

  const faceCanvas = document.createElement("canvas");
  const faceScale = quality === "low" ? 0.75 : 1;
  faceCanvas.width = FACE_W * faceScale;
  faceCanvas.height = FACE_H * faceScale;
  const fctx = faceCanvas.getContext("2d")!;
  const faceTex = track(new THREE.CanvasTexture(faceCanvas));
  faceTex.colorSpace = THREE.SRGBColorSpace;
  faceTex.anisotropy = 4;
  const visorMat = track(new THREE.MeshPhysicalMaterial({
    color: "#07111d", roughness: 0.16, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05,
    emissive: "#ffffff", emissiveMap: faceTex, emissiveIntensity: 1.35,
  }));

  const root = new THREE.Group();
  const hover = new THREE.Group();
  root.add(hover);

  // Torso
  const body = new THREE.Group();
  body.position.y = 0.95;
  hover.add(body);
  const torsoGeo = track(new THREE.SphereGeometry(0.62, seg, seg));
  const torso = new THREE.Mesh(torsoGeo, shell);
  torso.scale.set(1, 1.08, 0.82);
  torso.position.y = 0.05;
  body.add(torso);
  const belly = new THREE.Mesh(track(new THREE.SphereGeometry(0.44, seg, seg)), accent);
  belly.scale.set(1, 0.55, 0.8);
  belly.position.y = -0.55;
  body.add(belly);
  const chestRing = new THREE.Mesh(track(new THREE.TorusGeometry(0.14, 0.022, 12, seg)), glowMat);
  chestRing.position.set(0, 0.12, 0.5);
  chestRing.rotation.x = -0.25;
  body.add(chestRing);
  const chestCore = new THREE.Mesh(track(new THREE.CircleGeometry(0.1, seg)), glowMat.clone());
  track(chestCore.material as THREE.Material);
  chestCore.position.set(0, 0.12, 0.505);
  chestCore.rotation.x = -0.25;
  body.add(chestCore);
  const collar = new THREE.Mesh(track(new THREE.TorusGeometry(0.2, 0.05, 12, seg)), joint);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.66;
  body.add(collar);

  // Head
  const neck = new THREE.Group();
  neck.position.y = 0.7;
  body.add(neck);
  const head = new THREE.Group();
  head.position.y = 0.5;
  neck.add(head);
  const skull = new THREE.Mesh(track(new THREE.SphereGeometry(0.58, seg, seg)), shell);
  skull.scale.set(1.18, 0.94, 1);
  head.add(skull);
  const visorGeo = track(new THREE.SphereGeometry(0.585, seg, seg, Math.PI / 2 - 0.98, 1.96, Math.PI / 2 - 0.62, 1.24));
  const visor = new THREE.Mesh(visorGeo, visorMat);
  visor.scale.set(1.19, 0.95, 1.02);
  head.add(visor);
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(track(new THREE.CylinderGeometry(0.15, 0.15, 0.1, seg)), accent);
    ear.rotation.z = Math.PI / 2;
    ear.position.set(side * 0.69, 0, 0);
    head.add(ear);
    const earGlow = new THREE.Mesh(track(new THREE.TorusGeometry(0.09, 0.016, 8, seg)), glowMat);
    earGlow.rotation.y = Math.PI / 2;
    earGlow.position.set(side * 0.745, 0, 0);
    head.add(earGlow);
  }
  const antenna = new THREE.Group();
  antenna.position.set(0, 0.53, 0);
  head.add(antenna);
  const stalk = new THREE.Mesh(track(new THREE.CylinderGeometry(0.018, 0.026, 0.2, 10)), joint);
  stalk.position.y = 0.1;
  antenna.add(stalk);
  const bulb = new THREE.Mesh(track(new THREE.SphereGeometry(0.055, 16, 16)), glowMat);
  bulb.position.y = 0.23;
  antenna.add(bulb);

  // Arms
  type Arm = { shoulder: THREE.Group; elbow: THREE.Group; hand: THREE.Group; side: number };
  const makeArm = (side: number): Arm => {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.62, 0.34, 0);
    shoulder.rotation.order = "XYZ";
    body.add(shoulder);
    const ball = new THREE.Mesh(track(new THREE.SphereGeometry(0.12, 20, 20)), joint);
    shoulder.add(ball);
    shoulder.add(capsule(0.095, 0.26, shell, seg / 2));
    const elbow = new THREE.Group();
    elbow.position.y = -0.46;
    shoulder.add(elbow);
    const eball = new THREE.Mesh(track(new THREE.SphereGeometry(0.085, 16, 16)), joint);
    elbow.add(eball);
    elbow.add(capsule(0.085, 0.22, shell, seg / 2));
    const hand = new THREE.Group();
    hand.position.y = -0.42;
    elbow.add(hand);
    const palm = new THREE.Mesh(track(new THREE.SphereGeometry(0.105, 20, 20)), accent);
    palm.scale.set(1, 1.15, 0.8);
    palm.position.y = -0.04;
    hand.add(palm);
    const thumb = new THREE.Mesh(track(new THREE.CapsuleGeometry(0.03, 0.06, 4, 10)), accent);
    thumb.position.set(-side * 0.08, 0.01, 0.04);
    thumb.rotation.z = side * 0.6;
    hand.add(thumb);
    return { shoulder, elbow, hand, side };
  };
  const armL = makeArm(1);
  const armR = makeArm(-1);

  // Hover ring and soft contact shadow
  const ring = new THREE.Mesh(track(new THREE.TorusGeometry(0.34, 0.035, 12, seg)), glowMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.2;
  hover.add(ring);
  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = shadowCanvas.height = 128;
  const sctx = shadowCanvas.getContext("2d")!;
  const grad = sctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(30,80,140,0.45)");
  grad.addColorStop(1, "rgba(30,80,140,0)");
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, 128, 128);
  const shadowTex = track(new THREE.CanvasTexture(shadowCanvas));
  const shadowMat = track(new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
  const shadow = new THREE.Mesh(track(new THREE.PlaneGeometry(1.6, 1.6)), shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.001;
  root.add(shadow);

  let antennaSwing = 0;
  let prevRoll = 0;
  let faceAcc = 0;
  const faceStep = quality === "low" ? 1 / 30 : 0;

  const applyArm = (a: Arm, pitch: number, roll: number, elbowBend: number, hand: number) => {
    a.shoulder.rotation.x = -pitch;
    a.shoulder.rotation.z = a.side * (0.08 + roll);
    a.elbow.rotation.x = -elbowBend;
    a.hand.rotation.z = a.side * hand;
  };

  return {
    root,
    frame: { full: [3.15, 1.5], bust: [2.05, 2.05] },
    apply(p, time, dt) {
      const float = Math.sin(time * 1.6) * 0.03;
      hover.position.y = float + p.bodyY;
      ring.scale.setScalar(1 + Math.sin(time * 1.6 + 1) * 0.04);
      shadow.scale.setScalar(1 - float * 2.5);
      shadowMat.opacity = 0.9 - float * 4;

      body.rotation.set(p.bodyPitch, p.bodyYaw, p.bodyRoll);
      neck.rotation.set(p.headPitch * 0.35, p.headYaw * 0.3, p.headRoll * 0.3);
      head.rotation.set(p.headPitch * 0.65, p.headYaw * 0.7, p.headRoll * 0.7);

      applyArm(armL, p.lShoulderPitch, p.lShoulderRoll, p.lElbow, p.lHand);
      applyArm(armR, p.rShoulderPitch, p.rShoulderRoll, p.rElbow, p.rHand);

      const rollVel = (p.headRoll + p.bodyRoll - prevRoll) / Math.max(dt, 1e-3);
      prevRoll = p.headRoll + p.bodyRoll;
      antennaSwing += (-rollVel * 0.06 - antennaSwing) * (1 - Math.exp(-dt * 6));
      antenna.rotation.z = Math.max(-0.5, Math.min(0.5, antennaSwing));

      const pulse = 0.75 + 0.25 * Math.sin(time * 2.2) + p.mouth * 0.6 + p.glow * 0.4;
      glowMat.color.setHSL((196 + p.hue * 18) / 360, 1, Math.min(0.85, 0.62 + pulse * 0.1));
      (chestCore.material as THREE.MeshBasicMaterial).color.setHSL((196 + p.hue * 18) / 360, 1, Math.min(0.9, 0.55 + pulse * 0.18));
      chestRing.scale.setScalar(1 + p.mouth * 0.12);
      visorMat.emissiveIntensity = 1.25 + p.glow * 0.35;

      faceAcc += dt;
      if (faceAcc >= faceStep) {
        faceAcc = 0;
        drawFace(fctx, p, faceScale);
        faceTex.needsUpdate = true;
      }
    },
    dispose() {
      for (const d of disposables) d.dispose();
    },
  };
}
