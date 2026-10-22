import type { Metadata } from "next";
import { updateOrderStatus } from "@/app/admin/actions";
import { db } from "@/lib/supabase";
import { kes } from "@/lib/utils";

export const metadata: Metadata = { title: "Orders · Admin" };

const statuses = ["pending_payment", "confirmed", "in_production", "ready", "delivered", "cancelled"];

export default async function AdminOrdersPage() {
  const { data } = await db()
    .from("glam_orders")
    .select("id, number, name, email, phone, town, county, total, status, delivery_method, created_at, glam_order_items(name, quantity, size, colour)")
    .order("created_at", { ascending: false });
  const orders = data ?? [];

  return (
    <section className="space-y-6">
      <p>Changing a status records it on the order. It does not take an M-Pesa payment.</p>
      {orders.length === 0 && <p>No orders yet.</p>}
      {orders.map((order) => (
        <article key={order.id} className="border-t border-champagne pt-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-display text-3xl">{order.number}</h2>
            <p>{kes(order.total)}</p>
          </div>
          <p className="mt-1 text-sm">{order.name} · {order.email} · {order.phone}</p>
          <p className="text-sm text-onyx/70">{order.town}, {order.county} · {order.delivery_method} · {new Date(order.created_at).toLocaleString("en-KE")}</p>
          <ul className="mt-3 text-sm">
            {(order.glam_order_items ?? []).map((item: { name: string; quantity: number; size: string; colour: string }) => (
              <li key={`${item.name}-${item.size}-${item.colour}`}>{item.name} · {item.colour} / {item.size} × {item.quantity}</li>
            ))}
          </ul>
          <form action={updateOrderStatus} className="mt-3 flex flex-wrap items-center gap-3">
            <input type="hidden" name="id" value={order.id} />
            <select name="status" defaultValue={order.status} aria-label={`${order.number} status`}>
              {statuses.map((status) => (
                <option key={status} value={status}>{status.replaceAll("_", " ")}</option>
              ))}
            </select>
            <button className="rounded-full bg-burgundy px-4 py-2 text-sm text-ivory">Update status</button>
          </form>
        </article>
      ))}
    </section>
  );
}
