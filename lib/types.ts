export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
};

export type Variant = { size: string; colour: string; stock: number };
export type ProductImage = { url: string; alt: string; sortOrder: number };

export type Product = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  fabric: string;
  care: string;
  regularPrice: number;
  salePrice: number | null;
  occasion: string;
  featured: boolean;
  isNew: boolean;
  isBespoke: boolean;
  popularity: number;
  createdAt: string;
  category: { name: string; slug: string };
  images: ProductImage[];
  variants: Variant[];
};

export type CartLine = {
  id: string;
  quantity: number;
  size: string;
  colour: string;
  product: Product;
};

export type Review = {
  id: string;
  authorName: string;
  quote: string;
  rating: number;
  createdAt: string;
  productName?: string;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  author: string;
  publishedAt: string | null;
  highlights: string[];
  category: { name: string; slug: string };
};

export type HeroSlide = {
  id: string;
  heading: string;
  description: string;
  imageUrl: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string | null;
  secondaryHref: string | null;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
};

export type GalleryImage = { id: string; title: string; imageUrl: string };

export type ShopQuery = {
  category?: string;
  size?: string;
  colour?: string;
  occasion?: string;
  availability?: string;
  min?: string;
  max?: string;
  sort?: string;
  q?: string;
};
