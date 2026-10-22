"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/admin";
import { db } from "@/lib/supabase";

const orderStatuses = ["pending_payment", "confirmed", "in_production", "ready", "delivered", "cancelled"] as const;
const bespokeStatuses = ["New Request", "Consultation booked", "In production", "Ready for fitting", "Completed"] as const;

function refreshShop() {
  revalidatePath("/admin", "layout");
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/products");
  revalidatePath("/testimonials");
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
