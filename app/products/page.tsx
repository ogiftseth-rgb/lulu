import type { Metadata } from "next";
import { ProductFigure } from "@/components/product-card";
import { PageHero } from "@/components/site-footer";
import { getProducts, getWishlistIds } from "@/lib/queries";
import { getCurrentUser, getGuestId } from "@/lib/session";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage() {
  const user = await getCurrentUser();
  const [products, wished] = await Promise.all([
    getProducts(),
    getWishlistIds(user?.id ?? null, await getGuestId()),
  ]);
  const edit = products.filter((product) => product.featured).concat(products).filter((product, index, list) => list.findIndex((item) => item.id === product.id) === index).slice(0, 8);
  return (
    <main>
      <PageHero title="Products" image={edit[0]?.images[0]?.url ?? ""} />
      <section className="pieces" style={{ maxWidth: "76rem", margin: "0 auto", padding: "3rem 1.25rem 4rem" }}>
        {edit.map((product, index) => <ProductFigure key={product.id} product={product} wished={wished.has(product.id)} index={index} />)}
      </section>
    </main>
  );
}
