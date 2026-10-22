import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/forms";
import { OrderSheet } from "@/components/order-sheet";
import { getCart, getOrderByNumber } from "@/lib/queries";
import { getCurrentUser, getGuestId } from "@/lib/session";
import { kes, priceOf } from "@/lib/utils";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ placed?: string }> }) {
  const placed = (await searchParams).placed;
  const placedOrder = placed ? await getOrderByNumber(placed) : null;
  const user = await getCurrentUser();
  const lines = await getCart(user?.id ?? null, await getGuestId());
  const subtotal = lines.reduce((sum, line) => sum + priceOf(line.product) * line.quantity, 0);
  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2">
      <section>
        <h1 className="font-display text-5xl">Checkout</h1>
        {placed && placedOrder ? (
          <div className="mt-6 space-y-4">
            <OrderSheet order={placedOrder} kind="receipt" />
            {user ? <Link href="/account" className="inline-block underline">View your account</Link> : null}
          </div>
        ) : (
          <div className="mt-6"><CheckoutForm empty={lines.length === 0} /></div>
        )}
      </section>
      <aside className="rounded-[2rem] bg-white p-6">
        <h2 className="font-display text-3xl">Summary</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {lines.map((line) => (
            <li key={line.id} className="flex justify-between gap-4">
              <span>{line.product.name} × {line.quantity}</span>
              <span>{kes(priceOf(line.product) * line.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 font-semibold">Pieces {kes(subtotal)}</p>
        <p className="text-sm text-rose">Delivery is added from the option you choose.</p>
      </aside>
    </main>
  );
}
