import type { Metadata } from "next";
import { savePost } from "@/app/admin/actions";
import { db } from "@/lib/supabase";

export const metadata: Metadata = { title: "Journal · Admin" };

export default async function AdminJournalPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const notice = (await searchParams).notice;
  const [{ data: posts }, { data: categories }] = await Promise.all([
    db().from("glam_blog_posts").select("*, glam_blog_categories(name)").order("title"),
    db().from("glam_blog_categories").select("id, name").order("name"),
  ]);

  return (
    <section className="space-y-10">
      {notice ? <p className="rounded-2xl bg-white px-4 py-3 text-sm">{notice}</p> : null}
      <PostForm categories={categories ?? []} />
      {(posts ?? []).map((post) => (
        <PostForm key={post.id} categories={categories ?? []} post={post} />
      ))}
    </section>
  );
}

function PostForm({
  categories,
  post,
}: {
  categories: { id: string; name: string }[];
  post?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    image_url: string;
    author: string;
    category_id: string;
    published_at: string | null;
    highlights: string[] | null;
  };
}) {
  return (
    <form action={savePost} className="grid gap-3 rounded-[2rem] bg-white p-6">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      {post ? <input type="hidden" name="publishedAt" value={post.published_at ?? ""} /> : null}
      <h2 className="font-display text-3xl">{post ? post.title : "New journal entry"}</h2>
      <label className="text-sm">Title<input name="title" required defaultValue={post?.title ?? ""} /></label>
      <label className="text-sm">Slug<input name="slug" defaultValue={post?.slug ?? ""} placeholder="Optional" /></label>
      <label className="text-sm">Excerpt<textarea name="excerpt" required defaultValue={post?.excerpt ?? ""} /></label>
      <label className="text-sm">Story<textarea name="content" required defaultValue={post?.content ?? ""} /></label>
      <label className="text-sm">Image URL<input name="imageUrl" required defaultValue={post?.image_url ?? ""} /></label>
      <label className="text-sm">Author<input name="author" required defaultValue={post?.author ?? "Lulu Atelier"} /></label>
      <label className="text-sm">Highlights<input name="highlights" defaultValue={(post?.highlights ?? []).join(", ")} placeholder="Cloth, fittings, calendar" /></label>
      <label className="text-sm">Category
        <select name="categoryId" required defaultValue={post?.category_id ?? categories[0]?.id} aria-label="Journal category">
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
      </label>
      <label className="text-sm">Status
        <select name="published" defaultValue={post?.published_at ? "yes" : "no"} aria-label="Journal status">
          <option value="yes">Published</option>
          <option value="no">Draft</option>
        </select>
      </label>
      <button className="w-fit rounded-full bg-burgundy px-5 py-2 text-sm text-ivory">{post ? "Save entry" : "Add entry"}</button>
    </form>
  );
}
