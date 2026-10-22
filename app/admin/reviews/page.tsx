import type { Metadata } from "next";
import { setReviewApproval } from "@/app/admin/actions";
import { db } from "@/lib/supabase";

export const metadata: Metadata = { title: "Reviews · Admin" };

export default async function AdminReviewsPage() {
  const { data } = await db()
    .from("glam_reviews")
    .select("id, author_name, quote, rating, approved, created_at, glam_products(name)")
    .order("created_at", { ascending: false });
  const reviews = data ?? [];

  return (
    <section className="space-y-6">
      <p>Only approved notes appear on the homepage, testimonials, and product pages.</p>
      {reviews.map((review) => {
        const product = Array.isArray(review.glam_products) ? review.glam_products[0] : review.glam_products;
        return (
          <article key={review.id} className="border-t border-champagne pt-5">
            <p className="font-display text-2xl leading-snug">“{review.quote}”</p>
            <p className="mt-2 text-sm text-rose">
              {review.author_name} · {"★".repeat(review.rating)}
              {product?.name ? ` · ${product.name}` : ""} · {review.approved ? "Approved" : "Hidden"}
            </p>
            <form action={setReviewApproval} className="mt-3">
              <input type="hidden" name="id" value={review.id} />
              <input type="hidden" name="approved" value={review.approved ? "false" : "true"} />
              <button className="rounded-full border border-burgundy px-4 py-2 text-sm">
                {review.approved ? "Hide from the site" : "Approve"}
              </button>
            </form>
          </article>
        );
      })}
    </section>
  );
}
