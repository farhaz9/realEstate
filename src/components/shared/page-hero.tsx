import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  title: React.ReactNode;
  subtitle: string;
  image?: {
    id: string;
    imageHint: string;
  };
  imageUrl?: string;
  children?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

export function PageHero({ title, subtitle, image, imageUrl, children, className, titleClassName, subtitleClassName }: PageHeroProps) {
  const heroImage = image ? PlaceHolderImages.find((p) => p.id === image.id) : null;
  const finalImageUrl = imageUrl || heroImage?.imageUrl;

  return (
    <section className={cn("relative w-full overflow-hidden text-white", className)}>
      {finalImageUrl && (
        <Image
          src={finalImageUrl}
          alt={typeof title === 'string' ? title : 'Hero background'}
          data-ai-hint={image?.imageHint || 'hero image'}
          fill
          className="object-cover"
          priority
        />
      )}
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-20 md:py-24">
        <h1 className={cn("text-4xl md:text-6xl font-bold", titleClassName)}>{title}</h1>
        <p className={cn("mt-2 text-lg max-w-3xl", subtitleClassName)}>{subtitle}</p>
        <div className="mt-8 w-full max-w-3xl mx-auto">
          {children}
        </div>
      </div>
    </section>
  );
}
