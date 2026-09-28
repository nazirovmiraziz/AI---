import { neon } from "@neondatabase/serverless";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

type Sql = ReturnType<typeof neon>;
type Row = { id: string; email: string; name: string; password: string; profile: Record<string, unknown> | null };
export type AuthResult = { status: number; body: Record<string, unknown> };

let schemaReady: Promise<void> | null = null;

function sql(): Sql | null {
  const url = process.env.DATABASE_URL;
  return url ? neon(url) : null;
}

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

/** Same table as backend/server.mjs, so accounts created there keep working. */
function ensureSchema(db: Sql) {
  schemaReady ??= db`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      profile JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `.then(() => undefined);
  return schemaReady;
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `scrypt$${salt}$${scryptSync(password, salt, 32).toString("hex")}`;
}

/** Older backend rows store the password as plain text; those still verify and get re-hashed. */
function checkPassword(password: string, stored: string) {
  if (!stored.startsWith("scrypt$")) return { ok: stored === password, legacy: true };
  const [, salt, hex] = stored.split("$");
  const want = Buffer.from(hex, "hex");
  const got = scryptSync(password, salt, want.length);
  return { ok: got.length === want.length && timingSafeEqual(got, want), legacy: false };
}

function cleanProfile(profile: unknown) {
  if (!profile || typeof profile !== "object") return {};
  const { password: _p, ...rest } = profile as Record<string, unknown>;
  const text = JSON.stringify(rest);
  return text.length > 400_000 ? {} : rest;
}

function publicUser(row: Row) {
  return { ...(row.profile ?? {}), id: row.id, email: row.email, name: row.name };
}

async function findUser(db: Sql, email: string) {
  const rows = (await db`SELECT id, email, name, password, profile FROM users WHERE email = ${email} LIMIT 1`) as Row[];
  return rows[0] ?? null;
}

const NO_DB: AuthResult = { status: 503, body: { error: "no_db", message: "Облачная база не подключена." } };

export async function registerAccount(body: Record<string, unknown>): Promise<AuthResult> {
  const db = sql();
  if (!db) return NO_DB;
  await ensureSchema(db);
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const name = String(body.name || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 6 || name.length < 2) {
    return { status: 400, body: { error: "invalid", message: "Проверь имя, почту и пароль (не короче 6 символов)." } };
  }
  const existing = await findUser(db, email);
  if (existing) {
    if (!checkPassword(password, existing.password).ok) {
      return { status: 409, body: { error: "exists", message: "Эта почта уже зарегистрирована. Войди с её паролем." } };
    }
    return { status: 200, body: { ok: true, user: publicUser(existing) } };
  }
  const profile = cleanProfile(body.profile);
  const id = typeof profile.id === "string" ? profile.id : `u-${randomBytes(5).toString("hex")}`;
  await db`
    INSERT INTO users (id, email, password, name, profile)
    VALUES (${id}, ${email}, ${hashPassword(password)}, ${name}, ${JSON.stringify(profile)}::jsonb)
  `;
  return { status: 200, body: { ok: true, user: { ...profile, id, email, name } } };
}

export async function loginAccount(body: Record<string, unknown>): Promise<AuthResult> {
  const db = sql();
  if (!db) return NO_DB;
  await ensureSchema(db);
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const row = await findUser(db, email);
  const check = row ? checkPassword(password, row.password) : { ok: false, legacy: false };
  if (!row || !check.ok) {
    return { status: 401, body: { error: "auth", message: "Неверная почта или пароль." } };
  }
  if (check.legacy) await db`UPDATE users SET password = ${hashPassword(password)} WHERE id = ${row.id}`;
  return { status: 200, body: { ok: true, user: publicUser(row) } };
}

export async function saveAccount(body: Record<string, unknown>): Promise<AuthResult> {
  const db = sql();
  if (!db) return NO_DB;
  await ensureSchema(db);
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const row = await findUser(db, email);
  if (!row || !checkPassword(password, row.password).ok) {
    return { status: 401, body: { error: "auth", message: "Сессия устарела. Войди снова." } };
  }
  const profile = cleanProfile(body.profile);
  const name = typeof profile.name === "string" && profile.name.trim() ? profile.name.trim() : row.name;
  await db`
    UPDATE users SET profile = ${JSON.stringify(profile)}::jsonb, name = ${name}, updated_at = now()
    WHERE id = ${row.id}
  `;
  return { status: 200, body: { ok: true } };
}
