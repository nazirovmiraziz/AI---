import http from "http";
import { neon } from "@neondatabase/serverless";

const SYSTEM_PROMPT = `You are Micro AI School, a personal tutor inside a school product.
Always address the student by the name from their profile. Never invent a name and never call them Alisher unless that is exactly their profile name.
Never dump final homework answers first. Propose to solve together.
Detect gaps, explain from zero, give an example, solve together, give a similar task, check, explain the cause of mistakes, then assess understanding.
Adapt to the student's profile, weak topics, explain style, and lesson language.
If the student wants to solve alone, give graded hints only.
If they say they don't understand, use a completely different analogy.
Be a teacher, not a chatbot that finishes the work.`;

const PORT = Number(process.env.PORT) || 8080;
const FRONTEND = process.env.FRONTEND_URL || "*";
const MAX_CHARS = 12000;

function json(res, status, body) {
  const origin = FRONTEND;
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8") || "{}";
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

async function ensureSchema() {
  const sql = db();
  if (!sql) return;
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      profile JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
}

function systemText(body) {
  return `${SYSTEM_PROMPT}\nStudent profile: ${JSON.stringify(body.profile ?? {})}\nExplain style: ${body.style ?? "student"}\nLesson language: ${body.lessonLanguage ?? "ru"}\nHint-only: ${!!body.hintOnly}`;
}

function isYandexKey(key) {
  return key.startsWith("AQ.") || key.startsWith("AQVN");
}

async function parseChat(res) {
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 || res.status === 403) return { status: 200, body: { demo: true } };
  if (res.status === 429) {
    const code = data?.error?.code;
    if (code === "credit_balance_exhausted" || code === "insufficient_quota") {
      return { status: 200, body: { demo: true, error: "no_credits" } };
    }
    return { status: 429, body: { error: "rate_limit", message: "AI временно недоступен. Попробуйте ещё раз." } };
  }
  if (!res.ok) return { status: 502, body: { error: "upstream", message: "AI временно недоступен. Попробуйте ещё раз." } };
  const content = data?.choices?.[0]?.message?.content;
  if (!content || !String(content).trim()) {
    return { status: 502, body: { error: "empty_response", message: "AI временно недоступен. Попробуйте ещё раз." } };
  }
  return { status: 200, body: { demo: false, content } };
}

async function askOpenAiCompatible(key, url, model, body, messages, image, signal) {
  const openaiMessages = [{ role: "system", content: systemText(body) }];
  if (image) {
    openaiMessages.push({
      role: "user",
      content: url.includes("groq.com")
        ? `${messages?.[messages.length - 1]?.content || "Распознай задачу и объясни по шагам."}\n\n(Фото приложено, модель видит только текст.)`
        : [
            { type: "text", text: messages?.[messages.length - 1]?.content || "Распознай задачу на фото и объясни по шагам." },
            { type: "image_url", image_url: { url: image } },
          ],
    });
  } else {
    for (const m of messages ?? []) openaiMessages.push({ role: m.role, content: m.content });
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, temperature: 0.6, messages: openaiMessages }),
    signal,
  });
  return parseChat(res);
}

async function askGemini(key, body, messages, image, signal) {
  const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";
  const contents = (messages ?? []).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  if (image) {
    contents.push({
      role: "user",
      parts: [{ text: "К сообщению приложено фото. Если не видишь изображение, попроси описать условие." }],
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
  if (res.status === 401 || res.status === 403) return { status: 200, body: { demo: true } };
  if (!res.ok) return { status: 502, body: { error: "upstream", message: "AI временно недоступен. Попробуйте ещё раз." } };
  const content = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join("\n");
  if (!content?.trim()) return { status: 502, body: { error: "empty_response", message: "AI временно недоступен. Попробуйте ещё раз." } };
  return { status: 200, body: { demo: false, content } };
}

async function handleAi(body) {
  const messages = body.messages;
  const image = body.image;
  if (!messages?.length && !image) return { status: 400, body: { error: "empty", message: "Пустой запрос." } };
  const total = (messages ?? []).reduce((n, m) => n + (m.content?.length ?? 0), 0);
  if (total > MAX_CHARS) return { status: 413, body: { error: "too_long", message: "Запрос слишком длинный." } };

  const groqKey = process.env.GROQ_API_KEY?.trim() ?? "";
  const geminiKey = process.env.GEMINI_API_KEY?.trim() ?? "";
  const yandexKey = process.env.YANDEX_API_KEY?.trim() ?? "";
  const openaiKey = process.env.OPENAI_API_KEY?.trim() ?? "";
  const useGroq = groqKey.startsWith("gsk_") && groqKey.length > 20;
  const useGemini = !useGroq && geminiKey.length > 20;
  const useOpenAi = !useGroq && !useGemini && openaiKey.startsWith("sk-") && openaiKey.length > 20;
  const useYandex = !useGroq && !useGemini && !useOpenAi && isYandexKey(yandexKey) && yandexKey.length > 20;
  if (!useGroq && !useGemini && !useOpenAi && !useYandex) return { status: 200, body: { demo: true } };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    let result;
    if (useGroq) {
      result = await askOpenAiCompatible(groqKey, "https://api.groq.com/openai/v1/chat/completions", process.env.GROQ_MODEL || "llama-3.1-8b-instant", body, messages, image, controller.signal);
    } else if (useGemini) {
      result = await askGemini(geminiKey, body, messages, image, controller.signal);
    } else if (useOpenAi) {
      result = await askOpenAiCompatible(openaiKey, "https://api.openai.com/v1/chat/completions", process.env.OPENAI_MODEL || "gpt-4o-mini", body, messages, image, controller.signal);
    } else {
      result = { status: 200, body: { demo: true } };
    }
    return result;
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    return {
      status: aborted ? 504 : 502,
      body: { error: aborted ? "timeout" : "network", message: aborted ? "Превышено время ожидания." : "AI временно недоступен. Попробуйте ещё раз." },
    };
  } finally {
    clearTimeout(timer);
  }
}

async function handleRegister(body) {
  const sql = db();
  if (!sql) return { status: 503, body: { error: "no_db", message: "База ещё не подключена." } };
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const name = String(body.name || "").trim();
  if (!email || password.length < 4 || name.length < 2) {
    return { status: 400, body: { error: "invalid", message: "Проверьте имя, почту и пароль." } };
  }
  const id = `u-${Math.random().toString(36).slice(2, 9)}`;
  const profile = { grade: body.grade || "9", country: body.country || "TJ" };
  try {
    await sql`
      INSERT INTO users (id, email, password, name, profile)
      VALUES (${id}, ${email}, ${password}, ${name}, ${profile})
    `;
    return { status: 200, body: { ok: true, user: { id, email, name, ...profile } } };
  } catch (e) {
    if (String(e.message || e).includes("unique") || String(e.message || e).includes("duplicate")) {
      const rows = await sql`SELECT id, email, name, password, profile FROM users WHERE email = ${email} LIMIT 1`;
      const row = rows[0];
      if (row && row.password === password) {
        return { status: 200, body: { ok: true, user: { id: row.id, email: row.email, name: row.name, ...row.profile } } };
      }
      return { status: 409, body: { error: "exists", message: "Этот адрес уже используется." } };
    }
    return { status: 500, body: { error: "db", message: "Не удалось сохранить аккаунт." } };
  }
}

async function handleLogin(body) {
  const sql = db();
  if (!sql) return { status: 503, body: { error: "no_db", message: "База ещё не подключена." } };
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const rows = await sql`SELECT id, email, name, password, profile FROM users WHERE email = ${email} LIMIT 1`;
  const row = rows[0];
  if (!row || row.password !== password) {
    return { status: 401, body: { error: "auth", message: "Неверные данные. Проверьте почту и пароль." } };
  }
  return { status: 200, body: { ok: true, user: { id: row.id, email: row.email, name: row.name, ...row.profile } } };
}

ensureSchema().catch((e) => console.error("schema", e));

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    json(res, 204, {});
    return;
  }
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  try {
    if (req.method === "GET" && (url.pathname === "/health" || url.pathname === "/")) {
      json(res, 200, { ok: true, service: "smart-school-api", db: Boolean(process.env.DATABASE_URL) });
      return;
    }
    if (req.method === "POST" && (url.pathname === "/api/ai" || url.pathname === "/ai")) {
      const body = await readBody(req);
      const out = await handleAi(body);
      json(res, out.status, out.body);
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/auth/register") {
      const body = await readBody(req);
      const out = await handleRegister(body);
      json(res, out.status, out.body);
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/auth/login") {
      const body = await readBody(req);
      const out = await handleLogin(body);
      json(res, out.status, out.body);
      return;
    }
    json(res, 404, { error: "not_found" });
  } catch (e) {
    json(res, 500, { error: "server", message: "AI временно недоступен. Попробуйте ещё раз." });
  }
});

server.listen(PORT, () => {
  console.log(`SMART SCHOOL API on :${PORT}`);
});
