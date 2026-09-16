interface SpeechRecognition extends EventTarget {
  lang: string;
  start: () => void;
  onresult: ((ev: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
}
interface SpeechRecognitionEvent {
  results: { 0: { 0: { transcript: string } } };
}
