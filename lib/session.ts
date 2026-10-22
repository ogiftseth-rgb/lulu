import { cookies, headers } from "next/headers";
import { db } from "@/lib/supabase";

export type SessionUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: string;
};

export const GUEST_COOKIE = "glam_guest";
export const AUTH_COOKIE = "glam_session";

export async function getGuestId() {
  const headerStore = await headers();
  const fromHeader = headerStore.get("x-guest-id");
  if (fromHeader) return fromHeader;
  const jar = await cookies();
  return jar.get(GUEST_COOKIE)?.value ?? "guest";
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  const { data } = await db()
    .from("glam_sessions")
    .select("expires_at, glam_users(id, first_name, last_name, email, phone, role)")
    .eq("token", token)
    .maybeSingle();
  if (!data || new Date(data.expires_at) < new Date()) return null;
  const user = Array.isArray(data.glam_users) ? data.glam_users[0] : data.glam_users;
  if (!user) return null;
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
}

export async function setAuthCookie(token: string) {
  const jar = await cookies();
  jar.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearAuthCookie() {
  const jar = await cookies();
  jar.delete(AUTH_COOKIE);
}
