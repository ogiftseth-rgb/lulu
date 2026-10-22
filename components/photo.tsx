export function photoSrc(src: string, width: number) {
  try {
    const url = new URL(src);
    if (url.hostname === "images.unsplash.com") {
      url.searchParams.set("auto", "format");
      url.searchParams.set("fit", "crop");
      url.searchParams.set("q", "70");
      url.searchParams.set("w", String(width));
      return url.toString();
    }
  } catch {
    return src;
  }
  return src;
}

export function Photo({
  src,
  alt,
  priority = false,
  className = "object-cover",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  if (!src) return null;
  return (
    <img
      src={photoSrc(src, priority ? 1400 : 800)}
      alt={alt}
      className={`photo ${className}`}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
    />
  );
}
