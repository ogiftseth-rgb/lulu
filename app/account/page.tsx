import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAccount } from "@/app/actions";
import { getOrders } from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";
import { kes } from "@/lib/utils";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const orders = await getOrders(user.id);
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-display text-5xl">Hello, {user.firstName}</h1>
      <p className="mt-2">{user.email} · {user.phone}</p>
      <form action={logoutAccount} className="mt-4"><button className="underline">Log out</button></form>
      {user.role !== "CUSTOMER" && <p className="mt-4"><Link href="/admin" className="underline">Open the studio desk</Link></p>}
      <h2 className="mt-10 font-display text-3xl">Orders</h2>
      <div className="mt-4 space-y-4">
        {orders.length === 0 && <p>No orders yet. <Link href="/shop" className="underline">Visit the shop</Link></p>}
        {orders.map((order) => (
          <article key={order.id} className="rounded-3xl bg-white p-5">
            <div className="flex justify-between gap-4">
              <h3 className="font-semibold">{order.number}</h3>
              <span>{kes(order.total)}</span>
            </div>
            <p className="text-sm text-rose">{order.status.replaceAll("_", " ")} · {new Date(order.created_at).toLocaleDateString("en-KE")}</p>
            <ul className="mt-3 text-sm">
              {order.glam_order_items.map((item: { name: string; quantity: number; size: string; colour: string }) => (
                <li key={`${item.name}-${item.size}`}>{item.name} · {item.colour} / {item.size} × {item.quantity}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </main>
  );
}
