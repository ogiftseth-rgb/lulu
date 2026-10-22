import type { Metadata } from "next";
import Link from "@/components/nav-link";
import { notFound } from "next/navigation";
import { PurchasePanel } from "@/components/purchase-panel";
import { Photo } from "@/components/photo";
import { ProductFigure } from "@/components/product-card";
import { getProduct, getRelated, getReviews, getWishlistIds } from "@/lib/queries";
import { getCurrentUser, getGuestId } from "@/lib/session";
import { kes, priceOf } from "@/lib/utils";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  return { title: product?.name ?? "Piece" };
}

export default async function ProductPage({ params }: Params) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();
  const user = await getCurrentUser();
  const [related, reviews, wished] = await Promise.all([
    getRelated(product),
    getReviews(product.id),
    getWishlistIds(user?.id ?? null, await getGuestId()),
  ]);
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="gallery-stage">
          {product.images[0] ? (
            <div className="gallery-main">
              <Photo src={product.images[0].url} alt={product.images[0].alt} priority sizes="(max-width: 1024px) 100vw, 50vw" />
            </div>
          ) : null}
          {product.images.length > 1 ? (
            <div className="gallery-rest">
              {product.images.slice(1).map((image) => (
                <a key={image.url} href={image.url}>
                  <Photo src={image.url} alt={image.alt} sizes="20vw" />
                </a>
              ))}
            </div>
          ) : null}
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-rose">{product.category.name} · {product.sku}</p>
          <h1 className="mt-2 font-display text-5xl">{product.name}</h1>
          <p className="mt-4 text-2xl">
            {product.salePrice && <span className="mr-3 text-lg text-rose line-through">{kes(product.regularPrice)}</span>}
            {kes(priceOf(product))}
          </p>
          <p className="mt-5 leading-7">{product.description}</p>
          <div className="mt-6"><PurchasePanel product={product} /></div>
          {product.isBespoke && <Link href="/bespoke" className="mt-4 inline-block underline">Request a custom design</Link>}
          <dl className="mt-8 space-y-3 text-sm">
            <div><dt className="font-semibold">Fabric</dt><dd>{product.fabric}</dd></div>
            <div><dt className="font-semibold">Care</dt><dd>{product.care}</dd></div>
            <div><dt className="font-semibold">Occasion</dt><dd>{product.occasion}</dd></div>
            <div><dt className="font-semibold">Delivery</dt><dd>Studio collection in Westlands, Nairobi courier, or upcountry delivery. Fees are confirmed at checkout.</dd></div>
            <div><dt className="font-semibold">Size guide</dt><dd>XS to XL are ready-to-wear starts. Between sizes, choose the larger size or request a bespoke cut.</dd></div>
          </dl>
        </div>
      </div>
      <section className="mt-16">
        <h2 className="font-display text-4xl">Reviews</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <blockquote key={review.id}>
              <p className="font-display text-2xl leading-snug">“{review.quote}”</p>
              <footer className="mt-3 text-sm text-rose">{review.authorName} · {"★".repeat(review.rating)}</footer>
            </blockquote>
          ))}
          {reviews.length === 0 && <p>No approved reviews for this piece yet.</p>}
        </div>
      </section>
      <section className="mt-16">
        <h2 className="font-display text-4xl">Related pieces</h2>
        <div className="pieces mt-6">
          {related.map((item, index) => <ProductFigure key={item.id} product={item} wished={wished.has(item.id)} index={index} />)}
        </div>
      </section>
    </main>
  );
}
