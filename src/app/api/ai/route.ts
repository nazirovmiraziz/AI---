import { NextRequest, NextResponse } from "next/server";
import { MODE_INSTRUCTIONS } from "@/lib/ai/modes";
import { SYSTEM_PROMPT } from "@/lib/ai-engine";
import type { AiMode } from "@/lib/types";
import { AVATAR_TAG_INSTRUCTION, extractAvatarTag } from "@/components/avatar/protocol";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_CHARS = 12000;

function isYandexKey(key: string) {
  return key.startsWith("AQ.") || key.startsWith("AQVN");
}

function systemText(body: Record<string, unknown>) {
  const profile = (body.profile ?? null) as { name?: string } | null;
  const raw = profile?.name?.trim() || "";
  const name = /^(алишер|alisher|нигара|нигора|nigara)$/i.test(raw) ? "" : raw;
  const messages = (body.messages as { role?: string; content?: string }[] | undefined) ?? [];
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const mode = (typeof body.mode === "string" ? body.mode : "chat") as AiMode;
  const modeText = MODE_INSTRUCTIONS[mode] ?? MODE_INSTRUCTIONS.chat;
  return `${SYSTEM_PROMPT}

${modeText}

The student's name is: "${name || "(no name — do not invent one. Never say Alisher, Алишер, Нигара or Нигора)"}".
Student profile: ${JSON.stringify({ ...(body.profile ?? {}), name })}
Explain style: ${body.style ?? "simple"}
Lesson language: ${body.lessonLanguage ?? "ru"}
Hint-only: ${!!body.hintOnly}
Latest student message: ${lastUser.slice(0, 500)}
Answer the asked question directly and briefly, like Gemini. Give the answer. Do not ask a question back unless they asked to be tested.${mode === "quiz" ? "" : `\n\n${AVATAR_TAG_INSTRUCTION}`}`;
}

async function withAvatar(res: Response, mode: unknown) {
  if (mode === "quiz" || !res.ok) return res;
  const data = await res.clone().json().catch(() => null);
  if (!data || typeof data.content !== "string") return res;
  const { content, reaction } = extractAvatarTag(data.content);
  return NextResponse.json({ ...data, content, avatar: reaction ?? data.avatar ?? null }, { status: res.status });
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  let body: Record<string, unknown> = {};
  try {
    body = raw ? JSON.parse(raw) : {};
  } catch {
    return NextResponse.json({ error: "bad_request", message: "Некорректный запрос." }, { status: 400 });
  }

  const api = process.env.API_URL?.replace(/\/$/, "");
  if (api) {
    try {
      const res = await fetch(`${api}/api/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: raw,
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data) return withAvatar(NextResponse.json(data), body.mode);
      }
    } catch {
      /* fall through to local providers */
    }
  }
    const messages = ((body.messages as { role: string; content: string }[] | undefined) ?? []).slice(-8);
    const image = body.image as string | undefined;
    if (image && image.length > 1_400_000) {
      return NextResponse.json({ error: "too_large", message: "Фото слишком большое. Загрузите снимок до 1 МБ." }, { status: 413 });
    }
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
      return withAvatar(result, body.mode);
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
        ? (messages?.[messages.length - 1]?.content || "Распознай задачу на фото. Спроси ученика про первый шаг, не выдавай готовый ответ.") + "\n\n(Фото приложено, но эта модель видит только текст — попроси описать условие.)"
        : [
            { type: "text", text: messages?.[messages.length - 1]?.content || "Распознай задачу на фото. Спроси ученика про первый шаг, не выдавай готовый ответ." },
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

function geminiParts(text: string, image?: string) {
  const parts: Record<string, unknown>[] = [];
  if (text) parts.push({ text });
  if (image) {
    const m = String(image).match(/^data:([^;]+);base64,(.+)$/);
    if (m) parts.push({ inlineData: { mimeType: m[1], data: m[2] } });
    else parts.push({ text: "К сообщению приложено фото. Если не видишь изображение, попроси описать условие и разбери по шагам." });
  }
  if (!parts.length) parts.push({ text: " " });
  return parts;
}

async function askGemini(
  key: string,
  body: Record<string, unknown>,
  messages: { role: string; content: string }[] | undefined,
  image: string | undefined,
  signal: AbortSignal
) {
  const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";
  const list = messages ?? [];
  const contents = list.map((m, i) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: geminiParts(m.content, i === list.length - 1 && m.role !== "assistant" ? image : undefined),
  }));
  if (image && (!list.length || list[list.length - 1]?.role === "assistant")) {
    contents.push({ role: "user", parts: geminiParts("Разбери фото по шагам.", image) });
  }
  const quiz = body.mode === "quiz";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemText(body) }] },
        contents,
        generationConfig: { temperature: quiz ? 0.4 : 0.6, maxOutputTokens: quiz ? 2500 : 1600 },
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
      content: "К сообщению приложено фото задачи. Если изображение недоступно, попроси ученика описать условие словами и сразу дай решение с ответом.",
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
