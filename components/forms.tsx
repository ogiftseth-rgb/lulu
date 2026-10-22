"use client";

import { useActionState } from "react";
import { loginAccount, placeOrder, registerAccount, submitBespoke, submitContact } from "@/app/actions";

type State = { error?: string; ok?: boolean } | null;

export function ContactForm() {
  const [state, formAction, pending] = useActionState(async (_prev: State, formData: FormData) => submitContact(formData), null);
  return (
    <form action={formAction} className="space-y-3">
      <input name="name" required placeholder="Full name" />
      <input name="email" type="email" required placeholder="Email" />
      <input name="phone" required placeholder="Phone number" />
      <input name="subject" required placeholder="Subject" />
      <textarea name="message" required placeholder="Message" />
      {state?.error && <p className="field-error">{state.error}</p>}
      <button className="rounded-full bg-burgundy px-6 py-3 text-ivory" disabled={pending}>Send message</button>
    </form>
  );
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const action = mode === "login" ? loginAccount : registerAccount;
  const [state, formAction, pending] = useActionState(async (_prev: State, formData: FormData) => action(formData), null);
  return (
    <form action={formAction} className="mx-auto max-w-md space-y-3">
      {mode === "register" && (
        <>
          <input name="firstName" required placeholder="First name" />
          <input name="lastName" required placeholder="Last name" />
          <input name="phone" required placeholder="Phone number" />
        </>
      )}
      <input name="email" type="email" required placeholder="Email address" />
      <input name="password" type="password" required placeholder="Password" />
      {mode === "register" && <input name="confirm" type="password" required placeholder="Confirm password" />}
      {state?.error && <p className="field-error">{state.error}</p>}
      <button className="w-full rounded-full bg-burgundy py-3 text-ivory" disabled={pending}>
        {mode === "login" ? "Sign in" : "Create account"}
      </button>
    </form>
  );
}

export function BespokeForm() {
  const [state, formAction, pending] = useActionState(async (_prev: State, formData: FormData) => submitBespoke(formData), null);
  return (
    <form action={formAction} className="grid gap-3 md:grid-cols-2">
      <input name="name" required placeholder="Your name" />
      <input name="email" type="email" required placeholder="Email" />
      <input name="phone" required placeholder="Phone" />
      <input name="outfitType" required placeholder="Outfit type" />
      <input name="occasion" required placeholder="Occasion" />
      <input name="eventDate" type="date" required aria-label="Event date" />
      <input name="colours" required placeholder="Preferred colours" />
      <input name="budget" required placeholder="Budget range in KES" />
      <textarea className="md:col-span-2" name="measurements" placeholder="Measurements, if you have them" />
      <textarea className="md:col-span-2" name="notes" placeholder="Additional instructions" />
      {state?.error && <p className="field-error md:col-span-2">{state.error}</p>}
      <button className="rounded-full bg-burgundy px-6 py-3 text-ivory md:col-span-2" disabled={pending}>Request consultation</button>
    </form>
  );
}

export function CheckoutForm({ empty }: { empty: boolean }) {
  const [state, formAction, pending] = useActionState(async (_prev: State, formData: FormData) => placeOrder(formData), null);
  if (empty) return <p>Your bag is empty.</p>;
  return (
    <form action={formAction} className="space-y-3">
      <input name="name" required placeholder="Full name" />
      <input name="email" type="email" required placeholder="Email" />
      <input name="phone" required placeholder="Phone" />
      <input name="county" required placeholder="County" />
      <input name="town" required placeholder="Town or city" />
      <textarea name="address" required placeholder="Delivery address" />
      <textarea name="notes" placeholder="Delivery notes" />
      <input name="coupon" placeholder="Coupon code" autoComplete="off" />
      <select name="deliveryMethod" defaultValue="nairobi" aria-label="Delivery method">
        <option value="studio">Studio collection, Westlands — KES 0</option>
        <option value="nairobi">Nairobi courier — KES 500</option>
        <option value="upcountry">Rest of Kenya — KES 1,500</option>
      </select>
      <p className="text-sm text-rose">Payment is recorded as M-Pesa pending. No charge is sent until the payment keys are connected.</p>
      {state?.error && <p className="field-error">{state.error}</p>}
      <button className="rounded-full bg-burgundy px-6 py-3 text-ivory" disabled={pending}>Place order</button>
    </form>
  );
}


