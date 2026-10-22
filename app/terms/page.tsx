import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 leading-8">
      <h1 className="font-display text-5xl">Terms & Conditions</h1>
      <p className="mt-6">Orders are requests to purchase until payment is confirmed. In this version, checkout saves the order as pending payment and does not send an M-Pesa prompt.</p>
      <p className="mt-4">Ready-to-wear pieces are offered in the sizes and colours shown, subject to stock. Bespoke work begins after the studio accepts the request. Delivery fees are shown at checkout for studio collection, Nairobi, and the rest of Kenya.</p>
      <p className="mt-4">The garments, prices, reviews, and customers in the sample catalogue are demonstration data.</p>
    </main>
  );
}
