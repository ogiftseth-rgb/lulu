import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/supabase";
import { kes } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin" };

async function count(table: string, filter?: { column: string; value: string | boolean }) {
  let query = db().from(table).select("id", { count: "exact", head: true });
  if (filter) query = query.eq(filter.column, filter.value);
  const { count: total } = await query;
  return total ?? 0;
}

export default async function AdminHomePage() {
  const [pieces, orders, awaiting, reviews, bespoke, enquiries, subscribers, recent] = await Promise.all([
    count("glam_products"),
    count("glam_orders"),
    count("glam_orders", { column: "status", value: "pending_payment" }),
    count("glam_reviews", { column: "approved", value: false }),
    count("glam_bespoke_requests", { column: "status", value: "New Request" }),
    count("glam_enquiries"),
    count("glam_subscribers"),
    db().from("glam_orders").select("id, number, name, total, status, created_at").order("created_at", { ascending: false }).limit(5),
  ]);
  const cards = [
    ["Pieces", pieces, "/admin/products"],
    ["Orders", orders, "/admin/orders"],
    ["Awaiting payment", awaiting, "/admin/orders"],
    ["Reviews to approve", reviews, "/admin/reviews"],
    ["New bespoke requests", bespoke, "/admin/requests"],
    ["Enquiries", enquiries, "/admin/requests"],
    ["Newsletter", subscribers, "/admin/requests"],
  ] as const;

  return (
    <section>
      <p className="max-w-2xl leading-7">
        This desk reads the live catalogue. Marking an order confirmed does not send an M-Pesa charge. Payment stays pending until those keys are connected.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value, href]) => (
          <Link key={label} href={href} className="border border-champagne/70 px-5 py-4">
            <p className="text-sm text-onyx/70">{label}</p>
            <p className="mt-1 font-display text-4xl">{value}</p>
          </Link>
        ))}
      </div>
      <h2 className="mt-10 font-display text-3xl">Latest orders</h2>
      <ul className="mt-4 divide-y divide-champagne/60">
        {(recent.data ?? []).length === 0 && <li className="py-3">No orders yet.</li>}
        {(recent.data ?? []).map((order) => (
          <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <span>{order.number} · {order.name}</span>
            <span className="text-sm text-rose">{order.status.replaceAll("_", " ")} · {kes(order.total)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
