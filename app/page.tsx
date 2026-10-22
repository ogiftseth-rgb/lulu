import Link from "next/link";
import { Gem, Ruler, Scissors, Sparkles } from "lucide-react";
import { Hero } from "@/components/hero";
import { Photo } from "@/components/photo";
import { ProductFigure } from "@/components/product-card";
import { ReviewSlider } from "@/components/review-slider";
import { getPageContent, getPosts, getProducts, getHeroSlides, getReviews, getSettings, getTeam, getWishlistIds, reviewCount } from "@/lib/queries";
import { getCurrentUser, getGuestId } from "@/lib/session";

const occasions = [
  ["Weddings", "Weddings"],
  ["Ruracio", "Ruracio celebrations"],
  ["Corporate", "Corporate events"],
] as const;

export default async function HomePage() {
  const user = await getCurrentUser();
  const sessionId = await getGuestId();
  const [slides, products, reviews, posts, team, pages, settings, wished, notes] = await Promise.all([
    getHeroSlides(),
    getProducts(),
    getReviews(),
    getPosts(),
    getTeam(),
    getPageContent(),
    getSettings(),
    getWishlistIds(user?.id ?? null, sessionId),
    reviewCount(),
  ]);
  const story = pages.story;
  const featured = products.filter((product) => product.featured).slice(0, 4);
  const looks = occasions.map(([label, occasion]) => {
    const match = products.find((product) => product.occasion === occasion);
    return { label, occasion, image: match?.images[0]?.url ?? "" };
  });
  const promises = [
    [Scissors, "Bespoke fit", "Patterns start from your measurements."],
    [Sparkles, "Occasion cloth", "Crepe, silk, and beadwork for Kenyan evenings."],
    [Gem, "Quiet finishing", "Linings and hems meant to disappear."],
    [Ruler, "Studio care", "Fittings in Westlands, Sundays by appointment."],
  ] as const;

  return (
    <main>
      <Hero slide={slides[0]} reviewCount={notes} />
      <section className="promise-row">
        {promises.map(([Icon, title, copy]) => (
          <article key={title} className="promise">
            <Icon aria-hidden="true" />
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>
      <section className="split">
        <div>
          <p className="watermark" aria-hidden="true">About</p>
          <h2>Where fashion becomes an <span className="rose">expression</span> of you.</h2>
          <p className="mt-5 leading-7">{story?.body}</p>
          <div className="highlights">
            <article><h3>Premium cloth</h3><p>Chosen for drape, not for a logo.</p></article>
            <article><h3>Personal cut</h3><p>Ready to wear, then altered, or bespoke.</p></article>
          </div>
          <div className="hero-actions" style={{ justifyContent: "flex-start" }}>
            <Link href="/about" className="pill">More about us</Link>
            <a className="pill pill-ghost" style={{ color: "#201b1a", borderColor: "#d8c2af" }} href={settings.instagram}>Instagram</a>
          </div>
        </div>
        <div className="portrait">
          <Photo src={story?.imageUrl ?? slides[0]?.imageUrl ?? ""} alt="Glam by Lulu atelier" sizes="(max-width: 900px) 100vw, 40vw" />
          <p className="since">Since <strong>{settings.since}</strong></p>
        </div>
      </section>
      <section className="band">
        <div className="band-inner">
          <h2>Made for you. Only you.</h2>
          <ul>
            <li>Measured for your silhouette</li>
            <li>Cloth chosen for the occasion you are actually attending</li>
            <li>Fittings before the date, not after the photographs</li>
          </ul>
          <Link href="/bespoke">Request a consultation</Link>
        </div>
      </section>
      <section className="edit">
        <div className="edit-head">
          <h2>Our favourites, <span className="rose">your edit</span></h2>
          <Link href="/shop">View all categories</Link>
        </div>
        <div className="looks">
          {looks.map((look) => (
            <Link key={look.occasion} href={`/shop?occasion=${encodeURIComponent(look.occasion)}`} className="look">
              <Photo src={look.image} alt="" sizes="(max-width: 800px) 100vw, 30vw" />
              <span>{look.label}</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="product-band">
        <div className="product-band-inner">
          <div className="product-head">
            <h2>Discover a new <span className="rose">favourite</span></h2>
            <Link href="/products">View all products</Link>
          </div>
          <div className="pieces">
            {featured.map((product, index) => (
              <ProductFigure key={product.id} product={product} wished={wished.has(product.id)} index={index} light />
            ))}
          </div>
        </div>
      </section>
      <section className="atelier">
        <div>
          <h2>Our atelier</h2>
          <p className="mt-4">The people who cut, fit, and finish the collection.</p>
          <Link href="/team" className="mt-4 inline-block underline">View the atelier</Link>
        </div>
        <div className="faces">
          {team.slice(0, 2).map((member) => (
            <article key={member.id} className="face">
              <div className="face-photo">
                <Photo src={member.imageUrl} alt={member.name} sizes="240px" />
              </div>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="voices">
        <div className="voices-inner">
          <div>
            <h2>What clients say</h2>
            <Link href="/testimonials" className="mt-4 inline-block underline">View all reviews</Link>
          </div>
          <ReviewSlider reviews={reviews} />
        </div>
      </section>
      <section className="journal">
        <div>
          <h2>Latest <span className="rose">journal</span></h2>
          <div className="stories">
            {posts.slice(0, 2).map((post) => (
              <article key={post.id}>
                <Link href={`/blog/${post.slug}`} className="story-photo">
                  <Photo src={post.imageUrl} alt="" sizes="(max-width: 700px) 100vw, 30vw" />
                </Link>
                <p className="mt-3 text-xs uppercase tracking-wide text-rose">{post.category.name}</p>
                <h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3>
              </article>
            ))}
          </div>
        </div>
        <div>
          <p>Notes from the studio on cloth, fittings, and the Kenyan calendar.</p>
          <ul className="notes">
            {posts.slice(0, 3).map((post) => <li key={post.id}>{post.excerpt}</li>)}
          </ul>
          <Link href="/blog" className="pill" style={{ marginTop: "1.4rem" }}>View all journal</Link>
        </div>
      </section>
    </main>
  );
}
