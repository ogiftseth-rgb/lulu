import Image from "next/image";

export function Photo({
  src,
  alt,
  priority = false,
  sizes,
  className = "object-cover",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes: string;
  className?: string;
}) {
  if (!src) return null;
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={className}
    />
  );
}
