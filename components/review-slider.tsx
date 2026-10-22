"use client";

import { useState } from "react";

export function ReviewSlider({
  reviews,
}: {
  reviews: { id: string; authorName: string; quote: string; rating: number }[];
}) {
  const [index, setIndex] = useState(0);
  const review = reviews[index];
  if (!review) return null;
  return (
    <figure className="review">
      <blockquote>“{review.quote}”</blockquote>
      <figcaption>
        <span>{review.authorName}</span>
        <span>{"★".repeat(review.rating)}</span>
        <span className="review-nav">
          <button type="button" onClick={() => setIndex((index + reviews.length - 1) % reviews.length)} aria-label="Previous review">Prev</button>
          <button type="button" onClick={() => setIndex((index + 1) % reviews.length)} aria-label="Next review">Next</button>
        </span>
      </figcaption>
    </figure>
  );
}
