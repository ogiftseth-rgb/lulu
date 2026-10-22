"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { readCoupons } from "@/lib/coupons";
import { findCart, getCart } from "@/lib/queries";
import { clearAuthCookie, getCurrentUser, getGuestId, setAuthCookie } from "@/lib/session";
import { db } from "@/lib/supabase";
import { priceOf } from "@/lib/utils";

function id() {
  return crypto.randomUUID();
}

async function cartId() {
  const user = await getCurrentUser();
  const sessionId = await getGuestId();
  const existing = await findCart(user?.id ?? null, sessionId);
  if (existing) return existing.id;
  const created = id();
  const { error } = await db().from("glam_carts").insert({
    id: created,
    user_id: user?.id ?? null,
    session_id: user ? null : sessionId,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
  return created;
}

export async function addToCartQuiet(formData: FormData) {
  await addToCart(formData);
}

export async function buyNow(formData: FormData) {
  const result = await addToCart(formData);
  if (result?.error) return result;
  redirect("/checkout");
}

export async function addToCart(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const size = String(formData.get("size") ?? "");
  const colour = String(formData.get("colour") ?? "");
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1));
  if (!productId || !size || !colour) return { error: "Choose a size and colour." };

  const { data: variant } = await db()
    .from("glam_product_variants")
    .select("stock")
    .eq("product_id", productId)
    .eq("size", size)
    .eq("colour", colour)
    .maybeSingle();
  if (!variant || variant.stock < quantity) return { error: "That piece is not available in the quantity you chose." };

  const currentCart = await cartId();
  const { data: existing } = await db()
    .from("glam_cart_items")
    .select("id, quantity")
    .eq("cart_id", currentCart)
    .eq("product_id", productId)
    .eq("size", size)
    .eq("colour", colour)
    .maybeSingle();

  if (existing) {
    const next = existing.quantity + quantity;
    if (next > variant.stock) return { error: "There is not enough stock for that quantity." };
    await db().from("glam_cart_items").update({ quantity: next }).eq("id", existing.id);
  } else {
    await db().from("glam_cart_items").insert({
      id: id(),
      cart_id: currentCart,
      product_id: productId,
      size,
      colour,
      quantity,
    });
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateCartItem(formData: FormData) {
  const itemId = String(formData.get("itemId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 1);
  if (quantity < 1) {
    await db().from("glam_cart_items").delete().eq("id", itemId);
  } else {
    await db().from("glam_cart_items").update({ quantity }).eq("id", itemId);
  }
  revalidatePath("/", "layout");
}

export async function removeCartItem(formData: FormData) {
  await db().from("glam_cart_items").delete().eq("id", String(formData.get("itemId") ?? ""));
  revalidatePath("/", "layout");
}

export async function toggleWishlist(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const user = await getCurrentUser();
  const sessionId = await getGuestId();
  let query = db().from("glam_wishlist_items").select("id").eq("product_id", productId);
  query = user ? query.eq("user_id", user.id) : query.eq("session_id", sessionId);
  const { data: existing } = await query.maybeSingle();
  if (existing) {
    await db().from("glam_wishlist_items").delete().eq("id", existing.id);
  } else {
    await db().from("glam_wishlist_items").insert({
      id: id(),
      product_id: productId,
      user_id: user?.id ?? null,
      session_id: user ? null : sessionId,
    });
  }
  revalidatePath("/", "layout");
}

const newsletterSchema = z.object({ email: z.string().email("Enter a valid email address.") });

export async function subscribeNewsletter(formData: FormData) {
  const parsed = newsletterSchema.safeParse({ email: String(formData.get("email") ?? "") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the email address." };
  const { error } = await db().from("glam_subscribers").insert({ id: id(), email: parsed.data.email.toLowerCase() });
  if (error && !error.message.toLowerCase().includes("duplicate")) return { error: "We could not save that subscription." };
  return { ok: true };
}

const contactSchema = z.object({
  name: z.string().min(2, "Enter your full name."),
  email: z.string().email("Enter a valid email address."),
  phone: z.string().min(8, "Enter a phone number."),
  subject: z.string().min(2, "Enter a subject."),
  message: z.string().min(10, "Tell us a little more."),
});

export async function submitContact(formData: FormData) {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  const { error } = await db().from("glam_enquiries").insert({ id: id(), ...parsed.data });
  if (error) return { error: "We could not save your message." };
  redirect("/contact?sent=1");
}

const registerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  password: z.string().min(8, "Use at least 8 characters."),
  confirm: z.string(),
}).refine((value) => value.password === value.confirm, { message: "Passwords do not match.", path: ["confirm"] });

export async function registerAccount(formData: FormData) {
  const parsed = registerSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  const email = parsed.data.email.toLowerCase();
  const { data: existing } = await db().from("glam_users").select("id").eq("email", email).maybeSingle();
  if (existing) return { error: "An account with that email already exists." };
  const userId = id();
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const { error } = await db().from("glam_users").insert({
    id: userId,
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
    email,
    phone: parsed.data.phone,
    password_hash: passwordHash,
    role: "CUSTOMER",
    is_demo: false,
  });
  if (error) return { error: "We could not create the account." };
  await startSession(userId);
  await attachGuestCart(userId);
  redirect("/account");
}

export async function loginAccount(formData: FormData) {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  const { data: user } = await db().from("glam_users").select("id, password_hash, role").eq("email", email).maybeSingle();
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return { error: "Those details do not match an account." };
  }
  await startSession(user.id);
  await attachGuestCart(user.id);
  redirect(user.role === "CUSTOMER" ? "/account" : "/admin");
}

async function startSession(userId: string) {
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString();
  await db().from("glam_sessions").insert({ id: id(), token, user_id: userId, expires_at: expires });
  await setAuthCookie(token);
}

async function attachGuestCart(userId: string) {
  const sessionId = await getGuestId();
  const { data: guest } = await db().from("glam_carts").select("id").eq("session_id", sessionId).maybeSingle();
  if (!guest) return;
  const { data: owned } = await db().from("glam_carts").select("id").eq("user_id", userId).maybeSingle();
  if (!owned) {
    await db().from("glam_carts").update({ user_id: userId, session_id: null }).eq("id", guest.id);
    return;
  }
  const { data: items } = await db().from("glam_cart_items").select("*").eq("cart_id", guest.id);
  for (const item of items ?? []) {
    const { data: match } = await db()
      .from("glam_cart_items")
      .select("id, quantity")
      .eq("cart_id", owned.id)
      .eq("product_id", item.product_id)
      .eq("size", item.size)
      .eq("colour", item.colour)
      .maybeSingle();
    if (match) {
      await db().from("glam_cart_items").update({ quantity: match.quantity + item.quantity }).eq("id", match.id);
    } else {
      await db().from("glam_cart_items").update({ cart_id: owned.id }).eq("id", item.id);
    }
  }
  await db().from("glam_carts").delete().eq("id", guest.id);
}

export async function logoutAccount() {
  const user = await getCurrentUser();
  if (user) {
    const { cookies } = await import("next/headers");
    const token = (await cookies()).get("glam_session")?.value;
    if (token) await db().from("glam_sessions").delete().eq("token", token);
  }
  await clearAuthCookie();
  redirect("/");
}

const bespokeSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  outfitType: z.string().min(2),
  occasion: z.string().min(2),
  eventDate: z.string().min(4),
  colours: z.string().min(2),
  budget: z.string().min(2),
  measurements: z.string().optional(),
  notes: z.string().optional(),
});

export async function submitBespoke(formData: FormData) {
  const parsed = bespokeSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    outfitType: formData.get("outfitType"),
    occasion: formData.get("occasion"),
    eventDate: formData.get("eventDate"),
    colours: formData.get("colours"),
    budget: formData.get("budget"),
    measurements: String(formData.get("measurements") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  const user = await getCurrentUser();
  const { error } = await db().from("glam_bespoke_requests").insert({
    id: id(),
    user_id: user?.id ?? null,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    outfit_type: parsed.data.outfitType,
    occasion: parsed.data.occasion,
    event_date: parsed.data.eventDate,
    colours: parsed.data.colours,
    budget: parsed.data.budget,
    measurements: parsed.data.measurements || null,
    notes: parsed.data.notes || null,
    status: "New Request",
  });
  if (error) return { error: "We could not save the request." };
  redirect("/bespoke?sent=1");
}

const checkoutSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  county: z.string().min(2),
  town: z.string().min(2),
  address: z.string().min(5),
  notes: z.string().optional(),
  deliveryMethod: z.enum(["studio", "nairobi", "upcountry"]),
});

const deliveryFees = { studio: 0, nairobi: 500, upcountry: 1500 } as const;

export async function placeOrder(formData: FormData) {
  const parsed = checkoutSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    county: formData.get("county"),
    town: formData.get("town"),
    address: formData.get("address"),
    notes: String(formData.get("notes") ?? ""),
    deliveryMethod: formData.get("deliveryMethod"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the delivery details." };
  const user = await getCurrentUser();
  const sessionId = await getGuestId();
  const lines = await getCart(user?.id ?? null, sessionId);
  if (lines.length === 0) return { error: "Your cart is empty." };

  for (const line of lines) {
    const { data: variant } = await db()
      .from("glam_product_variants")
      .select("id, stock")
      .eq("product_id", line.product.id)
      .eq("size", line.size)
      .eq("colour", line.colour)
      .maybeSingle();
    if (!variant || variant.stock < line.quantity) {
      return { error: `${line.product.name} is no longer available in ${line.colour}, size ${line.size}.` };
    }
  }

  const subtotal = lines.reduce((sum, line) => sum + priceOf(line.product) * line.quantity, 0);
  const code = String(formData.get("coupon") ?? "").trim().toUpperCase();
  let discount = 0;
  if (code) {
    const coupons = await readCoupons();
    const match = coupons.find((coupon) => coupon.code === code);
    if (!match) return { error: "That coupon code is not active." };
    discount = Math.min(subtotal, Math.round((subtotal * match.percent) / 100));
  }
  const deliveryFee = deliveryFees[parsed.data.deliveryMethod];
  const orderId = id();
  const number = `GL-${Date.now().toString().slice(-8)}`;
  const { error } = await db().from("glam_orders").insert({
    id: orderId,
    number,
    user_id: user?.id ?? null,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    county: parsed.data.county,
    town: parsed.data.town,
    address: parsed.data.address,
    notes: [parsed.data.notes, code ? `Coupon ${code}` : ""].filter(Boolean).join("\n") || null,
    delivery_method: parsed.data.deliveryMethod,
    payment_method: "mpesa_pending",
    status: "pending_payment",
    subtotal,
    delivery_fee: deliveryFee,
    total: subtotal + deliveryFee - discount,
    is_demo: false,
  });
  if (error) return { error: "We could not place the order." };

  await db().from("glam_order_items").insert(
    lines.map((line) => ({
      id: id(),
      order_id: orderId,
      product_id: line.product.id,
      name: line.product.name,
      size: line.size,
      colour: line.colour,
      quantity: line.quantity,
      unit_price: priceOf(line.product),
    })),
  );

  for (const line of lines) {
    const { data: variant } = await db()
      .from("glam_product_variants")
      .select("id, stock")
      .eq("product_id", line.product.id)
      .eq("size", line.size)
      .eq("colour", line.colour)
      .maybeSingle();
    if (variant) {
      await db().from("glam_product_variants").update({ stock: Math.max(0, variant.stock - line.quantity) }).eq("id", variant.id);
    }
  }

  const cart = await findCart(user?.id ?? null, sessionId);
  if (cart) await db().from("glam_cart_items").delete().eq("cart_id", cart.id);
  revalidateTag("catalogue");
  redirect(`/checkout?placed=${number}`);
}

export async function updateProfile(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (firstName.length < 2 || lastName.length < 2 || phone.length < 8) {
    redirect(`/account?notice=${encodeURIComponent("Check your name and phone.")}`);
  }
  const patch: Record<string, string> = {
    first_name: firstName,
    last_name: lastName,
    phone,
    updated_at: new Date().toISOString(),
  };
  const nextPassword = String(formData.get("nextPassword") ?? "");
  if (nextPassword) {
    if (nextPassword.length < 8) {
      redirect(`/account?notice=${encodeURIComponent("Use at least 8 characters for the new password.")}`);
    }
    const { data } = await db().from("glam_users").select("password_hash").eq("id", user.id).maybeSingle();
    const currentPassword = String(formData.get("currentPassword") ?? "");
    if (!data || !(await bcrypt.compare(currentPassword, data.password_hash))) {
      redirect(`/account?notice=${encodeURIComponent("Current password does not match.")}`);
    }
    patch.password_hash = await bcrypt.hash(nextPassword, 10);
  }
  const { error } = await db().from("glam_users").update(patch).eq("id", user.id);
  if (error) redirect(`/account?notice=${encodeURIComponent("We could not save the profile.")}`);
  revalidatePath("/", "layout");
  redirect(`/account?notice=${encodeURIComponent("Profile saved.")}`);
}
