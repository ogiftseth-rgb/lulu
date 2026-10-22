import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const raw = readFileSync(resolve(process.cwd(), ".env"), "utf8");
for (const line of raw.split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

async function ids(table: string) {
  const { data, error } = await supabase.from(table).select("id").eq("is_demo", true);
  if (error) throw error;
  return (data ?? []).map((row) => row.id as string);
}

async function main() {
  const productIds = await ids("glam_products");
  const orderIds = await ids("glam_orders");
  const userIds = await ids("glam_users");
  if (orderIds.length) await supabase.from("glam_order_items").delete().in("order_id", orderIds);
  if (productIds.length) {
    await supabase.from("glam_cart_items").delete().in("product_id", productIds);
    await supabase.from("glam_wishlist_items").delete().in("product_id", productIds);
    await supabase.from("glam_order_items").delete().in("product_id", productIds);
    await supabase.from("glam_reviews").delete().in("product_id", productIds);
    await supabase.from("glam_product_images").delete().in("product_id", productIds);
    await supabase.from("glam_product_variants").delete().in("product_id", productIds);
    await supabase.from("glam_products").delete().in("id", productIds);
  }
  await supabase.from("glam_orders").delete().eq("is_demo", true);
  await supabase.from("glam_categories").delete().eq("is_demo", true);
  await supabase.from("glam_blog_posts").delete().eq("is_demo", true);
  await supabase.from("glam_hero_slides").delete().eq("is_demo", true);
  await supabase.from("glam_page_content").delete().eq("is_demo", true);
  await supabase.from("glam_gallery").delete().eq("is_demo", true);
  await supabase.from("glam_team").delete().eq("is_demo", true);
  await supabase.from("glam_reviews").delete().eq("is_demo", true);
  if (userIds.length) await supabase.from("glam_users").delete().in("id", userIds);
  const { count } = await supabase.from("glam_blog_posts").select("id", { count: "exact", head: true });
  if (!count) await supabase.from("glam_blog_categories").delete().neq("id", "");
  console.log("Demo rows removed. Enquiries, subscribers, and real orders were kept.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
