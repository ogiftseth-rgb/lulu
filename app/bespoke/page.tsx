import type { Metadata } from "next";
import { BespokeForm } from "@/components/forms";
import { PageHero } from "@/components/site-footer";

export const metadata: Metadata = { title: "Bespoke" };

export default async function BespokePage({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const sent = (await searchParams).sent;
  return (
    <main>
      <PageHero title="Bespoke" image="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1600&q=80" />
      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="font-display text-5xl">Made for you. Only you.</h2>
        <p className="mt-4 leading-7">Tell us the occasion, the cloth you are imagining, and the date. The request is saved for the studio.</p>
        {sent ? <p className="mt-6 rounded-2xl bg-white p-4">Your consultation request is saved.</p> : <div className="mt-8"><BespokeForm /></div>}
      </section>
    </main>
  );
}
