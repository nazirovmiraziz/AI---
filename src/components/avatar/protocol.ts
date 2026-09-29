import { EMOTIONS, isEmotion, type Emotion } from "./emotions";

/** What the AI (or the local inference) tells the avatar to do alongside a reply. */
export type AvatarReaction = {
  emotion: Emotion;
  animation?: string;
  intensity?: number;
  text?: string;
};

export const AVATAR_ANIMATIONS = [
  "wave", "goodbye", "nod", "celebrate", "thumbsUp", "shrug", "think", "explainOpen", "explainPoint", "comfort", "bounce",
] as const;

const TAG_RE = /\[\[\s*avatar\b([^\]]*)\]\]/gi;
const PARTIAL_RE = /\[\[\s*avatar\b[^\]]*$/i;

/** Instruction appended to the system prompt so the model returns an emotion with each reply. */
export const AVATAR_TAG_INSTRUCTION = `After your reply, on the last line, add one hidden tag for the tutor's 3D avatar exactly like:
[[avatar emotion=explaining animation=explainOpen intensity=0.7]]
emotion: one of ${EMOTIONS.join(", ")}.
animation: one of ${AVATAR_ANIMATIONS.join(", ")}, or none.
intensity: 0.3 to 1.
Pick by context: greeting -> greeting + wave; student answered correctly -> happy or proud + thumbsUp (big win -> celebrating + celebrate); student made a mistake -> encouraging + comfort (never mock); student is lost -> encouraging + explainOpen; explaining -> explaining + explainOpen or explainPoint; hard problem -> thinking + think; student understood -> happy + nod; end of lesson or goodbye -> goodbye + goodbye.
The student never sees this tag. Write it once, only at the very end.`;

function parseAttrs(raw: string): AvatarReaction | null {
  const attrs: Record<string, string> = {};
  for (const m of raw.matchAll(/(\w+)\s*[=:]\s*"?([\w.]+)"?/g)) attrs[m[1].toLowerCase()] = m[2];
  const emotion = attrs.emotion?.toLowerCase();
  if (!isEmotion(emotion)) return null;
  const intensity = Number(attrs.intensity);
  const anim = attrs.animation;
  return {
    emotion,
    animation: anim && anim.toLowerCase() !== "none" ? anim : undefined,
    intensity: Number.isFinite(intensity) ? Math.min(1, Math.max(0.2, intensity)) : undefined,
  };
}

/** Removes avatar tags from a reply and returns the last valid reaction, if any. */
export function extractAvatarTag(content: string): { content: string; reaction: AvatarReaction | null } {
  let reaction: AvatarReaction | null = null;
  for (const m of content.matchAll(TAG_RE)) reaction = parseAttrs(m[1]) ?? reaction;
  const clean = content.replace(TAG_RE, "").replace(PARTIAL_RE, "").replace(/\s+$/, "");
  return { content: clean, reaction };
}

export function toReaction(v: unknown): AvatarReaction | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  if (!isEmotion(o.emotion)) return null;
  return {
    emotion: o.emotion,
    animation: typeof o.animation === "string" ? o.animation : undefined,
    intensity: typeof o.intensity === "number" ? o.intensity : undefined,
    text: typeof o.text === "string" ? o.text : undefined,
  };
}
