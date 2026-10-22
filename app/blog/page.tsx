import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/photo";
import { PageHero } from "@/components/site-footer";
import { getPosts } from "@/lib/queries";

export const metadata: Metadata = { title: "The Glam Journal" };

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <main>
      <PageHero title="The Glam Journal" image={posts[0]?.imageUrl ?? ""} />
      <section className="journal-list">
        {posts.map((post) => (
          <article key={post.id} className="article">
            <Link href={`/blog/${post.slug}`} className="article-photo">
              <Photo src={post.imageUrl} alt="" sizes="(max-width: 800px) 100vw, 40vw" />
            </Link>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-rose">{post.category.name}</p>
            <h2><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2>
            <p className="mt-3 text-onyx/75">{post.excerpt}</p>
            <p className="mt-3 text-sm">{post.author} · {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-KE") : ""}</p>
            <Link href={`/blog/${post.slug}`} className="mt-4 inline-block underline">Read more</Link>
          </article>
        ))}
      </section>
    </main>
  );
}
