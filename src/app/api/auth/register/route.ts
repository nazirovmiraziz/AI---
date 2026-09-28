import { NextRequest } from "next/server";
import { registerAccount } from "@/lib/server/accounts";
import { handleAuth } from "@/lib/server/auth-route";

export async function POST(req: NextRequest) {
  return handleAuth(req, "/api/auth/register", registerAccount);
}
