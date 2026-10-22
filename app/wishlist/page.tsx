import type { Metadata } from "next";
import Link from "next/link";
import { ProductFigure } from "@/components/product-card";
import { getProducts, getWishlistIds } from "@/lib/queries";
import { getCurrentUser, getGuestId } from "@/lib/session";

export const metadata: Metadata = { title: "Saved pieces" };

export default async function WishlistPage() {
  const user = await getCurrentUser();
  const wished = await getWishlistIds(user?.id ?? null, await getGuestId());
  const products = (await getProducts()).filter((product) => wished.has(product.id));
  return (
    <main className="edit">
      <div className="edit-head">
        <h1 className="font-display text-5xl">Saved pieces</h1>
        <Link href="/shop">Back to the shop</Link>
      </div>
      {products.length === 0 ? (
        <p>Nothing is saved yet. Use Save on a piece and it will wait here.</p>
      ) : (
        <div className="pieces">
          {products.map((product, index) => (
            <ProductFigure key={product.id} product={product} wished index={index} />
          ))}
        </div>
      )}
    </main>
  );
}
