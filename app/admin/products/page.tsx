import type { Metadata } from "next";
import { createProduct, updateProduct } from "@/app/admin/actions";
import { db } from "@/lib/supabase";

export const metadata: Metadata = { title: "Pieces · Admin" };

type Variant = { id: string; size: string; colour: string; stock: number };

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const notice = (await searchParams).notice;
  const [{ data }, { data: categories }] = await Promise.all([
    db()
      .from("glam_products")
      .select("id, sku, name, regular_price, sale_price, featured, is_new, status, glam_product_variants(id, size, colour, stock)")
      .order("name"),
    db().from("glam_categories").select("id, name").order("sort_order"),
  ]);
  const products = data ?? [];

  return (
    <section className="space-y-8">
      {notice ? <p className="rounded-2xl bg-white px-4 py-3 text-sm">{notice}</p> : null}
      <p>Published pieces appear in the shop. A draft stays in the desk and leaves the public catalogue. New pieces are kept even if the demo catalogue is reset.</p>
      <form action={createProduct} className="grid gap-3 rounded-[2rem] bg-white p-6 md:grid-cols-2">
        <h2 className="font-display text-3xl md:col-span-2">Add a piece</h2>
        <label className="text-sm">Name<input name="name" required /></label>
        <label className="text-sm">SKU<input name="sku" required placeholder="GL-NEW-021" /></label>
        <label className="text-sm">Slug<input name="slug" placeholder="Optional, taken from the name" /></label>
        <label className="text-sm">Category
          <select name="categoryId" required aria-label="Category">
            {(categories ?? []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label className="text-sm md:col-span-2">Description<textarea name="description" required /></label>
        <label className="text-sm">Fabric<input name="fabric" required /></label>
        <label className="text-sm">Care<input name="care" required /></label>
        <label className="text-sm">Occasion<input name="occasion" required placeholder="Weddings" /></label>
        <label className="text-sm">Image URL<input name="imageUrl" required placeholder="https://" /></label>
        <label className="text-sm">Colour<input name="colour" required placeholder="Ivory" /></label>
        <label className="text-sm">Sizes<input name="sizes" required placeholder="XS, S, M, L, XL" /></label>
        <label className="text-sm">Regular price<input name="regularPrice" type="number" min="0" required /></label>
        <label className="text-sm">Sale price<input name="salePrice" type="number" min="0" placeholder="None" /></label>
        <label className="text-sm">Stock per size<input name="stock" type="number" min="0" required defaultValue={1} /></label>
        <label className="text-sm">Status
          <select name="status" defaultValue="draft" aria-label="New piece status">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" className="h-4 w-4" /> Featured</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isNew" className="h-4 w-4" /> New arrival</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="bespoke" className="h-4 w-4" /> Bespoke</label>
        <button className="w-fit rounded-full bg-burgundy px-5 py-2 text-sm text-ivory">Add piece</button>
      </form>
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
              <label className="flex items-center gap-2 self-end text-sm">
                <input type="checkbox" name="isNew" defaultChecked={product.is_new} className="h-4 w-4" />
                New arrival
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
