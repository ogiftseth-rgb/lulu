import { redirect } from "next/navigation";
import { getCurrentUser, type SessionUser } from "@/lib/session";

export const STAFF_ROLES = ["SUPER_ADMIN", "STORE_MANAGER", "SALES_STAFF", "CONTENT_MANAGER", "FINANCE_MANAGER"] as const;

export function isStaffRole(role: string | null | undefined) {
  return STAFF_ROLES.includes(role as (typeof STAFF_ROLES)[number]);
}

export async function requireStaff(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isStaffRole(user.role)) redirect("/account");
  return user;
}
