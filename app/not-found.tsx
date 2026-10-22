import Link from "@/components/nav-link";

export default function NotFound() {
  return (
    <main className="px-4 py-24 text-center">
      <h1 className="font-display text-5xl">That page is not in the collection.</h1>
      <Link href="/" className="mt-6 inline-block underline">Back home</Link>
    </main>
  );
}
