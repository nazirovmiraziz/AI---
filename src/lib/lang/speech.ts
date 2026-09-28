export function canSpeak(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.speechSynthesis);
}

export function speakText(text: string, locale = "en-GB", rate = 0.92) {
  if (typeof window === "undefined" || !window.speechSynthesis) return false;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = locale;
  u.rate = rate;
  window.speechSynthesis.speak(u);
  return true;
}

export function stopSpeak() {
  if (typeof window === "undefined") return;
  window.speechSynthesis?.cancel();
}

export type ListenFn = (cb: (text: string, mock: boolean) => void) => { stop: () => void } | null;

export function listenOnce(locale = "en-GB"): ReturnType<ListenFn> {
  if (typeof window === "undefined") return null;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const rec = new SR();
  rec.lang = locale;
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  let done = false;
  const stop = () => {
    if (done) return;
    done = true;
    try {
      rec.stop();
    } catch {
      /* ignore */
    }
  };
  rec.onend = () => {
    done = true;
  };
  try {
    rec.start();
  } catch {
    return null;
  }
  return {
    stop,
    rec,
  } as { stop: () => void; rec: SpeechRecognition };
}

export function startRecognition(locale: string, onResult: (text: string) => void, onFail: () => void) {
  if (typeof window === "undefined") {
    onFail();
    return () => {};
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    onFail();
    return () => {};
  }
  const rec = new SR();
  rec.lang = locale;
  rec.interimResults = false;
  rec.onresult = (e: SpeechRecognitionEvent) => {
    const t = e.results[0]?.[0]?.transcript ?? "";
    onResult(t);
  };
  rec.onerror = () => onFail();
  rec.start();
  return () => {
    try {
      rec.stop();
    } catch {
      /* ignore */
    }
  };
}
