import Link from "next/link";
import { Photo } from "@/components/photo";
import type { HeroSlide } from "@/lib/types";

export function Hero({ slide, reviewCount }: { slide: HeroSlide | undefined; reviewCount: number }) {
  if (!slide) return null;
  return (
    <section className="hero torn">
      <Photo src={slide.imageUrl} alt="" priority sizes="100vw" />
      <div className="hero-shade" />
      <div className="hero-copy">
        <p className="monogram" aria-hidden="true"><span>GL</span></p>
        <h1>{slide.heading}</h1>
        <p>{slide.description}</p>
        <div className="hero-actions">
          <Link href={slide.primaryHref} className="pill">{slide.primaryLabel}</Link>
          {slide.secondaryHref && slide.secondaryLabel ? (
            <Link href={slide.secondaryHref} className="pill pill-ghost">{slide.secondaryLabel}</Link>
          ) : null}
        </div>
        <p className="hero-notes">{reviewCount}+ approved client notes</p>
      </div>
    </section>
  );
}
