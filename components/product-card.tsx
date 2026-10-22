import Link from "next/link";
import { addToCartQuiet, toggleWishlist } from "@/app/actions";
import { Photo } from "@/components/photo";
import type { Product } from "@/lib/types";
import { kes, priceOf } from "@/lib/utils";

const tones = ["tone-ivory", "tone-champagne", "tone-rose", "tone-burgundy"];

export function ProductFigure({
  product,
  wished,
  index = 0,
  light = false,
}: {
  product: Product;
  wished: boolean;
  index?: number;
  light?: boolean;
}) {
  const variant = product.variants.find((item) => item.stock > 0) ?? product.variants[0];
  const image = product.images[0]?.url ?? "";
  const price = priceOf(product);
  return (
    <article className={light ? "piece piece-light" : "piece"}>
      <Link href={`/product/${product.slug}`} className={`piece-photo ${tones[index % tones.length]}`}>
        <span className="piece-media">
          <Photo src={image} alt={product.name} sizes="(max-width: 768px) 80vw, 22vw" />
        </span>
      </Link>
      <h3>
        <Link href={`/product/${product.slug}`}>{product.name}</Link>
      </h3>
      <p className="piece-price">
        {product.salePrice ? <s>{kes(product.regularPrice)}</s> : null} {kes(price)}
      </p>
      <div className="piece-actions">
        {variant ? (
          <form action={addToCartQuiet}>
            <input type="hidden" name="productId" value={product.id} />
            <input type="hidden" name="size" value={variant.size} />
            <input type="hidden" name="colour" value={variant.colour} />
            <input type="hidden" name="quantity" value="1" />
            <button>Add to bag</button>
          </form>
        ) : null}
        <form action={toggleWishlist}>
          <input type="hidden" name="productId" value={product.id} />
          <button>{wished ? "Saved" : "Save"}</button>
        </form>
      </div>
    </article>
  );
}
