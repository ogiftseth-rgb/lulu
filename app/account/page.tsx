import type { Metadata } from "next";
import Link from "@/components/nav-link";
import { redirect } from "next/navigation";
import { logoutAccount, updateProfile } from "@/app/actions";
import { getOrders } from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/supabase";
import { kes } from "@/lib/utils";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const notice = (await searchParams).notice;
  const [orders, bespoke] = await Promise.all([
    getOrders(user.id),
    db()
      .from("glam_bespoke_requests")
      .select("id, outfit_type, occasion, event_date, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);
  const requests = bespoke.data ?? [];
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-display text-5xl">Hello, {user.firstName}</h1>
      <p className="mt-2">{user.email}</p>
      {notice ? <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm">{notice}</p> : null}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <Link href="/wishlist" className="underline">Saved pieces</Link>
        {user.role !== "CUSTOMER" ? <Link href="/admin" className="underline">Open the studio desk</Link> : null}
        <form action={logoutAccount}><button className="underline">Log out</button></form>
      </div>
      <form action={updateProfile} className="mt-10 grid gap-3 rounded-[2rem] bg-white p-6 sm:grid-cols-2">
        <h2 className="font-display text-3xl sm:col-span-2">Profile</h2>
        <label className="text-sm">First name<input name="firstName" required defaultValue={user.firstName} /></label>
        <label className="text-sm">Last name<input name="lastName" required defaultValue={user.lastName} /></label>
        <label className="text-sm sm:col-span-2">Phone<input name="phone" required defaultValue={user.phone ?? ""} /></label>
        <label className="text-sm">Current password<input name="currentPassword" type="password" autoComplete="current-password" /></label>
        <label className="text-sm">New password<input name="nextPassword" type="password" autoComplete="new-password" placeholder="Leave blank to keep it" /></label>
        <button className="w-fit rounded-full bg-burgundy px-5 py-2 text-sm text-ivory">Save profile</button>
      </form>
      <h2 className="mt-10 font-display text-3xl">Orders</h2>
      <div className="mt-4 space-y-4">
        {orders.length === 0 ? <p>No orders yet. <Link href="/shop" className="underline">Visit the shop</Link></p> : null}
        {orders.map((order) => (
          <article key={order.id} className="rounded-3xl bg-white p-5">
            <div className="flex justify-between gap-4">
              <h3 className="font-semibold">{order.number}</h3>
              <span>{kes(order.total)}</span>
            </div>
            <p className="text-sm text-rose">{order.status.replaceAll("_", " ")} · {new Date(order.created_at).toLocaleDateString("en-KE")}</p>
            <ul className="mt-3 text-sm">
              {order.glam_order_items.map((item: { name: string; quantity: number; size: string; colour: string }) => (
                <li key={`${item.name}-${item.size}-${item.colour}`}>{item.name} · {item.colour} / {item.size} × {item.quantity}</li>
              ))}
            </ul>
            <Link href={`/account/orders/${order.number}`} className="mt-3 inline-block text-sm underline">Receipt and tracking</Link>
          </article>
        ))}
      </div>
      <h2 className="mt-10 font-display text-3xl">Bespoke requests</h2>
      <div className="mt-4 space-y-4">
        {requests.length === 0 ? <p>No consultations yet. <Link href="/bespoke" className="underline">Request one</Link></p> : null}
        {requests.map((request) => (
          <article key={request.id} className="rounded-3xl bg-white p-5">
            <h3 className="font-semibold">{request.outfit_type}</h3>
            <p className="text-sm text-rose">{request.status} · {request.occasion} · {request.event_date}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
