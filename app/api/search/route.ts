import { NextResponse } from "next/server";
import { filterProducts, getProducts } from "@/lib/queries";
import { priceOf } from "@/lib/utils";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  const products = filterProducts(await getProducts(), { q }).slice(0, 8);
  return NextResponse.json(products.map((product) => ({ name: product.name, slug: product.slug, price: priceOf(product) })));
}
