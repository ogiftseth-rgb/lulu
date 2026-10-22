import type { Metadata } from "next";
import { updateProduct } from "@/app/admin/actions";
import { db } from "@/lib/supabase";

export const metadata: Metadata = { title: "Pieces · Admin" };

type Variant = { id: string; size: string; colour: string; stock: number };

export default async function AdminProductsPage() {
  const { data } = await db()
    .from("glam_products")
    .select("id, sku, name, regular_price, sale_price, featured, status, glam_product_variants(id, size, colour, stock)")
    .order("name");
  const products = data ?? [];

  return (
    <section className="space-y-8">
      <p>Published pieces appear in the shop. A draft stays in the desk and leaves the public catalogue.</p>
      {products.map((product) => {
        const variants = (product.glam_product_variants ?? []) as Variant[];
        return (
          <form key={product.id} action={updateProduct} className="grid gap-3 border-t border-champagne pt-6 md:grid-cols-[1.2fr_1fr]">
            <input type="hidden" name="id" value={product.id} />
            <div>
              <h2 className="font-display text-3xl">{product.name}</h2>
              <p className="text-sm text-rose">{product.sku}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">Regular price
                <input name="regularPrice" type="number" min="0" required defaultValue={product.regular_price} />
              </label>
              <label className="text-sm">Sale price
                <input name="salePrice" type="number" min="0" defaultValue={product.sale_price ?? ""} placeholder="None" />
              </label>
              <label className="text-sm">Status
                <select name="status" defaultValue={product.status} aria-label={`${product.name} status`}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </label>
              <label className="flex items-center gap-2 self-end text-sm">
                <input type="checkbox" name="featured" defaultChecked={product.featured} className="h-4 w-4" />
                Featured
              </label>
            </div>
            <div className="md:col-span-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {variants.map((variant) => (
                <label key={variant.id} className="text-sm">
                  {variant.size} / {variant.colour}
                  <input type="hidden" name="variantId" value={variant.id} />
                  <input name="stock" type="number" min="0" required defaultValue={variant.stock} aria-label={`${product.name} ${variant.size} ${variant.colour} stock`} />
                </label>
              ))}
            </div>
            <button className="w-fit rounded-full bg-burgundy px-5 py-2 text-sm text-ivory">Save piece</button>
          </form>
        );
      })}
    </section>
  );
}
