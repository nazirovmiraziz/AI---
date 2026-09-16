import { NextRequest, NextResponse } from "next/server";

async function proxy(req: NextRequest, path: string) {
  const api = process.env.API_URL?.replace(/\/$/, "");
  if (!api) {
    return NextResponse.json({ error: "no_api", message: "Бэкенд ещё не подключён." }, { status: 503 });
  }
  const res = await fetch(`${api}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await req.text(),
  });
  const data = await res.json().catch(() => ({ error: "upstream" }));
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  return proxy(req, "/api/auth/register");
}
