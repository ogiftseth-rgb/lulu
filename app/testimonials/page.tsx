import type { Metadata } from "next";
import { PageHero } from "@/components/site-footer";
import { getReviews } from "@/lib/queries";

export const metadata: Metadata = { title: "Testimonials" };

export default async function TestimonialsPage() {
  const reviews = await getReviews();
  return (
    <main>
      <PageHero title="Testimonials" image="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80" />
      <section className="quote-list">
        {reviews.map((review) => (
          <blockquote key={review.id}>
            “{review.quote}”
            <footer>{review.authorName}{review.productName ? ` · ${review.productName}` : ""} · {"★".repeat(review.rating)}</footer>
          </blockquote>
        ))}
      </section>
    </main>
  );
}
