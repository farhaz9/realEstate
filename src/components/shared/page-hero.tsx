import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

interface PageHeroProps {
  title: string;
  subtitle: string;
  image: {
    id: string;
    imageHint: string;
  };
}

export function PageHero({ title, subtitle, image }: PageHeroProps) {
  const heroImage = PlaceHolderImages.find((p) => p.id === image.id);

  return (
    <section className="relative w-full h-64 md:h-80">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          data-ai-hint={image.imageHint}
          fill
          className="object-cover"
          priority
        />
      )}
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
        <h1 className="text-4xl md:text-5xl font-bold">{title}</h1>
        <p className="mt-2 text-lg max-w-3xl">{subtitle}</p>
      </div>
    </section>
  );
}
