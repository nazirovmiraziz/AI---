interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((ev: SpeechRecognitionEvent) => void) | null;
  onend: ((ev?: Event) => void) | null;
  onerror: ((ev?: Event) => void) | null;
}
interface SpeechRecognitionEvent {
  results: { 0: { 0: { transcript: string } } };
}

interface Window {
  SpeechRecognition?: { new (): SpeechRecognition };
  webkitSpeechRecognition?: { new (): SpeechRecognition };
}
