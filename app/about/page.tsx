import type { Metadata } from "next";
import { Photo } from "@/components/photo";
import { PageHero } from "@/components/site-footer";
import { getPageContent, getPosts } from "@/lib/queries";
import Link from "next/link";

export const metadata: Metadata = { title: "About Us" };

export default async function AboutPage() {
  const [pages, posts] = await Promise.all([getPageContent(), getPosts()]);
  const story = pages.story;
  const blocks = ["mission", "vision", "philosophy", "different", "craft", "quality"].map((key) => pages[key]).filter(Boolean);
  return (
    <main>
      <PageHero title="About Us" image={story?.imageUrl ?? "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80"} />
      <section className="mx-auto max-w-4xl px-4 py-16">
        <p className="text-sm uppercase tracking-[0.25em] text-rose">Inspired by women. Defined by elegance.</p>
        <h2 className="mt-3 font-display text-5xl">{story?.title ?? "Our Story"}</h2>
        <p className="mt-6 text-lg leading-8">{story?.body}</p>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-16 md:grid-cols-3">
        {blocks.map((block) => (
          <article key={block.title}>
            <h3 className="font-display text-3xl">{block.title}</h3>
            <p className="mt-3 leading-7 text-onyx/75">{block.body}</p>
          </article>
        ))}
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <h2 className="font-display text-4xl">From the journal</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {posts.slice(0, 2).map((post) => (
            <article key={post.id}>
              <Link href={`/blog/${post.slug}`} className="story-photo">
                <Photo src={post.imageUrl} alt="" sizes="(max-width: 800px) 100vw, 40vw" />
              </Link>
              <h3 className="mt-3 font-display text-2xl"><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
