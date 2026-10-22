import { PrintButton } from "@/components/print-button";
import { orderDiscount, type OrderRecord } from "@/lib/queries";
import { kes } from "@/lib/utils";

const titles = {
  invoice: "Invoice",
  receipt: "Receipt",
  delivery: "Delivery note",
} as const;

const steps = ["pending_payment", "confirmed", "in_production", "ready", "delivered"];

export function OrderSheet({ order, kind }: { order: OrderRecord; kind: keyof typeof titles }) {
  const discount = orderDiscount(order);
  const current = steps.indexOf(order.status);
  return (
    <article className="rounded-[2rem] bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-rose">Glam by Lulu · Westlands</p>
          <h2 className="font-display text-4xl">{titles[kind]}</h2>
        </div>
        <PrintButton />
      </div>
      <p className="mt-3 text-sm">{order.number} · {new Date(order.created_at).toLocaleString("en-KE")}</p>
      <p className="text-sm capitalize">{order.status.replaceAll("_", " ")} · {order.payment_method.replaceAll("_", " ")}</p>
      {order.status !== "cancelled" && current >= 0 ? (
        <ol className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-wide">
          {steps.map((step, index) => (
            <li key={step} className={index <= current ? "text-burgundy" : "text-onyx/40"}>
              {step.replaceAll("_", " ")}
            </li>
          ))}
        </ol>
      ) : null}
      {order.status === "cancelled" ? <p className="mt-3 text-sm text-rose">This order was cancelled.</p> : null}
      <p className="mt-4 text-sm">
        {order.name}<br />
        {order.email} · {order.phone}<br />
        {order.address}, {order.town}, {order.county}
      </p>
      <p className="mt-2 text-sm">Delivery: {order.delivery_method.replaceAll("_", " ")}</p>
      {order.notes ? <p className="mt-2 text-sm">Notes: {order.notes}</p> : null}
      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr>
            <th className="py-2 font-medium">Piece</th>
            <th className="font-medium">Qty</th>
            <th className="text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.glam_order_items.map((item, index) => (
            <tr key={`${item.name}-${item.size}-${index}`} className="border-t border-champagne">
              <td className="py-2">
                {item.name}
                <br />
                <span className="text-rose">{item.colour} / {item.size}</span>
              </td>
              <td>{item.quantity}</td>
              <td className="text-right">{kes(item.unit_price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {kind !== "delivery" ? (
        <dl className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between"><dt>Pieces</dt><dd>{kes(order.subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Delivery</dt><dd>{kes(order.delivery_fee)}</dd></div>
          {discount > 0 ? <div className="flex justify-between"><dt>Coupon</dt><dd>−{kes(discount)}</dd></div> : null}
          <div className="flex justify-between font-semibold"><dt>Total</dt><dd>{kes(order.total)}</dd></div>
        </dl>
      ) : (
        <p className="mt-4 text-sm">Hand this note to the courier, or to the client at studio collection in Westlands.</p>
      )}
      {kind === "receipt" ? (
        <p className="mt-4 text-sm text-rose">Payment stays pending until M-Pesa keys are connected. This sheet is not proof of a completed charge.</p>
      ) : null}
    </article>
  );
}
