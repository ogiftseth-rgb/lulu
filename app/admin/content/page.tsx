import type { Metadata } from "next";
import { saveHero, savePage } from "@/app/admin/actions";
import { db } from "@/lib/supabase";

export const metadata: Metadata = { title: "Content · Admin" };

export default async function AdminContentPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const notice = (await searchParams).notice;
  const [{ data: slides }, { data: pages }] = await Promise.all([
    db().from("glam_hero_slides").select("*").order("sort_order"),
    db().from("glam_page_content").select("*").order("key"),
  ]);

  return (
    <section className="space-y-10">
      {notice ? <p className="rounded-2xl bg-white px-4 py-3 text-sm">{notice}</p> : null}
      <form action={saveHero} className="grid gap-3 rounded-[2rem] bg-white p-6 md:grid-cols-2">
        <h2 className="font-display text-3xl md:col-span-2">New homepage slide</h2>
        <label className="text-sm">Heading<input name="heading" required /></label>
        <label className="text-sm">Sort<input name="sortOrder" type="number" defaultValue={((slides ?? []).length + 1)} /></label>
        <label className="text-sm md:col-span-2">Description<textarea name="description" required /></label>
        <label className="text-sm md:col-span-2">Image URL<input name="imageUrl" required placeholder="https://" /></label>
        <label className="text-sm">Primary label<input name="primaryLabel" required /></label>
        <label className="text-sm">Primary link<input name="primaryHref" required placeholder="/shop" /></label>
        <label className="text-sm">Secondary label<input name="secondaryLabel" /></label>
        <label className="text-sm">Secondary link<input name="secondaryHref" placeholder="/bespoke" /></label>
        <label className="text-sm">Visible
          <select name="active" defaultValue="yes" aria-label="Slide visibility">
            <option value="yes">Shown</option>
            <option value="no">Hidden</option>
          </select>
        </label>
        <button className="w-fit rounded-full bg-burgundy px-5 py-2 text-sm text-ivory">Add slide</button>
      </form>
      {(slides ?? []).map((slide) => (
        <form key={slide.id} action={saveHero} className="grid gap-3 border-t border-champagne pt-6 md:grid-cols-2">
          <input type="hidden" name="id" value={slide.id} />
          <h2 className="font-display text-3xl md:col-span-2">Slide {slide.sort_order}</h2>
          <label className="text-sm">Heading<input name="heading" required defaultValue={slide.heading} /></label>
          <label className="text-sm">Sort<input name="sortOrder" type="number" defaultValue={slide.sort_order} /></label>
          <label className="text-sm md:col-span-2">Description<textarea name="description" required defaultValue={slide.description} /></label>
          <label className="text-sm md:col-span-2">Image URL<input name="imageUrl" required defaultValue={slide.image_url} /></label>
          <label className="text-sm">Primary label<input name="primaryLabel" required defaultValue={slide.primary_label} /></label>
          <label className="text-sm">Primary link<input name="primaryHref" required defaultValue={slide.primary_href} /></label>
          <label className="text-sm">Secondary label<input name="secondaryLabel" defaultValue={slide.secondary_label ?? ""} /></label>
          <label className="text-sm">Secondary link<input name="secondaryHref" defaultValue={slide.secondary_href ?? ""} /></label>
          <label className="text-sm">Visible
            <select name="active" defaultValue={slide.active ? "yes" : "no"} aria-label={`${slide.heading} visibility`}>
              <option value="yes">Shown</option>
              <option value="no">Hidden</option>
            </select>
          </label>
          <button className="w-fit rounded-full bg-burgundy px-5 py-2 text-sm text-ivory">Save slide</button>
        </form>
      ))}
      <h2 className="font-display text-4xl">Pages</h2>
      {(pages ?? []).map((page) => (
        <form key={page.id} action={savePage} className="grid gap-3 border-t border-champagne pt-6">
          <input type="hidden" name="key" value={page.key} />
          <p className="text-xs uppercase tracking-[0.2em] text-rose">{page.key}</p>
          <label className="text-sm">Title<input name="title" required defaultValue={page.title} /></label>
          <label className="text-sm">Body<textarea name="body" required defaultValue={page.body} /></label>
          <label className="text-sm">Image URL<input name="imageUrl" defaultValue={page.image_url ?? ""} /></label>
          <button className="w-fit rounded-full bg-burgundy px-5 py-2 text-sm text-ivory">Save page</button>
        </form>
      ))}
    </section>
  );
}
