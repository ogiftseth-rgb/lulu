import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  const raw = readFileSync(resolve(process.cwd(), ".env"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

loadEnv();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

const photo = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;

const shots = [
  "photo-1490481651871-ab68de25d43d",
  "photo-1515886657613-9f3515b0c78f",
  "photo-1469334031218-e382a71b716b",
  "photo-1483985988355-763728e1935b",
  "photo-1496747611176-843222e1e57c",
  "photo-1509631179647-0177331693ae",
  "photo-1524504388940-b1c1722653e1",
  "photo-1539109136881-3be0616acf4b",
  "photo-1515372039744-b8f02a3ae446",
  "photo-1566174053879-31528523f8ae",
  "photo-1595777457583-95e059d581b8",
  "photo-1612336307429-8a898d10e223",
  "photo-1572804013309-59a88b7e92f1",
  "photo-1581044777550-4cfa60707c03",
  "photo-1529139574466-a303027c1d8b",
  "photo-1487222477894-8943e31ef7b2",
  "photo-1492707892479-7bc8d5a4ee93",
  "photo-1524502397800-2eeaad7c3fe5",
  "photo-1485968579580-b6d095142e6e",
  "photo-1551803091-e20673f15770",
].map(photo);

const portraits = [
  photo("photo-1531123897727-8f129e1688ce"),
  photo("photo-1534528741775-53994a69daeb"),
  photo("photo-1488426862026-3ee34a7d66df"),
  photo("photo-1524504388940-b1c1722653e1"),
];

const uid = () => crypto.randomUUID();

const categories = [
  ["Evening & Occasion Wear", "evening-occasion", "Statement gowns and after-dark dressing.", 1],
  ["Corporate Elegance", "corporate-elegance", "Tailored pieces for the boardroom and beyond.", 2],
  ["Contemporary African Luxury", "african-luxury", "Modern silhouettes with East African cloth and craft.", 3],
  ["Bespoke Creations", "bespoke-creations", "Made around your measurements and your occasion.", 4],
  ["Everyday Luxury", "everyday-luxury", "Polished pieces for days that still deserve beauty.", 5],
  ["Wedding Guest Collection", "wedding-guest", "Dresses for vows, ruracio, and the reception.", 6],
] as const;

const products = [
  ["GL-EV-001", "Nyala Column Gown", "nyala-column-gown", "evening-occasion", "Weddings", 28500, null, true, false, false, 42],
  ["GL-EV-002", "Midnight Bead Cape", "midnight-bead-cape", "evening-occasion", "Date nights", 32000, 28900, true, true, false, 36],
  ["GL-EV-003", "Lamu Pleated Dress", "lamu-pleated-dress", "evening-occasion", "Birthdays", 24000, null, false, true, false, 28],
  ["GL-CO-004", "Savannah Silk Blazer", "savannah-silk-blazer", "corporate-elegance", "Corporate events", 18500, null, true, false, false, 51],
  ["GL-CO-005", "Westlands Tailored Suit", "westlands-tailored-suit", "corporate-elegance", "Corporate events", 26500, null, false, false, false, 22],
  ["GL-CO-006", "Ivory Boardroom Dress", "ivory-boardroom-dress", "corporate-elegance", "Corporate events", 16800, 14900, false, true, false, 33],
  ["GL-AF-007", "Kitenge Gold Wrap", "kitenge-gold-wrap", "african-luxury", "Ruracio celebrations", 22000, null, true, false, false, 47],
  ["GL-AF-008", "Ankara Sunset Set", "ankara-sunset-set", "african-luxury", "Weekend occasions", 14500, null, false, true, false, 39],
  ["GL-AF-009", "Heritage Beaded Gown", "heritage-beaded-gown", "african-luxury", "Ruracio celebrations", 36000, null, true, false, false, 18],
  ["GL-BE-010", "Atelier Signature Gown", "atelier-signature-gown", "bespoke-creations", "Weddings", 45000, null, true, false, true, 15],
  ["GL-BE-011", "Custom Ruracio Ensemble", "custom-ruracio-ensemble", "bespoke-creations", "Ruracio celebrations", 38000, null, false, false, true, 12],
  ["GL-BE-012", "Bespoke Reception Dress", "bespoke-reception-dress", "bespoke-creations", "Bridal receptions", 42000, null, false, true, true, 9],
  ["GL-ED-013", "Champagne Day Dress", "champagne-day-dress", "everyday-luxury", "Weekend occasions", 9800, null, true, false, false, 60],
  ["GL-ED-014", "Onyx Knit Set", "onyx-knit-set", "everyday-luxury", "Weekend occasions", 12500, 11000, false, true, false, 44],
  ["GL-ED-015", "Rose Linen Shirt Dress", "rose-linen-shirt-dress", "everyday-luxury", "Date nights", 8900, null, false, false, false, 31],
  ["GL-ED-016", "Nairobi Weekend Coat", "nairobi-weekend-coat", "everyday-luxury", "Weekend occasions", 15600, null, false, true, false, 27],
  ["GL-WE-017", "Garden Guest Gown", "garden-guest-gown", "wedding-guest", "Weddings", 27500, null, true, false, false, 38],
  ["GL-WE-018", "Ruracio Guest Wrap", "ruracio-guest-wrap", "wedding-guest", "Ruracio celebrations", 19800, null, false, true, false, 29],
  ["GL-WE-019", "Reception Column Dress", "reception-column-dress", "wedding-guest", "Bridal receptions", 31000, 27900, true, false, false, 21],
  ["GL-WE-020", "Candlelight Slip Dress", "candlelight-slip-dress", "wedding-guest", "Date nights", 21000, null, false, false, false, 25],
] as const;

const colours = ["Ivory", "Champagne", "Burgundy", "Onyx", "Dusty Rose"];
const sizes = ["XS", "S", "M", "L", "XL"];

const posts = [
  ["Dressing for a Nairobi evening", "dressing-for-a-nairobi-evening", "fashion-inspiration", "How to move from daylight tailoring to candlelight without changing your confidence.", "Start with a column silhouette and one piece of jewellery you already love. Nairobi evenings reward fabric that catches light quietly: silk, crepe, and a cape that can leave the chair when the room warms up."],
  ["A size guide you can trust", "a-size-guide-you-can-trust", "styling-tips", "Measurements matter more than a label. Here is how we fit gowns, suiting, and wraps.", "Measure bust, waist, and hip in centimetres, then send the numbers with your bespoke request. If you are between sizes, we cut the larger size and tailor the waist."],
  ["What bespoke actually includes", "what-bespoke-actually-includes", "bespoke-fashion", "From the first consultation to the final fitting, this is the Glam by Lulu process.", "A bespoke piece begins with a conversation, a cloth story, and a date. We sketch, sample, and fit. Deposits are recorded before production starts."],
  ["Wedding guest, not the bride", "wedding-guest-not-the-bride", "wedding-fashion", "Colours, lengths, and cloth that honour the couple and still feel like you.", "Ask about the dress code, then choose a gown that can sit, dance, and photograph. Champagne, dusty rose, and deep burgundy travel well between garden and ballroom."],
  ["Ruracio dressing notes", "ruracio-dressing-notes", "wedding-fashion", "Cloth, beading, and coverage for a celebration that is both formal and familial.", "A wrap with weight and a bead story reads as considered. Bring a second layer for photographs at midday."],
  ["The polished work wardrobe", "the-polished-work-wardrobe", "corporate-elegance", "Three pieces that carry a week of meetings in Westlands or Upper Hill.", "A silk blazer, a boardroom dress, and a tailored trouser. Keep the palette ivory, onyx, and champagne so the pieces share a rail."],
  ["Cloth stories for the new season", "cloth-stories-for-the-new-season", "fashion-trends", "What we are cutting now: lighter crepe, richer beadwork, and quieter logos.", "The season is about surface, not slogans. If a piece needs a label to explain it, it is not finished."],
  ["Inside the atelier", "inside-the-atelier", "behind-the-brand", "The people who cut, bead, and fit Glam by Lulu, and why the studio opens by appointment on Sundays.", "The atelier is a working room, not a showroom set. Fittings are unhurried. Sundays are kept for brides and bespoke clients."],
];

async function idsOf(table: string) {
  const { data, error } = await supabase.from(table).select("id");
  if (error) throw error;
  return (data ?? []).map((row) => row.id);
}

async function clearDemo() {
  const productIds = await idsOf("glam_products");
  const orderIds = (await supabase.from("glam_orders").select("id").eq("is_demo", true)).data?.map((row) => row.id) ?? [];
  if (orderIds.length) await supabase.from("glam_order_items").delete().in("order_id", orderIds);
  await supabase.from("glam_orders").delete().eq("is_demo", true);
  if (productIds.length) {
    await supabase.from("glam_cart_items").delete().in("product_id", productIds);
    await supabase.from("glam_wishlist_items").delete().in("product_id", productIds);
    await supabase.from("glam_order_items").delete().in("product_id", productIds);
    await supabase.from("glam_reviews").delete().in("product_id", productIds);
    await supabase.from("glam_product_images").delete().in("product_id", productIds);
    await supabase.from("glam_product_variants").delete().in("product_id", productIds);
    await supabase.from("glam_products").delete().in("id", productIds);
  }
  await supabase.from("glam_categories").delete().eq("is_demo", true);
  await supabase.from("glam_blog_posts").delete().eq("is_demo", true);
  await supabase.from("glam_blog_categories").delete().neq("id", "");
  await supabase.from("glam_hero_slides").delete().eq("is_demo", true);
  await supabase.from("glam_page_content").delete().eq("is_demo", true);
  await supabase.from("glam_gallery").delete().eq("is_demo", true);
  await supabase.from("glam_team").delete().eq("is_demo", true);
  await supabase.from("glam_reviews").delete().eq("is_demo", true);
  const users = (await supabase.from("glam_users").select("id").eq("is_demo", true)).data ?? [];
  if (users.length) await supabase.from("glam_users").delete().in("id", users.map((user) => user.id));
  await supabase.from("glam_settings").delete().neq("key", "");
}

async function main() {
  await clearDemo();
  const passwordHash = await bcrypt.hash("DemoPass123!", 10);
  const categoryIds: Record<string, string> = {};

  const { error: categoryError } = await supabase.from("glam_categories").insert(
    categories.map(([name, slug, description, sort]) => {
      const id = uid();
      categoryIds[slug] = id;
      return { id, name, slug, description, image_url: shots[sort], sort_order: sort, is_demo: true };
    }),
  );
  if (categoryError) throw categoryError;

  const productIds: string[] = [];
  for (const [index, product] of products.entries()) {
    const [sku, name, slug, category, occasion, regular, sale, featured, isNew, bespoke, popularity] = product;
    const id = uid();
    productIds.push(id);
    const { error } = await supabase.from("glam_products").insert({
      id,
      sku,
      name,
      slug,
      description: `${name} is cut in Nairobi for women who want occasion dressing to feel personal. The cloth is chosen for drape, the finish is quiet, and the fit is meant to be altered rather than endured. Sample piece from the Glam by Lulu demo catalogue.`,
      fabric: index % 2 === 0 ? "Silk crepe with cotton lining" : "Stretch crepe and hand-finished trim",
      care: "Dry clean only. Steam, do not iron beading. Store on a padded hanger.",
      regular_price: regular,
      sale_price: sale,
      category_id: categoryIds[category],
      occasion,
      featured,
      is_new: isNew,
      is_bespoke: bespoke,
      status: "published",
      popularity,
      is_demo: true,
    });
    if (error) throw error;

    await supabase.from("glam_product_images").insert([
      { id: uid(), product_id: id, url: shots[index % shots.length], alt: name, sort_order: 0 },
      { id: uid(), product_id: id, url: shots[(index + 5) % shots.length], alt: `${name} detail`, sort_order: 1 },
    ]);

    const palette = [colours[index % colours.length], colours[(index + 2) % colours.length]];
    const variants = sizes.flatMap((size) =>
      palette.map((colour, colourIndex) => ({
        id: uid(),
        product_id: id,
        size,
        colour,
        stock: bespoke ? 2 : 4 + ((index + colourIndex) % 5),
      })),
    );
    const { error: variantError } = await supabase.from("glam_product_variants").insert(variants);
    if (variantError) throw variantError;
  }

  const blogIds: Record<string, string> = {};
  const blogCategories = [
    ["Fashion Inspiration", "fashion-inspiration"],
    ["Styling Tips", "styling-tips"],
    ["Bespoke Fashion", "bespoke-fashion"],
    ["Wedding Fashion", "wedding-fashion"],
    ["Corporate Elegance", "corporate-elegance"],
    ["Fashion Trends", "fashion-trends"],
    ["Behind the Brand", "behind-the-brand"],
  ];
  const { error: blogCategoryError } = await supabase.from("glam_blog_categories").insert(
    blogCategories.map(([name, slug]) => {
      const id = uid();
      blogIds[slug] = id;
      return { id, name, slug };
    }),
  );
  if (blogCategoryError) throw blogCategoryError;

  const { error: postError } = await supabase.from("glam_blog_posts").insert(
    posts.map(([title, slug, category, excerpt, content], index) => ({
      id: uid(),
      title,
      slug,
      excerpt,
      content: `${content}\n\nThis journal entry is sample editorial for the Glam by Lulu demo. It is not a record of a client appointment.`,
      image_url: shots[(index + 3) % shots.length],
      author: index % 2 === 0 ? "Lulu Atelier" : "Amina Waweru",
      category_id: blogIds[category],
      published_at: new Date(Date.now() - index * 86400000 * 6).toISOString(),
      highlights: ["Measured fittings", "Kenyan occasions", "Cloth chosen for drape"],
      is_demo: true,
    })),
  );
  if (postError) throw postError;

  await supabase.from("glam_hero_slides").insert([
    ["Elegance, Made Personal.", "Discover a world where sophistication meets individuality. From statement pieces to tailored everyday elegance, Glam by Lulu creates fashion for women who celebrate their femininity.", "/shop", "Shop the Collection", "/bespoke", "Create Your Bespoke Look", 1],
    ["Where fashion becomes an expression of you.", "A Kenyan luxury house for bespoke clothing, occasion wear, and contemporary dressing.", "/about", "Our Story", "/products", "View the Edit", 2],
    ["Made for you. Only you.", "Silhouette, cloth, and finishing, shaped around the occasion you are actually attending.", "/bespoke", "Request a Consultation", "/shop", "Shop Ready to Wear", 3],
    ["For weddings, ruracio, and the room after.", "Guest gowns and ceremony ensembles cut to be remembered kindly in photographs.", "/shop?category=wedding-guest", "Wedding Guest Edit", "/contact", "Talk to the Studio", 4],
  ].map(([heading, description, primaryHref, primaryLabel, secondaryHref, secondaryLabel, sort], index) => ({
    id: uid(),
    heading,
    description,
    image_url: shots[index],
    primary_label: primaryLabel,
    primary_href: primaryHref,
    secondary_label: secondaryLabel,
    secondary_href: secondaryHref,
    sort_order: Number(sort),
    active: true,
    is_demo: true,
  })));

  const pages = [
    ["story", "Our Story", "Glam by Lulu is a Kenyan women's fashion brand dedicated to celebrating femininity through luxurious designs, sophisticated styling, and bespoke creations. We believe every woman deserves the confidence that comes from wearing something truly beautiful.", shots[4]],
    ["mission", "Our Mission", "To design clothing that lets Kenyan women feel composed, celebrated, and entirely themselves.", null],
    ["vision", "Our Vision", "To be the atelier women trust for the occasions that mark a life, from the first board seat to the family ruracio.", null],
    ["philosophy", "Our Philosophy", "Elegance is personal. A beautiful garment respects the woman wearing it, the cloth it is cut from, and the event it enters.", null],
    ["different", "What Makes Glam by Lulu Different", "We design for Kenyan calendars: weddings, ruracio, corporate rooms, and the Tuesday that still deserves a considered dress.", null],
    ["craft", "Bespoke Craftsmanship", "Patterns are cut from your measurements. Beading, lining, and hem are decided with you, not pulled from a size chart alone.", shots[8]],
    ["quality", "Our Commitment to Quality", "Seams are finished, linings are breathable, and alterations are part of the service rather than an apology.", null],
  ];
  await supabase.from("glam_page_content").insert(
    pages.map(([key, title, body, image]) => ({
      id: uid(),
      key,
      title,
      body,
      image_url: image,
      is_demo: true,
    })),
  );

  await supabase.from("glam_team").insert([
    ["Amina Waweru", "Creative Director", "Leads cloth, colour, and the stories the collection tells.", 1],
    ["Faith Njeri", "Head of Atelier", "Cuts the first toile and stays through the final fitting.", 2],
    ["Wanjiku Aoko", "Stylist", "Builds the edit for weddings, work, and the weekend between them.", 3],
    ["Lulu Mwangi", "Founder", "Started the house so occasion dressing could feel like it was made for one woman.", 4],
  ].map(([name, role, bio, sort], index) => ({
    id: uid(),
    name,
    role,
    bio,
    image_url: portraits[index],
    sort_order: Number(sort),
    is_demo: true,
  })));

  await supabase.from("glam_gallery").insert(
    shots.slice(0, 8).map((image, index) => ({
      id: uid(),
      title: `Atelier study ${index + 1}`,
      image_url: image,
      sort_order: index + 1,
      is_demo: true,
    })),
  );

  const reviewers = [
    ["Njeri Kamau", "The gown arrived finished, not almost finished. I wore it to a wedding in Karen and forgot to tug at anything.", 5],
    ["Achieng Otieno", "The blazer is the first work piece I have wanted to keep on after the meeting.", 5],
    ["Mercy Chebet", "They understood the ruracio brief without making the cloth feel like a costume.", 5],
    ["Purity Maina", "My fitting was unhurried. The hem was right the first time I stepped off the box.", 4],
    ["Linet Wambui", "Beautiful drape, honest staff, and a dress that photographed as well as it felt.", 5],
    ["Hannah Mutua", "I ordered a guest dress from Kisumu and the courier notes were as careful as the garment.", 4],
  ];
  await supabase.from("glam_reviews").insert(
    reviewers.map(([author, quote, rating], index) => ({
      id: uid(),
      product_id: productIds[index],
      author_name: author,
      quote,
      rating,
      approved: true,
      is_demo: true,
    })),
  );

  await supabase.from("glam_users").insert(
    [
      ["Amina", "Waweru", "amina.waweru@example.com", "+254 711 222 333", "CUSTOMER"],
      ["Faith", "Njeri", "faith.njeri@example.com", "+254 722 333 444", "CUSTOMER"],
      ["Wanjiku", "Aoko", "wanjiku.aoko@example.com", "+254 733 444 555", "CUSTOMER"],
      ["Lulu", "Atelier", "studio@glambylulu.co.ke", "+254 712 345 678", "SUPER_ADMIN"],
    ].map(([first, last, email, phone, role]) => ({
      id: uid(),
      first_name: first,
      last_name: last,
      email,
      phone,
      password_hash: passwordHash,
      role,
      is_demo: true,
    })),
  );

  await supabase.from("glam_settings").insert([
    ["business_name", "Glam by Lulu"],
    ["tagline", "Elegance, Made Personal."],
    ["phone", "+254 712 345 678"],
    ["whatsapp", "254712345678"],
    ["email", "hello@glambylulu.co.ke"],
    ["address", "The Oval, Westlands, Nairobi"],
    ["instagram", "https://instagram.com"],
    ["facebook", "https://facebook.com"],
    ["since", "2018"],
    ["hours_week", "9AM - 6PM"],
    ["hours_saturday", "10AM - 4PM"],
    ["hours_sunday", "By appointment"],
  ].map(([key, value]) => ({ key, value })));

  console.log("Demo catalogue seeded. Sample sign-in password: DemoPass123!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
