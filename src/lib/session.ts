import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { userRepository } from "@/repositories/user.repository";

export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value ?? null;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return null;
  const user = await userRepository.findById(payload.userId);
  if (!user) return null;
  return { id: user.id, email: user.email, role: user.role };
}

export function getTokenFromRequest(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/auth_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}
