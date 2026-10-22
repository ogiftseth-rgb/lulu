import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/forms";
import { PageHero } from "@/components/site-footer";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <main>
      <PageHero title="Register" image="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1600&q=80" />
      <section className="px-4 py-16">
        <AuthForm mode="register" />
        <p className="mt-4 text-center text-sm">Already have an account? <Link href="/login" className="underline">Sign in</Link></p>
      </section>
    </main>
  );
}
