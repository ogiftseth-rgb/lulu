import { db } from "@/lib/supabase";

export type Coupon = { code: string; percent: number };

export async function readCoupons(): Promise<Coupon[]> {
  const { data } = await db().from("glam_settings").select("value").eq("key", "coupons").maybeSingle();
  if (!data?.value) return [];
  try {
    const parsed = JSON.parse(data.value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const code = String((item as { code?: unknown }).code ?? "").trim().toUpperCase();
      const percent = Number((item as { percent?: unknown }).percent);
      if (!code || !Number.isFinite(percent) || percent <= 0 || percent > 100) return [];
      return [{ code, percent: Math.round(percent) }];
    });
  } catch {
    return [];
  }
}

export function couponsToText(coupons: Coupon[]) {
  return coupons.map((coupon) => `${coupon.code} ${coupon.percent}`).join("\n");
}

export function parseCouponText(raw: string): Coupon[] | null {
  const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const coupons: Coupon[] = [];
  for (const line of lines) {
    const [code, percentRaw] = line.split(/\s+/);
    const percent = Number(percentRaw);
    if (!code || !/^[A-Za-z0-9-]{3,20}$/.test(code) || !Number.isInteger(percent) || percent < 1 || percent > 100) {
      return null;
    }
    coupons.push({ code: code.toUpperCase(), percent });
  }
  return coupons;
}
