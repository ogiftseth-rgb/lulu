import type { Metadata } from "next";
import Link from "@/components/nav-link";
import { notFound, redirect } from "next/navigation";
import { OrderSheet } from "@/components/order-sheet";
import { getOrderByNumber } from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";

type Params = { params: Promise<{ number: string }>; searchParams: Promise<{ doc?: string }> };

export const metadata: Metadata = { title: "Order" };

export default async function AccountOrderPage({ params, searchParams }: Params) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const order = await getOrderByNumber((await params).number);
  if (!order || order.user_id !== user.id) notFound();
  const doc = (await searchParams).doc;
  const kind = doc === "invoice" || doc === "delivery" ? doc : "receipt";
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="mb-6 flex flex-wrap gap-4 text-sm">
        <Link href="/account" className="underline">Back to account</Link>
        <Link href={`/account/orders/${order.number}?doc=receipt`} className="underline">Receipt</Link>
        <Link href={`/account/orders/${order.number}?doc=invoice`} className="underline">Invoice</Link>
        <Link href={`/account/orders/${order.number}?doc=delivery`} className="underline">Delivery note</Link>
      </p>
      <OrderSheet order={order} kind={kind} />
    </main>
  );
}
