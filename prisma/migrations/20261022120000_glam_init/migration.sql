-- Glam by Lulu tables. Prefixed so existing public tables are left alone.

DO $$ BEGIN
  CREATE TYPE public.glam_role AS ENUM (
    'CUSTOMER',
    'SUPER_ADMIN',
    'STORE_MANAGER',
    'SALES_STAFF',
    'CONTENT_MANAGER',
    'FINANCE_MANAGER'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.glam_users (
  id text PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  password_hash text NOT NULL,
  role public.glam_role NOT NULL DEFAULT 'CUSTOMER',
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.glam_sessions (
  id text PRIMARY KEY,
  token text NOT NULL UNIQUE,
  user_id text NOT NULL REFERENCES public.glam_users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.glam_categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  image_url text NOT NULL,
  sort_order int NOT NULL,
  is_demo boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.glam_products (
  id text PRIMARY KEY,
  sku text NOT NULL UNIQUE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  fabric text NOT NULL,
  care text NOT NULL,
  regular_price int NOT NULL,
  sale_price int,
  category_id text NOT NULL REFERENCES public.glam_categories(id),
  occasion text NOT NULL,
  featured boolean NOT NULL DEFAULT false,
  is_new boolean NOT NULL DEFAULT false,
  is_bespoke boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'published',
  popularity int NOT NULL DEFAULT 0,
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.glam_product_images (
  id text PRIMARY KEY,
  product_id text NOT NULL REFERENCES public.glam_products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt text NOT NULL,
  sort_order int NOT NULL
);

CREATE TABLE IF NOT EXISTS public.glam_product_variants (
  id text PRIMARY KEY,
  product_id text NOT NULL REFERENCES public.glam_products(id) ON DELETE CASCADE,
  size text NOT NULL,
  colour text NOT NULL,
  stock int NOT NULL,
  UNIQUE (product_id, size, colour)
);

CREATE TABLE IF NOT EXISTS public.glam_reviews (
  id text PRIMARY KEY,
  product_id text REFERENCES public.glam_products(id) ON DELETE SET NULL,
  user_id text REFERENCES public.glam_users(id) ON DELETE SET NULL,
  author_name text NOT NULL,
  quote text NOT NULL,
  rating int NOT NULL,
  approved boolean NOT NULL DEFAULT false,
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.glam_carts (
  id text PRIMARY KEY,
  user_id text UNIQUE REFERENCES public.glam_users(id) ON DELETE CASCADE,
  session_id text UNIQUE,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.glam_cart_items (
  id text PRIMARY KEY,
  cart_id text NOT NULL REFERENCES public.glam_carts(id) ON DELETE CASCADE,
  product_id text NOT NULL REFERENCES public.glam_products(id),
  size text NOT NULL,
  colour text NOT NULL,
  quantity int NOT NULL,
  UNIQUE (cart_id, product_id, size, colour)
);

CREATE TABLE IF NOT EXISTS public.glam_wishlist_items (
  id text PRIMARY KEY,
  user_id text REFERENCES public.glam_users(id) ON DELETE CASCADE,
  session_id text,
  product_id text NOT NULL REFERENCES public.glam_products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS glam_wishlist_session_product
  ON public.glam_wishlist_items (session_id, product_id)
  WHERE session_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS glam_wishlist_user_product
  ON public.glam_wishlist_items (user_id, product_id)
  WHERE user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.glam_hero_slides (
  id text PRIMARY KEY,
  heading text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  primary_label text NOT NULL,
  primary_href text NOT NULL,
  secondary_label text,
  secondary_href text,
  sort_order int NOT NULL,
  active boolean NOT NULL DEFAULT true,
  is_demo boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.glam_page_content (
  id text PRIMARY KEY,
  key text NOT NULL UNIQUE,
  title text NOT NULL,
  body text NOT NULL,
  image_url text,
  is_demo boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.glam_blog_categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.glam_blog_posts (
  id text PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text NOT NULL,
  content text NOT NULL,
  image_url text NOT NULL,
  author text NOT NULL,
  category_id text NOT NULL REFERENCES public.glam_blog_categories(id),
  published_at timestamptz,
  highlights text[] NOT NULL DEFAULT '{}',
  is_demo boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.glam_gallery (
  id text PRIMARY KEY,
  title text NOT NULL,
  image_url text NOT NULL,
  sort_order int NOT NULL,
  is_demo boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.glam_team (
  id text PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL,
  bio text NOT NULL,
  image_url text NOT NULL,
  sort_order int NOT NULL,
  is_demo boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.glam_enquiries (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.glam_subscribers (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.glam_bespoke_requests (
  id text PRIMARY KEY,
  user_id text REFERENCES public.glam_users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  outfit_type text NOT NULL,
  occasion text NOT NULL,
  event_date text NOT NULL,
  colours text NOT NULL,
  budget text NOT NULL,
  measurements text,
  notes text,
  status text NOT NULL DEFAULT 'New Request',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.glam_settings (
  key text PRIMARY KEY,
  value text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.glam_orders (
  id text PRIMARY KEY,
  number text NOT NULL UNIQUE,
  user_id text REFERENCES public.glam_users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  county text NOT NULL,
  town text NOT NULL,
  address text NOT NULL,
  notes text,
  delivery_method text NOT NULL,
  payment_method text NOT NULL DEFAULT 'mpesa_pending',
  status text NOT NULL DEFAULT 'pending_payment',
  subtotal int NOT NULL,
  delivery_fee int NOT NULL,
  total int NOT NULL,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.glam_order_items (
  id text PRIMARY KEY,
  order_id text NOT NULL REFERENCES public.glam_orders(id) ON DELETE CASCADE,
  product_id text NOT NULL REFERENCES public.glam_products(id),
  name text NOT NULL,
  size text NOT NULL,
  colour text NOT NULL,
  quantity int NOT NULL,
  unit_price int NOT NULL
);

ALTER TABLE public.glam_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glam_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glam_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glam_product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glam_product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glam_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glam_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glam_cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glam_wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glam_hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glam_page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glam_blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glam_blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glam_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glam_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glam_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glam_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glam_bespoke_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glam_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glam_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glam_order_items ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE
  public.glam_users,
  public.glam_sessions,
  public.glam_categories,
  public.glam_products,
  public.glam_product_images,
  public.glam_product_variants,
  public.glam_reviews,
  public.glam_carts,
  public.glam_cart_items,
  public.glam_wishlist_items,
  public.glam_hero_slides,
  public.glam_page_content,
  public.glam_blog_categories,
  public.glam_blog_posts,
  public.glam_gallery,
  public.glam_team,
  public.glam_enquiries,
  public.glam_subscribers,
  public.glam_bespoke_requests,
  public.glam_settings,
  public.glam_orders,
  public.glam_order_items
TO service_role;

NOTIFY pgrst, 'reload schema';
