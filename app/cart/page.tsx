import type { Metadata } from "next";
import Link from "@/components/nav-link";
import { removeCartItem, updateCartItem } from "@/app/actions";
import { getCart } from "@/lib/queries";
import { getCurrentUser, getGuestId } from "@/lib/session";
import { kes, priceOf } from "@/lib/utils";

export const metadata: Metadata = { title: "Cart" };

export default async function CartPage() {
  const user = await getCurrentUser();
  const lines = await getCart(user?.id ?? null, await getGuestId());
  const subtotal = lines.reduce((sum, line) => sum + priceOf(line.product) * line.quantity, 0);
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-display text-5xl">Your bag</h1>
      {lines.length === 0 && <p className="mt-6">Your bag is empty. <Link href="/shop" className="underline">Continue shopping</Link></p>}
      <ul className="mt-8 space-y-4">
        {lines.map((line) => (
          <li key={line.id} className="flex gap-4 py-4">
            {line.product.images[0]?.url ? (
              <img src={line.product.images[0].url} alt="" width={96} height={128} className="h-28 w-24 object-cover" />
            ) : null}
            <div className="flex-1">
              <h2 className="font-display text-2xl">{line.product.name}</h2>
              <p className="text-sm text-rose">{line.colour} / {line.size}</p>
              <p className="mt-1">{kes(priceOf(line.product) * line.quantity)}</p>
              <div className="mt-3 flex gap-2">
                <form action={updateCartItem}>
                  <input type="hidden" name="itemId" value={line.id} />
                  <input type="hidden" name="quantity" value={line.quantity + 1} />
                  <button className="rounded-full border px-3 py-1">+</button>
                </form>
                <form action={updateCartItem}>
                  <input type="hidden" name="itemId" value={line.id} />
                  <input type="hidden" name="quantity" value={Math.max(1, line.quantity - 1)} />
                  <button className="rounded-full border px-3 py-1">-</button>
                </form>
                <form action={removeCartItem}>
                  <input type="hidden" name="itemId" value={line.id} />
                  <button className="text-sm text-rose">Remove</button>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {lines.length > 0 && (
        <div className="mt-8 flex items-center justify-between">
          <p className="text-xl">Subtotal {kes(subtotal)}</p>
          <Link href="/checkout" className="rounded-full bg-burgundy px-6 py-3 text-ivory">Checkout</Link>
        </div>
      )}
    </main>
  );
}
