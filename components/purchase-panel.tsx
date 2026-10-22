"use client";

import { useActionState, useState } from "react";
import { addToCart, buyNow } from "@/app/actions";
import type { Product } from "@/lib/types";

type State = { error?: string; ok?: boolean } | null;

export function PurchasePanel({ product }: { product: Product }) {
  const colours = [...new Set(product.variants.map((variant) => variant.colour))];
  const sizes = [...new Set(product.variants.map((variant) => variant.size))];
  const [colour, setColour] = useState(colours[0] ?? "");
  const [size, setSize] = useState(sizes[0] ?? "");
  const [state, formAction, pending] = useActionState(async (_prev: State, formData: FormData) => {
    if (formData.get("intent") === "buy") return buyNow(formData);
    return addToCart(formData);
  }, null);
  const variant = product.variants.find((item) => item.size === size && item.colour === colour);
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="productId" value={product.id} />
      <input type="hidden" name="size" value={size} />
      <input type="hidden" name="colour" value={colour} />
      <div className="flex flex-wrap gap-2">
        {colours.map((item) => (
          <button type="button" key={item} onClick={() => setColour(item)} className={`rounded-full px-4 py-2 text-sm ${item === colour ? "bg-burgundy text-ivory" : "bg-white"}`}>{item}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((item) => (
          <button type="button" key={item} onClick={() => setSize(item)} className={`rounded-full px-4 py-2 text-sm ${item === size ? "bg-rose text-white" : "bg-white"}`}>{item}</button>
        ))}
      </div>
      <p className="text-sm">{variant && variant.stock > 0 ? `${variant.stock} in stock` : "Out of stock in this selection"}</p>
      <label className="block text-sm">Quantity
        <input name="quantity" type="number" min={1} defaultValue={1} className="mt-1" />
      </label>
      {state?.error && <p className="field-error">{state.error}</p>}
      {state?.ok && <p className="text-sm">Added to your bag.</p>}
      <div className="flex flex-wrap gap-3">
        <button name="intent" value="bag" className="rounded-full bg-burgundy px-6 py-3 text-ivory" disabled={pending || !variant || variant.stock < 1}>Add to bag</button>
        <button name="intent" value="buy" className="rounded-full border border-burgundy px-6 py-3" disabled={pending || !variant || variant.stock < 1}>Buy now</button>
        <a className="rounded-full border border-burgundy px-6 py-3" href={`https://wa.me/254712345678?text=${encodeURIComponent(`I am asking about ${product.name} (${product.sku})`)}`}>WhatsApp</a>
      </div>
    </form>
  );
}
