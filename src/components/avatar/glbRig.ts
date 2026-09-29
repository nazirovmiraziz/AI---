import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { AvatarRig } from "./robotModel";
import type { Pose } from "./pose";

const BONES: Record<string, RegExp> = {
  spine: /^(mixamorig:?)?(spine2|chest|upperchest|spine1|spine)$/i,
  neck: /^(mixamorig:?)?neck/i,
  head: /^(mixamorig:?)?head$/i,
  lArm: /^(mixamorig:?)?(leftarm|upperarm[._]?l|l[._]?upperarm|arm[._]l)$/i,
  lFore: /^(mixamorig:?)?(leftforearm|lowerarm[._]?l|l[._]?forearm|forearm[._]l)$/i,
  lHand: /^(mixamorig:?)?(lefthand|hand[._]?l|l[._]?hand)$/i,
  rArm: /^(mixamorig:?)?(rightarm|upperarm[._]?r|r[._]?upperarm|arm[._]r)$/i,
  rFore: /^(mixamorig:?)?(rightforearm|lowerarm[._]?r|r[._]?forearm|forearm[._]r)$/i,
  rHand: /^(mixamorig:?)?(righthand|hand[._]?r|r[._]?hand)$/i,
};

const MORPHS: Record<string, RegExp> = {
  mouth: /^(jawopen|mouthopen|viseme_aa|mouth_open)$/i,
  smile: /^(mouthsmile|smile|mouth_smile)$/i,
  frown: /^(mouthfrown|frown|mouth_sad)$/i,
  blink: /^(eyeblink|blink|eyesclosed|eye_close)$/i,
  browUp: /^(browinnerup|browup|brow_up)$/i,
  round: /^(viseme_o|viseme_u|mouthpucker|mouthfunnel)$/i,
};

/**
 * Loads a user-supplied avatar.glb and drives it with the same pose channels.
 * Works with common humanoid rigs (Mixamo, Ready Player Me, VRM-like names) and ARKit-style morph targets.
 * Clips named after gestures/emotions (e.g. "idle", "wave", "celebrate") are crossfaded automatically.
 */
export async function loadGlbRig(url: string): Promise<AvatarRig & { playClip(name: string): boolean }> {
  const gltf = await new GLTFLoader().loadAsync(url);
  const scene = gltf.scene;
  const box = new THREE.Box3().setFromObject(scene);
  const size = box.getSize(new THREE.Vector3());
  const k = 3 / Math.max(0.001, size.y);
  scene.scale.setScalar(k);
  scene.position.y = -box.min.y * k;

  const bones: Record<string, { obj: THREE.Object3D; bind: THREE.Quaternion }> = {};
  const morphMeshes: { mesh: THREE.Mesh; idx: Record<string, number> }[] = [];
  scene.traverse((o) => {
    for (const [key, re] of Object.entries(BONES)) {
      if (!bones[key] && re.test(o.name)) bones[key] = { obj: o, bind: o.quaternion.clone() };
    }
    const m = o as THREE.Mesh;
    if (m.isMesh && m.morphTargetDictionary) {
      const idx: Record<string, number> = {};
      for (const [name, i] of Object.entries(m.morphTargetDictionary)) {
        for (const [key, re] of Object.entries(MORPHS)) if (re.test(name)) idx[key] = i;
      }
      if (Object.keys(idx).length) morphMeshes.push({ mesh: m, idx });
    }
  });

  const mixer = new THREE.AnimationMixer(scene);
  const actions = new Map<string, THREE.AnimationAction>();
  for (const clip of gltf.animations) actions.set(clip.name.toLowerCase(), mixer.clipAction(clip));
  let current: THREE.AnimationAction | null = null;
  const playClip = (name: string) => {
    const a = actions.get(name.toLowerCase());
    if (!a || a === current) return !!a;
    a.reset().fadeIn(0.35).play();
    current?.fadeOut(0.35);
    current = a;
    return true;
  };
  playClip("idle");

  const e = new THREE.Euler();
  const q = new THREE.Quaternion();
  const setBone = (key: string, x: number, y: number, z: number) => {
    const b = bones[key];
    if (!b) return;
    e.set(x, y, z);
    b.obj.quaternion.copy(b.bind).multiply(q.setFromEuler(e));
  };

  return {
    root: scene,
    frame: { full: [3.2, 1.55], bust: [1.6, 2.4] },
    playClip,
    apply(p: Pose, _time: number, dt: number) {
      mixer.update(dt);
      if (!current || current === actions.get("idle")) {
        setBone("spine", p.bodyPitch, p.bodyYaw, p.bodyRoll);
        setBone("neck", p.headPitch * 0.35, p.headYaw * 0.35, p.headRoll * 0.35);
        setBone("head", p.headPitch * 0.65, p.headYaw * 0.65, p.headRoll * 0.65);
        setBone("lArm", -p.lShoulderPitch, 0, -(p.lShoulderRoll - 1.2));
        setBone("rArm", -p.rShoulderPitch, 0, p.rShoulderRoll - 1.2);
        setBone("lFore", -p.lElbow, 0, 0);
        setBone("rFore", -p.rElbow, 0, 0);
        setBone("lHand", 0, 0, p.lHand);
        setBone("rHand", 0, 0, -p.rHand);
      }
      for (const { mesh, idx } of morphMeshes) {
        const inf = mesh.morphTargetInfluences;
        if (!inf) continue;
        if (idx.mouth !== undefined) inf[idx.mouth] = Math.min(1, p.mouth);
        if (idx.smile !== undefined) inf[idx.smile] = Math.max(0, p.smile);
        if (idx.frown !== undefined) inf[idx.frown] = Math.max(0, -p.smile);
        if (idx.blink !== undefined) inf[idx.blink] = 1 - Math.min(1, p.eyeOpen);
        if (idx.browUp !== undefined) inf[idx.browUp] = Math.max(0, p.browTilt + p.browY * 0.5);
        if (idx.round !== undefined) inf[idx.round] = Math.max(0, -p.mouthW);
      }
    },
    dispose() {
      mixer.stopAllAction();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.geometry.dispose();
          const mats = Array.isArray(m.material) ? m.material : [m.material];
          for (const mat of mats) mat.dispose();
        }
      });
    },
  };
}
