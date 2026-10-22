import type { Metadata } from "next";
import { Photo } from "@/components/photo";
import { PageHero } from "@/components/site-footer";
import { getGallery } from "@/lib/queries";

export const metadata: Metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const images = await getGallery();
  return (
    <main>
      <PageHero title="Gallery" image={images[0]?.imageUrl ?? ""} />
      <section className="masonry">
        {images.map((image) => (
          <figure key={image.id}>
            <div className="shot">
              <Photo src={image.imageUrl} alt={image.title} sizes="(max-width: 700px) 100vw, 25vw" />
            </div>
            <figcaption>{image.title}</figcaption>
          </figure>
        ))}
      </section>
    </main>
  );
}
