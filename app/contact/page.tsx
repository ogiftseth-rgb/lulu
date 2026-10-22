import type { Metadata } from "next";
import { ContactForm } from "@/components/forms";
import { PageHero } from "@/components/site-footer";
import { getSettings } from "@/lib/queries";

export const metadata: Metadata = { title: "Contact Us" };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const sent = (await searchParams).sent;
  const settings = await getSettings();
  return (
    <main>
      <PageHero title="Contact Us" image="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80" />
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2">
        <div>
          <h2 className="font-display text-5xl">We’d love to hear from you.</h2>
          <p className="mt-4 leading-7">Tell us about a fitting, a ceremony, or a piece you have been picturing.</p>
          <ul className="mt-6 space-y-2">
            <li>{settings.phone}</li>
            <li><a href={`https://wa.me/${settings.whatsapp}`}>WhatsApp</a></li>
            <li>{settings.email}</li>
            <li><a href={settings.instagram}>Instagram</a></li>
            <li><a href={settings.facebook}>Facebook</a></li>
            <li>{settings.address}</li>
          </ul>
          <p className="mt-4 text-sm text-rose">A map will appear here when a maps key is added.</p>
        </div>
        <div className="rounded-[2rem] bg-white p-6">
          {sent ? <p className="mb-4 rounded-2xl bg-ivory p-4">Your message is saved. The studio will read it from the enquiry list.</p> : null}
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
