import { db } from "@/lib/supabase";
import type { CartLine, Category, GalleryImage, HeroSlide, Post, Product, Review, ShopQuery, TeamMember } from "@/lib/types";
import { priceOf } from "@/lib/utils";

const PRODUCT_SELECT = `
  id, sku, name, slug, description, fabric, care, regular_price, sale_price, occasion,
  featured, is_new, is_bespoke, popularity, created_at, status,
  glam_categories ( name, slug ),
  glam_product_images ( url, alt, sort_order ),
  glam_product_variants ( size, colour, stock )
`;

function one<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export function mapProduct(row: Record<string, unknown>): Product {
  const category = one(row.glam_categories as { name: string; slug: string } | { name: string; slug: string }[]);
  const images = ((row.glam_product_images as { url: string; alt: string; sort_order: number }[]) ?? [])
    .map((image) => ({ url: image.url, alt: image.alt, sortOrder: image.sort_order }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const variants = ((row.glam_product_variants as { size: string; colour: string; stock: number }[]) ?? [])
    .slice()
    .sort((a, b) => a.size.localeCompare(b.size) || a.colour.localeCompare(b.colour));
  return {
    id: String(row.id),
    sku: String(row.sku),
    name: String(row.name),
    slug: String(row.slug),
    description: String(row.description),
    fabric: String(row.fabric),
    care: String(row.care),
    regularPrice: Number(row.regular_price),
    salePrice: row.sale_price == null ? null : Number(row.sale_price),
    occasion: String(row.occasion),
    featured: Boolean(row.featured),
    isNew: Boolean(row.is_new),
    isBespoke: Boolean(row.is_bespoke),
    popularity: Number(row.popularity),
    createdAt: String(row.created_at),
    category: category ?? { name: "Collection", slug: "collection" },
    images,
    variants,
  };
}

export function stockOf(product: Product) {
  return product.variants.reduce((sum, variant) => sum + variant.stock, 0);
}

export async function getSettings() {
  const { data } = await db().from("glam_settings").select("key, value");
  const settings: Record<string, string> = {};
  for (const row of data ?? []) settings[row.key] = row.value;
  return {
    businessName: settings.business_name ?? "Glam by Lulu",
    tagline: settings.tagline ?? "Elegance, Made Personal.",
    phone: settings.phone ?? "+254 712 345 678",
    whatsapp: settings.whatsapp ?? "254712345678",
    email: settings.email ?? "hello@glambylulu.co.ke",
    address: settings.address ?? "The Oval, Westlands, Nairobi",
    instagram: settings.instagram ?? "https://instagram.com",
    facebook: settings.facebook ?? "https://facebook.com",
    since: settings.since ?? "2018",
    hoursWeek: settings.hours_week ?? "9AM - 6PM",
    hoursSaturday: settings.hours_saturday ?? "10AM - 4PM",
    hoursSunday: settings.hours_sunday ?? "By appointment",
  };
}

export async function getPageContent() {
  const { data } = await db().from("glam_page_content").select("key, title, body, image_url");
  const pages: Record<string, { title: string; body: string; imageUrl: string | null }> = {};
  for (const row of data ?? []) {
    pages[row.key] = { title: row.title, body: row.body, imageUrl: row.image_url };
  }
  return pages;
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const { data } = await db()
    .from("glam_hero_slides")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  return (data ?? []).map((row) => ({
    id: row.id,
    heading: row.heading,
    description: row.description,
    imageUrl: row.image_url,
    primaryLabel: row.primary_label,
    primaryHref: row.primary_href,
    secondaryLabel: row.secondary_label,
    secondaryHref: row.secondary_href,
  }));
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await db().from("glam_categories").select("*").order("sort_order");
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
  }));
}

export async function getProducts() {
  const { data, error } = await db()
    .from("glam_products")
    .select(PRODUCT_SELECT)
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (error) {
    console.error(error);
    return [] as Product[];
  }
  return ((data ?? []) as Record<string, unknown>[]).map(mapProduct);
}

export async function getFeaturedProducts() {
  const products = await getProducts();
  return products.filter((product) => product.featured).slice(0, 4);
}

export async function getNewArrivals() {
  const products = await getProducts();
  return products.filter((product) => product.isNew).slice(0, 4);
}

export async function getProduct(slug: string) {
  const { data, error } = await db().from("glam_products").select(PRODUCT_SELECT).eq("slug", slug).maybeSingle();
  if (error || !data || data.status !== "published") return null;
  return mapProduct(data as Record<string, unknown>);
}

export async function getRelated(product: Product) {
  const products = await getProducts();
  return products.filter((item) => item.category.slug === product.category.slug && item.id !== product.id).slice(0, 4);
}

export function filterProducts(products: Product[], query: ShopQuery) {
  let items = products.slice();
  if (query.q) {
    const needle = query.q.toLowerCase();
    items = items.filter((item) =>
      `${item.name} ${item.description} ${item.category.name} ${item.sku}`.toLowerCase().includes(needle),
    );
  }
  if (query.category) items = items.filter((item) => item.category.slug === query.category);
  if (query.occasion) items = items.filter((item) => item.occasion === query.occasion);
  if (query.colour) items = items.filter((item) => item.variants.some((variant) => variant.colour === query.colour));
  if (query.size) items = items.filter((item) => item.variants.some((variant) => variant.size === query.size && variant.stock > 0));
  if (query.availability === "in") items = items.filter((item) => stockOf(item) > 0);
  if (query.min) items = items.filter((item) => priceOf(item) >= Number(query.min));
  if (query.max) items = items.filter((item) => priceOf(item) <= Number(query.max));
  if (query.sort === "oldest") items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  else if (query.sort === "price-asc") items.sort((a, b) => priceOf(a) - priceOf(b));
  else if (query.sort === "price-desc") items.sort((a, b) => priceOf(b) - priceOf(a));
  else if (query.sort === "popularity") items.sort((a, b) => b.popularity - a.popularity);
  else items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return items;
}

export async function getReviews(productId?: string): Promise<Review[]> {
  let query = db().from("glam_reviews").select("id, author_name, quote, rating, created_at, product_id, glam_products(name)").eq("approved", true);
  if (productId) query = query.eq("product_id", productId);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) {
    console.error(error);
    return [];
  }
  return (data ?? []).map((row) => {
    const product = one(row.glam_products as { name: string } | { name: string }[]);
    return {
      id: row.id,
      authorName: row.author_name,
      quote: row.quote,
      rating: row.rating,
      createdAt: row.created_at,
      productName: product?.name,
    };
  });
}

export async function getPosts(): Promise<Post[]> {
  const { data, error } = await db()
    .from("glam_blog_posts")
    .select("id, title, slug, excerpt, content, image_url, author, published_at, highlights, glam_blog_categories(name, slug)")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });
  if (error) {
    console.error(error);
    return [];
  }
  return (data ?? []).map(mapPost);
}

export async function getPost(slug: string) {
  const { data, error } = await db()
    .from("glam_blog_posts")
    .select("id, title, slug, excerpt, content, image_url, author, published_at, highlights, glam_blog_categories(name, slug)")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return mapPost(data);
}

function mapPost(row: {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  author: string;
  published_at: string | null;
  highlights: string[];
  glam_blog_categories: { name: string; slug: string } | { name: string; slug: string }[] | null;
}): Post {
  const category = one(row.glam_blog_categories);
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    imageUrl: row.image_url,
    author: row.author,
    publishedAt: row.published_at,
    highlights: row.highlights ?? [],
    category: category ?? { name: "Journal", slug: "journal" },
  };
}

export async function getTeam(): Promise<TeamMember[]> {
  const { data } = await db().from("glam_team").select("*").order("sort_order");
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    role: row.role,
    bio: row.bio,
    imageUrl: row.image_url,
  }));
}

export async function getGallery(): Promise<GalleryImage[]> {
  const { data } = await db().from("glam_gallery").select("*").order("sort_order");
  return (data ?? []).map((row) => ({ id: row.id, title: row.title, imageUrl: row.image_url }));
}

export async function getCart(userId: string | null, sessionId: string): Promise<CartLine[]> {
  const cart = await findCart(userId, sessionId);
  if (!cart) return [];
  const { data, error } = await db()
    .from("glam_cart_items")
    .select(`id, quantity, size, colour, glam_products (${PRODUCT_SELECT})`)
    .eq("cart_id", cart.id);
  if (error) {
    console.error(error);
    return [];
  }
  return (data ?? []).flatMap((row) => {
    const productRow = one(row.glam_products as Record<string, unknown> | Record<string, unknown>[]);
    if (!productRow) return [];
    return [{ id: row.id, quantity: row.quantity, size: row.size, colour: row.colour, product: mapProduct(productRow) }];
  });
}

export async function findCart(userId: string | null, sessionId: string) {
  if (userId) {
    const { data } = await db().from("glam_carts").select("id").eq("user_id", userId).maybeSingle();
    if (data) return data;
  }
  const { data } = await db().from("glam_carts").select("id").eq("session_id", sessionId).maybeSingle();
  return data;
}

export async function getWishlistIds(userId: string | null, sessionId: string) {
  let query = db().from("glam_wishlist_items").select("product_id");
  query = userId ? query.eq("user_id", userId) : query.eq("session_id", sessionId);
  const { data } = await query;
  return new Set((data ?? []).map((row) => row.product_id as string));
}

const ORDER_COLUMNS =
  "id, number, user_id, name, email, phone, county, town, address, notes, delivery_method, payment_method, status, subtotal, delivery_fee, total, created_at, glam_order_items(name, size, colour, quantity, unit_price)";

export type OrderItem = {
  name: string;
  size: string;
  colour: string;
  quantity: number;
  unit_price: number;
};

export type OrderRecord = {
  id: string;
  number: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string;
  county: string;
  town: string;
  address: string;
  notes: string | null;
  delivery_method: string;
  payment_method: string;
  status: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  created_at: string;
  glam_order_items: OrderItem[];
};

export function orderDiscount(order: { subtotal: number; delivery_fee: number; total: number }) {
  return Math.max(0, order.subtotal + order.delivery_fee - order.total);
}

export async function getOrderByNumber(number: string) {
  const { data } = await db().from("glam_orders").select(ORDER_COLUMNS).eq("number", number).maybeSingle();
  return (data as OrderRecord | null) ?? null;
}

export async function getOrderById(id: string) {
  const { data } = await db().from("glam_orders").select(ORDER_COLUMNS).eq("id", id).maybeSingle();
  return (data as OrderRecord | null) ?? null;
}

export async function getOrders(userId: string) {
  const { data } = await db()
    .from("glam_orders")
    .select("id, number, status, total, created_at, glam_order_items(name, quantity, size, colour, unit_price)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function reviewCount() {
  const { count } = await db().from("glam_reviews").select("id", { count: "exact", head: true }).eq("approved", true);
  return count ?? 0;
}
