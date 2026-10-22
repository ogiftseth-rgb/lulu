import Link from "next/link";
import { requireStaff } from "@/lib/admin";

const links = [
  ["/admin", "Overview"],
  ["/admin/products", "Pieces"],
  ["/admin/orders", "Orders"],
  ["/admin/reviews", "Reviews"],
  ["/admin/requests", "Requests"],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-xs uppercase tracking-[0.25em] text-rose">Studio desk</p>
      <h1 className="mt-2 font-display text-5xl">Admin</h1>
      <p className="mt-2 text-sm text-onyx/70">
        {user.firstName} {user.lastName} · {user.role.replaceAll("_", " ")}
      </p>
      <nav className="mt-6 flex flex-wrap gap-2 text-sm">
        {links.map(([href, label]) => (
          <Link key={href} href={href} className="rounded-full border border-champagne px-4 py-2">
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-8">{children}</div>
    </main>
  );
}
