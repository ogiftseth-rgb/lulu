import type { Metadata } from "next";
import { Suspense } from "react";
import { Montserrat, Playfair_Display } from "next/font/google";
import { BackToTop, SiteFooter, WhatsAppButton } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCartSummary, getFeaturedProducts, getSettings } from "@/lib/queries";
import { getCurrentUser, getGuestId } from "@/lib/session";
import { isStaffRole } from "@/lib/admin";
import "./globals.css";

const display = Playfair_Display({ subsets: ["latin"], variable: "--font-display" });
const sans = Montserrat({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: "Glam by Lulu", template: "%s · Glam by Lulu" },
  description: "Elegance, made personal. Kenyan luxury fashion, bespoke clothing, and occasion wear.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body id="top" className={`${display.variable} ${sans.variable} font-sans antialiased`}>
        <Suspense fallback={<SiteHeader cart={[]} firstName={null} />}>
          <LiveHeader />
        </Suspense>
        {children}
        <Suspense fallback={<WhatsAppButton phone="254712345678" />}>
          <LiveFooter />
        </Suspense>
        <BackToTop />
      </body>
    </html>
  );
}

async function LiveHeader() {
  try {
    const user = await getCurrentUser();
    const cart = await getCartSummary(user?.id ?? null, await getGuestId());
    return <SiteHeader cart={cart} firstName={user?.firstName ?? null} isStaff={isStaffRole(user?.role)} />;
  } catch (error) {
    console.error(error);
    return <SiteHeader cart={[]} firstName={null} />;
  }
}

async function LiveFooter() {
  try {
    const [settings, products] = await Promise.all([getSettings(), getFeaturedProducts()]);
    return (
      <>
        <SiteFooter settings={settings} products={products.map((product) => ({ name: product.name, slug: product.slug }))} />
        <WhatsAppButton phone={settings.whatsapp} />
      </>
    );
  } catch (error) {
    console.error(error);
    return <WhatsAppButton phone="254712345678" />;
  }
}
