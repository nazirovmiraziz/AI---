import { NextRequest, NextResponse } from "next/server";
import { hasDatabase, type AuthResult } from "./accounts";

/**
 * DATABASE_URL on this deployment → talk to Neon directly.
 * Otherwise fall back to the separate backend (API_URL), or report local-only mode.
 */
export async function handleAuth(
  req: NextRequest,
  upstreamPath: string | null,
  direct: (body: Record<string, unknown>) => Promise<AuthResult>
) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (hasDatabase()) {
    try {
      const out = await direct(body);
      return NextResponse.json(out.body, { status: out.status });
    } catch {
      return NextResponse.json({ error: "db", message: "База временно недоступна. Данные сохранены на этом устройстве." }, { status: 503 });
    }
  }
  const api = process.env.API_URL?.replace(/\/$/, "");
  if (!api || !upstreamPath) return NextResponse.json({ ok: false, local: true });
  try {
    const res = await fetch(`${api}${upstreamPath}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({ error: "upstream" }));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "network", message: "Сервер аккаунтов недоступен." }, { status: 503 });
  }
}
