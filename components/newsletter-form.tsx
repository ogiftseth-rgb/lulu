"use client";

import { useActionState } from "react";
import { subscribeNewsletter } from "@/app/actions";

type State = { error?: string; ok?: boolean } | null;

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(async (_prev: State, formData: FormData) => subscribeNewsletter(formData), null);
  return (
    <form action={formAction} className="mt-6">
      <label className="text-sm text-ivory/80" htmlFor="newsletter-email">Newsletter</label>
      <div className="mt-2 flex gap-2">
        <input id="newsletter-email" name="email" type="email" required placeholder="Email address" className="text-onyx" />
        <button className="rounded-full bg-rose px-4 text-sm" disabled={pending}>Join</button>
      </div>
      {state?.error && <p className="mt-2 text-sm">{state.error}</p>}
      {state?.ok && <p className="mt-2 text-sm">You are on the list.</p>}
    </form>
  );
}
