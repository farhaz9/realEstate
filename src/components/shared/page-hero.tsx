import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  title: string;
  subtitle: string;
  image: {
    id: string;
    imageHint: string;
  };
  children?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

export function PageHero({ title, subtitle, image, children, className, titleClassName, subtitleClassName }: PageHeroProps) {
  const heroImage = PlaceHolderImages.find((p) => p.id === image.id);

  return (
    <section className={cn("relative w-full h-auto overflow-hidden", className)}>
      <div className="relative w-full h-80 md:h-96">
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
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4 -mt-48 md:-mt-56">
        <h1 className={cn("text-4xl md:text-6xl font-bold", titleClassName)}>{title}</h1>
        <p className={cn("mt-2 text-lg max-w-3xl", subtitleClassName)}>{subtitle}</p>
        {children}
      </div>
    </section>
  );
}
