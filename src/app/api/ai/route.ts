import { NextRequest, NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/ai-engine";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_CHARS = 12000;

function isYandexKey(key: string) {
  return key.startsWith("AQ.") || key.startsWith("AQVN");
}

function systemText(body: Record<string, unknown>) {
  return `${SYSTEM_PROMPT}\nStudent profile: ${JSON.stringify(body.profile ?? {})}\nExplain style: ${body.style ?? "student"}\nLesson language: ${body.lessonLanguage ?? "ru"}\nHint-only: ${!!body.hintOnly}`;
}

export async function POST(req: NextRequest) {
  const api = process.env.API_URL?.replace(/\/$/, "");
  if (api) {
    const body = await req.text();
    const res = await fetch(`${api}/api/ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const data = await res.json().catch(() => ({ error: "upstream" }));
    return NextResponse.json(data, { status: res.status });
  }

  try {
    const body = await req.json();
    const messages = body.messages as { role: string; content: string }[] | undefined;
    const image = body.image as string | undefined;
    if (!messages?.length && !image) {
      return NextResponse.json({ error: "empty", message: "Пустой запрос." }, { status: 400 });
    }
    const total = (messages ?? []).reduce((n, m) => n + (m.content?.length ?? 0), 0);
    if (total > MAX_CHARS) {
      return NextResponse.json({ error: "too_long", message: "Запрос слишком длинный. Сократите текст." }, { status: 413 });
    }

    const groqKey = process.env.GROQ_API_KEY?.trim() ?? "";
    const geminiKey = process.env.GEMINI_API_KEY?.trim() ?? "";
    const yandexKey = process.env.YANDEX_API_KEY?.trim() ?? "";
    const openaiKey = process.env.OPENAI_API_KEY?.trim() ?? "";
    const useGroq = groqKey.startsWith("gsk_") && groqKey.length > 20;
    const useGemini = !useGroq && geminiKey.length > 20;
    const useOpenAi = !useGroq && !useGemini && openaiKey.startsWith("sk-") && openaiKey.length > 20;
    const useYandex = !useGroq && !useGemini && !useOpenAi && isYandexKey(yandexKey) && yandexKey.length > 20;

    if (!useGroq && !useGemini && !useOpenAi && !useYandex) {
      return NextResponse.json({ demo: true });
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);

    try {
      const result = useGroq
        ? await askOpenAiCompatible(groqKey, "https://api.groq.com/openai/v1/chat/completions", process.env.GROQ_MODEL || "llama-3.1-8b-instant", body, messages, image, controller.signal)
        : useGemini
          ? await askGemini(geminiKey, body, messages, image, controller.signal)
          : useYandex
            ? await askYandex(yandexKey, body, messages, image, controller.signal)
            : await askOpenAiCompatible(openaiKey, "https://api.openai.com/v1/chat/completions", process.env.OPENAI_MODEL || "gpt-4o-mini", body, messages, image, controller.signal);
      clearTimeout(timer);
      return result;
    } catch (e) {
      clearTimeout(timer);
      const aborted = e instanceof Error && e.name === "AbortError";
      return NextResponse.json(
        {
          error: aborted ? "timeout" : "network",
          message: aborted ? "Превышено время ожидания. Попробуйте короче запрос." : "AI временно недоступен. Попробуйте ещё раз.",
        },
        { status: aborted ? 504 : 502 }
      );
    }
  } catch {
    return NextResponse.json({ error: "bad_request", message: "AI временно недоступен. Попробуйте ещё раз." }, { status: 400 });
  }
}

async function askOpenAiCompatible(
  key: string,
  url: string,
  model: string,
  body: Record<string, unknown>,
  messages: { role: string; content: string }[] | undefined,
  image: string | undefined,
  signal: AbortSignal
) {
  const openaiMessages: { role: string; content: unknown }[] = [{ role: "system", content: systemText(body) }];

  if (image) {
    openaiMessages.push({
      role: "user",
      content: url.includes("groq.com")
        ? (messages?.[messages.length - 1]?.content || "Распознай задачу и объясни по шагам. Не давай только ответ.") + "\n\n(Фото приложено, но эта модель видит только текст — попроси описать условие.)"
        : [
            { type: "text", text: messages?.[messages.length - 1]?.content || "Распознай задачу на фото и объясни решение по шагам. Не давай только ответ." },
            { type: "image_url", image_url: { url: image } },
          ],
    });
  } else {
    for (const m of messages ?? []) {
      openaiMessages.push({ role: m.role, content: m.content });
    }
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, temperature: 0.6, messages: openaiMessages }),
    signal,
  });
  return parseChat(res);
}

async function askGemini(
  key: string,
  body: Record<string, unknown>,
  messages: { role: string; content: string }[] | undefined,
  image: string | undefined,
  signal: AbortSignal
) {
  const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";
  const contents = (messages ?? []).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  if (image) {
    contents.push({
      role: "user",
      parts: [{ text: "К сообщению приложено фото. Если не видишь изображение, попроси описать условие и разбери по шагам." }],
    });
  }
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemText(body) }] },
        contents,
        generationConfig: { temperature: 0.6, maxOutputTokens: 1200 },
      }),
      signal,
    }
  );
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 || res.status === 403) return NextResponse.json({ demo: true });
  if (!res.ok) {
    return NextResponse.json({ error: "upstream", message: "AI временно недоступен. Попробуйте ещё раз." }, { status: 502 });
  }
  const content = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text).filter(Boolean).join("\n");
  if (!content?.trim()) {
    return NextResponse.json({ error: "empty_response", message: "AI временно недоступен. Попробуйте ещё раз." }, { status: 502 });
  }
  return NextResponse.json({ demo: false, content });
}

async function askYandex(
  key: string,
  body: Record<string, unknown>,
  messages: { role: string; content: string }[] | undefined,
  image: string | undefined,
  signal: AbortSignal
) {
  const folder = process.env.YANDEX_FOLDER_ID?.trim();
  const modelName = process.env.YANDEX_MODEL || "yandexgpt-lite";
  const model = folder ? `gpt://${folder}/${modelName}/latest` : modelName;
  const headers: Record<string, string> = {
    Authorization: `Api-Key ${key}`,
    "Content-Type": "application/json",
  };
  if (folder) headers["x-folder-id"] = folder;

  const chat = [
    { role: "system", content: systemText(body) },
    ...(messages ?? []).map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
  ];
  if (image) {
    chat.push({
      role: "user",
      content: "К сообщению приложено фото задачи. Если изображение недоступно, попроси ученика описать условие словами и разбери по шагам, не давая только ответ.",
    });
  }

  const openaiStyle = await fetch("https://llm.api.cloud.yandex.net/v1/chat/completions", {
    method: "POST",
    headers,
    body: JSON.stringify({ model, temperature: 0.6, messages: chat, max_tokens: 1200 }),
    signal,
  });
  if (openaiStyle.ok) return parseChat(openaiStyle);
  if (openaiStyle.status === 401 || openaiStyle.status === 403) {
    return NextResponse.json({ demo: true });
  }

  const native = await fetch("https://llm.api.cloud.yandex.net/foundationModels/v1/completion", {
    method: "POST",
    headers,
    body: JSON.stringify({
      modelUri: folder ? `gpt://${folder}/${modelName}/latest` : `gpt://b1g/${modelName}/latest`,
      completionOptions: { stream: false, temperature: 0.6, maxTokens: "1200" },
      messages: chat.map((m) => ({ role: m.role === "assistant" ? "assistant" : m.role === "system" ? "system" : "user", text: m.content })),
    }),
    signal,
  });
  if (!native.ok) {
    const alt = await fetch("https://ai.api.cloud.yandex.net/v1/chat/completions", {
      method: "POST",
      headers: { ...headers, Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, temperature: 0.6, messages: chat, max_tokens: 1200 }),
      signal,
    });
    if (alt.ok) return parseChat(alt);
    return NextResponse.json({ error: "upstream", message: "AI временно недоступен. Попробуйте ещё раз." }, { status: 502 });
  }

  const data = await native.json();
  const content = data?.result?.alternatives?.[0]?.message?.text;
  if (!content || !String(content).trim()) {
    return NextResponse.json({ error: "empty_response", message: "AI временно недоступен. Попробуйте ещё раз." }, { status: 502 });
  }
  return NextResponse.json({ demo: false, content });
}

async function parseChat(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 || res.status === 403) {
    return NextResponse.json({ demo: true });
  }
  if (res.status === 429) {
    const code = data?.error?.code;
    if (code === "credit_balance_exhausted" || code === "insufficient_quota") {
      return NextResponse.json({ demo: true, error: "no_credits" });
    }
    return NextResponse.json({ error: "rate_limit", message: "AI временно недоступен. Попробуйте ещё раз." }, { status: 429 });
  }
  if (!res.ok) {
    return NextResponse.json({ error: "upstream", message: "AI временно недоступен. Попробуйте ещё раз." }, { status: 502 });
  }
  const content = data?.choices?.[0]?.message?.content;
  if (!content || !String(content).trim()) {
    return NextResponse.json({ error: "empty_response", message: "AI временно недоступен. Попробуйте ещё раз." }, { status: 502 });
  }
  return NextResponse.json({ demo: false, content });
}
