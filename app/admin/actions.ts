"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin";
import { parseCouponText } from "@/lib/coupons";
import { db } from "@/lib/supabase";

const orderStatuses = ["pending_payment", "confirmed", "in_production", "ready", "delivered", "cancelled"] as const;
const bespokeStatuses = ["New Request", "Consultation booked", "In production", "Ready for fitting", "Completed"] as const;

function refreshShop() {
  revalidatePath("/admin", "layout");
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/products");
  revalidatePath("/blog");
  revalidatePath("/about");
  revalidatePath("/wishlist");
  revalidatePath("/testimonials");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function notice(path: string, message: string): never {
  redirect(`${path}?notice=${encodeURIComponent(message)}`);
}

export async function updateProduct(formData: FormData) {
  await requireStaff();
  const productId = String(formData.get("id") ?? "");
  const regular = Number(formData.get("regularPrice"));
  const saleRaw = String(formData.get("salePrice") ?? "").trim();
  const sale = saleRaw === "" ? null : Number(saleRaw);
  if (!productId || !Number.isFinite(regular) || regular < 0) return;
  if (sale !== null && (!Number.isFinite(sale) || sale < 0)) return;
  const status = formData.get("status") === "draft" ? "draft" : "published";
  await db()
    .from("glam_products")
    .update({
      regular_price: Math.round(regular),
      sale_price: sale === null ? null : Math.round(sale),
      featured: formData.get("featured") === "on",
      is_new: formData.get("isNew") === "on",
      status,
    })
    .eq("id", productId);

  const variantIds = formData.getAll("variantId").map(String);
  const stocks = formData.getAll("stock").map(String);
  for (let index = 0; index < variantIds.length; index += 1) {
    const stock = Number(stocks[index]);
    if (!variantIds[index] || !Number.isFinite(stock)) continue;
    await db()
      .from("glam_product_variants")
      .update({ stock: Math.max(0, Math.round(stock)) })
      .eq("id", variantIds[index])
      .eq("product_id", productId);
  }
  refreshShop();
}

export async function updateOrderStatus(formData: FormData) {
  await requireStaff();
  const orderId = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!orderId || !orderStatuses.includes(status as (typeof orderStatuses)[number])) return;
  await db().from("glam_orders").update({ status }).eq("id", orderId);
  revalidatePath("/admin", "layout");
}

export async function setReviewApproval(formData: FormData) {
  await requireStaff();
  const reviewId = String(formData.get("id") ?? "");
  const approved = formData.get("approved") === "true";
  if (!reviewId) return;
  await db().from("glam_reviews").update({ approved }).eq("id", reviewId);
  refreshShop();
}

export async function updateBespokeStatus(formData: FormData) {
  await requireStaff();
  const requestId = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!requestId || !bespokeStatuses.includes(status as (typeof bespokeStatuses)[number])) return;
  await db().from("glam_bespoke_requests").update({ status }).eq("id", requestId);
  revalidatePath("/admin/requests");
}

export async function createProduct(formData: FormData) {
  await requireStaff();
  const name = String(formData.get("name") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim().toUpperCase();
  const description = String(formData.get("description") ?? "").trim();
  const fabric = String(formData.get("fabric") ?? "").trim();
  const care = String(formData.get("care") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "");
  const occasion = String(formData.get("occasion") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const colour = String(formData.get("colour") ?? "").trim();
  const sizes = String(formData.get("sizes") ?? "")
    .split(",")
    .map((size) => size.trim())
    .filter(Boolean);
  const regular = Number(formData.get("regularPrice"));
  const stock = Number(formData.get("stock"));
  const saleRaw = String(formData.get("salePrice") ?? "").trim();
  const sale = saleRaw === "" ? null : Number(saleRaw);
  if (name.length < 2 || sku.length < 3 || description.length < 10 || fabric.length < 2 || care.length < 2) {
    notice("/admin/products", "Fill in the name, SKU, description, fabric, and care.");
  }
  if (!categoryId || occasion.length < 2 || !imageUrl.startsWith("http") || !colour || sizes.length === 0) {
    notice("/admin/products", "Choose a category, occasion, image URL, colour, and at least one size.");
  }
  if (!Number.isFinite(regular) || regular < 0 || !Number.isFinite(stock) || stock < 0) {
    notice("/admin/products", "Check the price and stock.");
  }
  if (sale !== null && (!Number.isFinite(sale) || sale < 0)) notice("/admin/products", "Check the sale price.");
  const slug = slugify(String(formData.get("slug") ?? "") || name) || slugify(sku);
  const productId = crypto.randomUUID();
  const { error } = await db().from("glam_products").insert({
    id: productId,
    sku,
    name,
    slug,
    description,
    fabric,
    care,
    regular_price: Math.round(regular),
    sale_price: sale === null ? null : Math.round(sale),
    category_id: categoryId,
    occasion,
    featured: formData.get("featured") === "on",
    is_new: formData.get("isNew") === "on",
    is_bespoke: formData.get("bespoke") === "on",
    status: formData.get("status") === "draft" ? "draft" : "published",
    popularity: 0,
    is_demo: false,
  });
  if (error) notice("/admin/products", "That SKU or name is already in the catalogue.");
  await db().from("glam_product_images").insert({
    id: crypto.randomUUID(),
    product_id: productId,
    url: imageUrl,
    alt: name,
    sort_order: 1,
  });
  await db().from("glam_product_variants").insert(
    sizes.map((size) => ({
      id: crypto.randomUUID(),
      product_id: productId,
      size,
      colour,
      stock: Math.round(stock),
    })),
  );
  refreshShop();
  notice("/admin/products", "Piece added.");
}

export async function saveHero(formData: FormData) {
  await requireStaff();
  const heading = String(formData.get("heading") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const primaryLabel = String(formData.get("primaryLabel") ?? "").trim();
  const primaryHref = String(formData.get("primaryHref") ?? "").trim();
  if (!heading || !description || !imageUrl.startsWith("http") || !primaryLabel || !primaryHref.startsWith("/")) {
    notice("/admin/content", "A slide needs a heading, description, image URL, and a primary link that starts with /.");
  }
  const row = {
    heading,
    description,
    image_url: imageUrl,
    primary_label: primaryLabel,
    primary_href: primaryHref,
    secondary_label: String(formData.get("secondaryLabel") ?? "").trim() || null,
    secondary_href: String(formData.get("secondaryHref") ?? "").trim() || null,
    sort_order: Number(formData.get("sortOrder") ?? 1) || 1,
    active: formData.get("active") !== "no",
  };
  const id = String(formData.get("id") ?? "");
  const { error } = id
    ? await db().from("glam_hero_slides").update(row).eq("id", id)
    : await db().from("glam_hero_slides").insert({ id: crypto.randomUUID(), ...row, is_demo: false });
  if (error) notice("/admin/content", "The slide could not be saved.");
  refreshShop();
  notice("/admin/content", "Slide saved.");
}

export async function savePage(formData: FormData) {
  await requireStaff();
  const key = String(formData.get("key") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  if (!key || title.length < 2 || body.length < 10) notice("/admin/content", "Each page needs a title and a longer body.");
  const { error } = await db()
    .from("glam_page_content")
    .update({ title, body, image_url: imageUrl || null })
    .eq("key", key);
  if (error) notice("/admin/content", "The page could not be saved.");
  refreshShop();
  notice("/admin/content", "Page saved.");
}

export async function savePost(formData: FormData) {
  await requireStaff();
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "");
  if (title.length < 4 || excerpt.length < 10 || content.length < 20 || !imageUrl.startsWith("http") || author.length < 2 || !categoryId) {
    notice("/admin/journal", "Fill in the title, excerpt, story, image, author, and category.");
  }
  const highlights = String(formData.get("highlights") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const published = formData.get("published") === "yes";
  const existingPublished = String(formData.get("publishedAt") ?? "");
  const row = {
    title,
    slug: slugify(String(formData.get("slug") ?? "") || title) || slugify(title),
    excerpt,
    content,
    image_url: imageUrl,
    author,
    category_id: categoryId,
    highlights,
    published_at: published ? existingPublished || new Date().toISOString() : null,
  };
  const id = String(formData.get("id") ?? "");
  const { error } = id
    ? await db().from("glam_blog_posts").update(row).eq("id", id)
    : await db().from("glam_blog_posts").insert({ id: crypto.randomUUID(), ...row, is_demo: false });
  if (error) notice("/admin/journal", "That journal title is already in use.");
  refreshShop();
  notice("/admin/journal", "Journal entry saved.");
}

const settingKeys = [
  "business_name",
  "tagline",
  "phone",
  "whatsapp",
  "email",
  "address",
  "instagram",
  "facebook",
  "since",
  "hours_week",
  "hours_saturday",
  "hours_sunday",
] as const;

export async function saveSettings(formData: FormData) {
  await requireStaff();
  const coupons = parseCouponText(String(formData.get("coupons") ?? ""));
  if (!coupons) notice("/admin/settings", "Each coupon line should look like ATELIER10 10.");
  for (const key of settingKeys) {
    const value = String(formData.get(key) ?? "").trim();
    if (!value) notice("/admin/settings", "Fill in every studio detail.");
    const { error } = await db().from("glam_settings").upsert({ key, value }, { onConflict: "key" });
    if (error) notice("/admin/settings", "The studio details could not be saved.");
  }
  const { error } = await db()
    .from("glam_settings")
    .upsert({ key: "coupons", value: JSON.stringify(coupons) }, { onConflict: "key" });
  if (error) notice("/admin/settings", "The coupons could not be saved.");
  refreshShop();
  notice("/admin/settings", "Studio details saved.");
}
