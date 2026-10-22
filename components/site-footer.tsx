import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";
import { Photo } from "@/components/photo";

export function SiteFooter({
  settings,
  products,
}: {
  settings: {
    businessName: string;
    phone: string;
    email: string;
    address: string;
    instagram: string;
    facebook: string;
    hoursWeek: string;
    hoursSaturday: string;
    hoursSunday: string;
  };
  products: { name: string; slug: string }[];
}) {
  return (
    <footer className="bg-burgundy text-ivory">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div>
          <h2 className="font-display text-4xl leading-tight">Let’s make something beautiful. Visit the studio.</h2>
          <p className="mt-4 max-w-sm text-ivory/80">Sample catalogue for Glam by Lulu. Figures and garments shown here are demonstration data.</p>
          <div className="mt-6 flex gap-3 text-sm">
            <a href={settings.instagram} className="rounded-full border border-white/30 px-3 py-1">Instagram</a>
            <a href={settings.facebook} className="rounded-full border border-white/30 px-3 py-1">Facebook</a>
          </div>
          <NewsletterForm />
        </div>
        <div>
          <h3 className="font-display text-2xl">Quick links</h3>
          <ul className="mt-4 space-y-2 text-ivory/85">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/shop">Shop</Link></li>
            <li><Link href="/blog">The Glam Journal</Link></li>
            <li><Link href="/privacy">Privacy</Link></li>
            <li><Link href="/terms">Terms</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-display text-2xl">Best pieces</h3>
          <ul className="mt-4 space-y-2 text-ivory/85">
            {products.map((product) => (
              <li key={product.slug}><Link href={`/product/${product.slug}`}>{product.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-display text-2xl">Studio hours</h3>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4"><dt>Working days</dt><dd>{settings.hoursWeek}</dd></div>
            <div className="flex justify-between gap-4"><dt>Saturday</dt><dd>{settings.hoursSaturday}</dd></div>
            <div className="flex justify-between gap-4"><dt>Sunday</dt><dd>{settings.hoursSunday}</dd></div>
          </dl>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-4 px-4 pb-10 md:grid-cols-2">
        <div className="rounded-3xl bg-white/10 p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-champagne">Contact us</p>
          <a href={`tel:${settings.phone}`} className="mt-1 block font-display text-3xl">{settings.phone}</a>
          <a href={`mailto:${settings.email}`} className="text-ivory/80">{settings.email}</a>
        </div>
        <div className="rounded-3xl bg-white/10 p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-champagne">Address</p>
          <p className="mt-1 font-display text-3xl">{settings.address}</p>
        </div>
      </div>
      <p className="border-t border-white/10 px-4 py-4 text-center text-sm text-ivory/70">© {new Date().getFullYear()} {settings.businessName}. Elegance, made personal.</p>
    </footer>
  );
}

export function PageHero({ title, image }: { title: string; image: string }) {
  return (
    <section className="torn page-hero">
      <div className="page-hero-media">
        <Photo src={image} alt="" priority sizes="100vw" className="object-cover opacity-60" />
        <div className="absolute inset-0 bg-burgundy/45" />
      </div>
      <h1>{title}</h1>
    </section>
  );
}

export function WhatsAppButton({ phone }: { phone: string }) {
  return (
    <a
      href={`https://wa.me/${phone}`}
      className="fixed bottom-5 left-5 z-30 rounded-full bg-[#1f7a45] px-4 py-3 text-sm text-white shadow-soft"
    >
      WhatsApp
    </a>
  );
}

export function BackToTop() {
  return (
    <a href="#top" className="fixed bottom-5 right-5 z-30 grid h-12 w-12 place-items-center rounded-full bg-rose text-white">
      ↑
    </a>
  );
}
