export {
  KnowledgeFlow as TutorBot,
  KnowledgeFlow,
  type FlowSubject,
} from "./KnowledgeFlow";

export type StageMood = "idle" | "listen" | "think" | "speak" | "happy" | "error";
export type BotMood = StageMood;
