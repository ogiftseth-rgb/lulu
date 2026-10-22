"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { removeCartItem, updateCartItem } from "@/app/actions";
import { kes } from "@/lib/utils";

export type HeaderCartLine = {
  id: string;
  name: string;
  quantity: number;
  size: string;
  colour: string;
  price: number;
  image: string;
  slug: string;
};

const aboutLinks = [
  ["/about", "Our Story"],
  ["/bespoke", "Bespoke"],
  ["/gallery", "Gallery"],
  ["/privacy", "Privacy Policy"],
  ["/terms", "Terms & Conditions"],
];

const pageLinks = [
  ["/gallery", "Gallery"],
  ["/team", "Team"],
  ["/testimonials", "Testimonials"],
  ["/shop", "Shop"],
];

export function SiteHeader({
  cart,
  firstName,
  isStaff = false,
}: {
  cart: HeaderCartLine[];
  firstName: string | null;
  isStaff?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ name: string; slug: string; price: number }[]>([]);
  const count = cart.reduce((sum, line) => sum + line.quantity, 0);

  async function search(value: string) {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    const response = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
    setResults(await response.json());
  }

  return (
    <header className="sticky top-0 z-40 border-b border-champagne/60 bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-burgundy font-display text-lg text-ivory">GL</span>
          <span className="leading-tight">
            <span className="block font-display text-lg tracking-wide">Glam by Lulu</span>
            <span className="block text-[10px] uppercase tracking-[0.28em] text-rose">Nairobi</span>
          </span>
        </Link>
        <nav className="ml-auto hidden items-center gap-7 text-sm font-medium lg:flex">
          <Link href="/" className="text-rose">Home</Link>
          <Drop label="About Us" links={aboutLinks} />
          <Link href="/products">Products</Link>
          <Drop label="Pages" links={pageLinks} />
          <Link href="/blog">Blog</Link>
          <Link href="/contact">Contact Us</Link>
        </nav>
        <div className="ml-auto flex items-center gap-3 lg:ml-6">
          <Link href="/wishlist" className="hidden text-sm md:inline">Saved</Link>
          <Link href={firstName ? "/account" : "/register"} className="hidden text-sm md:inline">
            {firstName ? firstName : "Register"}
          </Link>
          {isStaff ? <Link href="/admin" className="hidden text-sm md:inline">Admin</Link> : null}
          <button aria-label="Search" className="grid h-11 w-11 place-items-center rounded-full bg-rose text-white" onClick={() => setSearchOpen(true)}>
            <Search size={18} />
          </button>
          <button aria-label="Cart" className="relative grid h-11 w-11 place-items-center rounded-full border border-champagne" onClick={() => setCartOpen(true)}>
            <ShoppingBag size={18} />
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-burgundy px-1 text-[10px] text-ivory">{count}</span>
          </button>
          <button aria-label="Menu" className="lg:hidden" onClick={() => setOpen(true)}>
            <Menu />
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-champagne bg-ivory px-4 py-4 lg:hidden">
          {(isStaff ? ["/admin"] : []).concat(["/", "/about", "/products", "/shop", "/wishlist", "/gallery", "/team", "/testimonials", "/blog", "/contact", firstName ? "/account" : "/register"]).map((href) => (
            <Link key={href} href={href} className="block py-2" onClick={() => setOpen(false)}>
              {href === "/" ? "Home" : href === "/admin" ? "Admin" : href.slice(1).replace("-", " ")}
            </Link>
          ))}
        </div>
      )}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-onyx/50 p-4" onClick={() => setSearchOpen(false)}>
          <div className="mx-auto mt-20 max-w-xl rounded-3xl bg-ivory p-6" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-3xl">Search the edit</h2>
              <button aria-label="Close search" onClick={() => setSearchOpen(false)}><X /></button>
            </div>
            <input value={query} onChange={(event) => search(event.target.value)} placeholder="Gown, blazer, ruracio..." />
            <ul className="mt-4 space-y-2">
              {results.map((item) => (
                <li key={item.slug}>
                  <Link href={`/product/${item.slug}`} className="flex justify-between rounded-2xl bg-white px-4 py-3" onClick={() => setSearchOpen(false)}>
                    <span>{item.name}</span>
                    <span>{kes(item.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-onyx/40" onClick={() => setCartOpen(false)}>
          <aside className="h-full w-full max-w-md overflow-auto bg-ivory p-6" onClick={(event) => event.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-4xl">Your bag</h2>
              <button aria-label="Close cart" onClick={() => setCartOpen(false)}><X /></button>
            </div>
            {cart.length === 0 && <p>Your bag is empty.</p>}
            <ul className="space-y-4">
              {cart.map((line) => (
                <li key={line.id} className="flex gap-3 py-3">
                  {line.image ? <Image src={line.image} alt="" width={80} height={96} className="h-24 w-20 object-cover" /> : null}
                  <div className="flex-1">
                    <Link href={`/product/${line.slug}`} className="font-medium">{line.name}</Link>
                    <p className="text-sm text-rose">{line.colour} / {line.size}</p>
                    <p className="mt-1">{kes(line.price * line.quantity)}</p>
                    <div className="mt-2 flex gap-2">
                      <form action={updateCartItem}>
                        <input type="hidden" name="itemId" value={line.id} />
                        <input type="hidden" name="quantity" value={line.quantity + 1} />
                        <button className="rounded-full border px-3 py-1 text-sm">+</button>
                      </form>
                      <form action={updateCartItem}>
                        <input type="hidden" name="itemId" value={line.id} />
                        <input type="hidden" name="quantity" value={line.quantity - 1} />
                        <button className="rounded-full border px-3 py-1 text-sm">-</button>
                      </form>
                      <form action={removeCartItem}>
                        <input type="hidden" name="itemId" value={line.id} />
                        <button className="text-sm text-rose">Remove</button>
                      </form>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {cart.length > 0 && (
              <Link href="/cart" className="mt-6 block rounded-full bg-burgundy py-3 text-center text-ivory" onClick={() => setCartOpen(false)}>
                Review bag
              </Link>
            )}
          </aside>
        </div>
      )}
    </header>
  );
}

function Drop({ label, links }: { label: string; links: string[][] }) {
  return (
    <div className="group relative">
      <button className="inline-flex items-center gap-1">{label}</button>
      <div className="invisible absolute left-0 top-full z-20 min-w-52 rounded-2xl bg-white p-3 opacity-0 shadow-soft transition group-hover:visible group-hover:opacity-100">
        {links.map(([href, text]) => (
          <Link key={href} href={href} className="block rounded-xl px-3 py-2 hover:bg-ivory">{text}</Link>
        ))}
      </div>
    </div>
  );
}
