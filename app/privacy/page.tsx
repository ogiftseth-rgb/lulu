import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 leading-8">
      <h1 className="font-display text-5xl">Privacy Policy</h1>
      <p className="mt-6">Glam by Lulu keeps the details you give us so we can make clothes, answer messages, and complete orders. That includes your name, phone, email, delivery address, measurements when you choose to share them, and order history.</p>
      <p className="mt-4">Passwords are stored as hashes. Payment keys are not stored in the browser. Demo accounts and the sample catalogue are marked as demonstration data and can be removed before a public launch.</p>
      <p className="mt-4">You may ask the studio to correct or delete your account details. This page is a working notice for the store and should be reviewed against the business’s Kenyan data protection obligations before launch.</p>
    </main>
  );
}
