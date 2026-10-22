import type { Metadata } from "next";
import { saveSettings } from "@/app/admin/actions";
import { couponsToText, readCoupons } from "@/lib/coupons";
import { db } from "@/lib/supabase";

export const metadata: Metadata = { title: "Settings · Admin" };

const fields = [
  ["business_name", "Business name"],
  ["tagline", "Tagline"],
  ["phone", "Phone"],
  ["whatsapp", "WhatsApp number"],
  ["email", "Email"],
  ["address", "Address"],
  ["instagram", "Instagram URL"],
  ["facebook", "Facebook URL"],
  ["since", "Since"],
  ["hours_week", "Weekday hours"],
  ["hours_saturday", "Saturday hours"],
  ["hours_sunday", "Sunday hours"],
] as const;

export default async function AdminSettingsPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const notice = (await searchParams).notice;
  const [{ data }, coupons] = await Promise.all([
    db().from("glam_settings").select("key, value"),
    readCoupons(),
  ]);
  const settings: Record<string, string> = {};
  for (const row of data ?? []) settings[row.key] = row.value;

  return (
    <section>
      {notice ? <p className="mb-4 rounded-2xl bg-white px-4 py-3 text-sm">{notice}</p> : null}
      <form action={saveSettings} className="grid gap-3 rounded-[2rem] bg-white p-6 md:grid-cols-2">
        <h2 className="font-display text-3xl md:col-span-2">Studio details</h2>
        {fields.map(([key, label]) => (
          <label key={key} className="text-sm">{label}
            <input name={key} required defaultValue={settings[key] ?? ""} />
          </label>
        ))}
        <label className="text-sm md:col-span-2">Coupons
          <textarea name="coupons" defaultValue={couponsToText(coupons)} placeholder={"ATELIER10 10\nOne code and a percent per line"} />
        </label>
        <p className="text-sm text-onyx/70 md:col-span-2">A line such as ATELIER10 10 takes 10 percent off the pieces. It does not change delivery. Leave the box empty to turn coupons off.</p>
        <button className="w-fit rounded-full bg-burgundy px-5 py-2 text-sm text-ivory">Save details</button>
      </form>
    </section>
  );
}
