import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Photo } from "@/components/photo";
import { getPost, getPosts } from "@/lib/queries";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = await getPost((await params).slug);
  return { title: post?.title ?? "Journal", description: post?.excerpt };
}

export default async function ArticlePage({ params }: Params) {
  const slug = (await params).slug;
  const [post, posts] = await Promise.all([getPost(slug), getPosts()]);
  if (!post) notFound();
  return (
    <main>
      <article className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-sm uppercase tracking-[0.2em] text-rose">{post.category.name}</p>
        <h1 className="mt-3 font-display text-5xl">{post.title}</h1>
        <p className="mt-3 text-sm">{post.author} · {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-KE") : ""}</p>
        <div className="article-photo mt-6" style={{ aspectRatio: "16 / 9" }}>
          <Photo src={post.imageUrl} alt="" sizes="(max-width: 768px) 100vw, 720px" />
        </div>
        {post.content.split("\n").filter(Boolean).map((paragraph) => (
          <p key={paragraph} className="mt-5 leading-8">{paragraph}</p>
        ))}
        <div className="mt-8 flex gap-3 text-sm">
          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}`}>Share</a>
        </div>
      </article>
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <h2 className="font-display text-3xl">Related notes</h2>
        <ul className="mt-4 space-y-2">
          {posts.filter((item) => item.slug !== post.slug).slice(0, 3).map((item) => (
            <li key={item.id}><Link href={`/blog/${item.slug}`} className="underline">{item.title}</Link></li>
          ))}
        </ul>
      </section>
    </main>
  );
}
