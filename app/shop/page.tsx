import type { Metadata } from "next";
import Link from "@/components/nav-link";
import { ProductFigure } from "@/components/product-card";
import { PageHero } from "@/components/site-footer";
import { filterProducts, getCategories, getProducts, getWishlistIds } from "@/lib/queries";
import { getCurrentUser, getGuestId } from "@/lib/session";
import type { ShopQuery } from "@/lib/types";

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<ShopQuery> }) {
  const query = await searchParams;
  const user = await getCurrentUser();
  const [products, categories, wished] = await Promise.all([
    getProducts(),
    getCategories(),
    getWishlistIds(user?.id ?? null, await getGuestId()),
  ]);
  const items = filterProducts(products, query);
  const colours = [...new Set(products.flatMap((product) => product.variants.map((variant) => variant.colour)))];
  const occasions = [...new Set(products.map((product) => product.occasion))];
  const sizes = ["XS", "S", "M", "L", "XL"];
  return (
    <main>
      <PageHero title="Shop" image={products[0]?.images[0]?.url ?? ""} />
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-6 text-sm">
          <Filter title="Category" options={categories.map((category) => [category.slug, category.name])} param="category" query={query} />
          <Filter title="Occasion" options={occasions.map((occasion) => [occasion, occasion])} param="occasion" query={query} />
          <Filter title="Colour" options={colours.map((colour) => [colour, colour])} param="colour" query={query} />
          <Filter title="Size" options={sizes.map((size) => [size, size])} param="size" query={query} />
          <Filter title="Availability" options={[["in", "In stock"]]} param="availability" query={query} />
          <div>
            <h2 className="font-display text-2xl">Price</h2>
            <Link className="mt-2 block" href={href(query, { min: "0", max: "15000" })}>Under KES 15,000</Link>
            <Link className="mt-2 block" href={href(query, { min: "15000", max: "30000" })}>KES 15,000 – 30,000</Link>
            <Link className="mt-2 block" href={href(query, { min: "30000", max: "" })}>KES 30,000 and above</Link>
          </div>
          <Link href="/shop" className="inline-block underline">Clear filters</Link>
        </aside>
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p>Showing {items.length} pieces. Sample catalogue.</p>
            <div className="flex flex-wrap gap-2 text-sm">
              {[
                ["newest", "Newest"],
                ["oldest", "Oldest"],
                ["price-asc", "Price: low"],
                ["price-desc", "Price: high"],
                ["popularity", "Popularity"],
              ].map(([sort, label]) => (
                <Link key={sort} href={href(query, { sort })} className={`rounded-full px-3 py-1 ${query.sort === sort || (!query.sort && sort === "newest") ? "bg-burgundy text-ivory" : "bg-white"}`}>{label}</Link>
              ))}
            </div>
          </div>
          <div className="pieces shop-pieces">
            {items.map((product, index) => <ProductFigure key={product.id} product={product} wished={wished.has(product.id)} index={index} />)}
          </div>
        </div>
      </section>
    </main>
  );
}

function href(query: ShopQuery, patch: Record<string, string>) {
  const params = new URLSearchParams();
  const next = { ...query, ...patch };
  for (const [key, value] of Object.entries(next)) {
    if (value) params.set(key, value);
  }
  const text = params.toString();
  return text ? `/shop?${text}` : "/shop";
}

function Filter({ title, options, param, query }: { title: string; options: string[][]; param: keyof ShopQuery; query: ShopQuery }) {
  return (
    <div>
      <h2 className="font-display text-2xl">{title}</h2>
      <ul className="mt-2 space-y-1">
        {options.map(([value, label]) => (
          <li key={value}>
            <Link href={href(query, { [param]: query[param] === value ? "" : value })} className={query[param] === value ? "font-semibold text-rose" : ""}>{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
