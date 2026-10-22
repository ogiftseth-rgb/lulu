"use client";

import Link from "@/components/nav-link";
import { useState } from "react";
import { Photo } from "@/components/photo";
import { kes } from "@/lib/utils";

export function QuickView({
  name,
  slug,
  description,
  price,
  image,
  sizes,
  colours,
}: {
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  sizes: string[];
  colours: string[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Quick view</button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-onyx/50 p-4" onClick={() => setOpen(false)}>
          <div className="grid max-h-[90vh] w-full max-w-3xl overflow-auto rounded-[2rem] bg-ivory md:grid-cols-2" onClick={(event) => event.stopPropagation()}>
            <div className="piece-media min-h-72">
              <Photo src={image} alt={name} sizes="(max-width: 768px) 90vw, 40vw" />
            </div>
            <div className="p-6 text-left">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-3xl">{name}</h2>
                <button type="button" onClick={() => setOpen(false)}>Close</button>
              </div>
              <p className="mt-3 text-lg">{kes(price)}</p>
              <p className="mt-3 text-sm leading-6">{description.slice(0, 280)}</p>
              <p className="mt-3 text-sm">Colours: {colours.join(", ") || "As photographed"}</p>
              <p className="text-sm">Sizes: {sizes.join(", ") || "As photographed"}</p>
              <Link href={`/product/${slug}`} className="mt-5 inline-block rounded-full bg-burgundy px-5 py-2 text-sm text-ivory" onClick={() => setOpen(false)}>
                Open the piece
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
