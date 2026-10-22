import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/forms";
import { PageHero } from "@/components/site-footer";

export const metadata: Metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <main>
      <PageHero title="Login" image="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=80" />
      <section className="px-4 py-16">
        <AuthForm mode="login" />
        <p className="mt-6 text-center text-sm text-onyx/70">Demo sign-in password: DemoPass123!. Customer samples are amina.waweru@example.com, faith.njeri@example.com, and wanjiku.aoko@example.com. The studio desk is studio@glambylulu.co.ke.</p>
        <p className="mt-2 text-center text-sm"><Link href="/register" className="underline">Create an account</Link></p>
      </section>
    </main>
  );
}
