import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import { BackToTop, SiteFooter, WhatsAppButton } from "@/components/site-footer";
import { SiteHeader, type HeaderCartLine } from "@/components/site-header";
import { getCart, getFeaturedProducts, getSettings } from "@/lib/queries";
import { getCurrentUser, getGuestId } from "@/lib/session";
import { isStaffRole } from "@/lib/admin";
import { priceOf } from "@/lib/utils";
import "./globals.css";

const display = Playfair_Display({ subsets: ["latin"], variable: "--font-display" });
const sans = Montserrat({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: "Glam by Lulu", template: "%s · Glam by Lulu" },
  description: "Elegance, made personal. Kenyan luxury fashion, bespoke clothing, and occasion wear.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let settings = {
    businessName: "Glam by Lulu",
    tagline: "Elegance, Made Personal.",
    phone: "+254 712 345 678",
    whatsapp: "254712345678",
    email: "hello@glambylulu.co.ke",
    address: "The Oval, Westlands, Nairobi",
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    since: "2018",
    hoursWeek: "9AM - 6PM",
    hoursSaturday: "10AM - 4PM",
    hoursSunday: "By appointment",
  };
  let lines: HeaderCartLine[] = [];
  let firstName: string | null = null;
  let isStaff = false;
  let featured: { name: string; slug: string }[] = [];
  try {
    const user = await getCurrentUser();
    const [loadedSettings, cart, products] = await Promise.all([
      getSettings(),
      getCart(user?.id ?? null, await getGuestId()),
      getFeaturedProducts(),
    ]);
    settings = loadedSettings;
    firstName = user?.firstName ?? null;
    isStaff = isStaffRole(user?.role);
    featured = products.map((product) => ({ name: product.name, slug: product.slug }));
    lines = cart.map((line) => ({
      id: line.id,
      name: line.product.name,
      quantity: line.quantity,
      size: line.size,
      colour: line.colour,
      price: priceOf(line.product),
      image: line.product.images[0]?.url ?? "",
      slug: line.product.slug,
    }));
  } catch (error) {
    console.error(error);
  }

  return (
    <html lang="en">
      <body id="top" className={`${display.variable} ${sans.variable} font-sans antialiased`}>
        <SiteHeader cart={lines} firstName={firstName} isStaff={isStaff} />
        {children}
        <SiteFooter settings={settings} products={featured} />
        <WhatsAppButton phone={settings.whatsapp} />
        <BackToTop />
      </body>
    </html>
  );
}
