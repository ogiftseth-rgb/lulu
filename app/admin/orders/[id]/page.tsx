import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderSheet } from "@/components/order-sheet";
import { getOrderById } from "@/lib/queries";

type Params = { params: Promise<{ id: string }>; searchParams: Promise<{ doc?: string }> };

export const metadata: Metadata = { title: "Order document · Admin" };

export default async function AdminOrderDocumentPage({ params, searchParams }: Params) {
  const order = await getOrderById((await params).id);
  if (!order) notFound();
  const doc = (await searchParams).doc;
  const kind = doc === "receipt" || doc === "delivery" ? doc : "invoice";
  return (
    <section>
      <p className="mb-6 flex flex-wrap gap-4 text-sm">
        <Link href="/admin/orders" className="underline">All orders</Link>
        <Link href={`/admin/orders/${order.id}?doc=invoice`} className="underline">Invoice</Link>
        <Link href={`/admin/orders/${order.id}?doc=receipt`} className="underline">Receipt</Link>
        <Link href={`/admin/orders/${order.id}?doc=delivery`} className="underline">Delivery note</Link>
      </p>
      <OrderSheet order={order} kind={kind} />
    </section>
  );
}
