
import Image from "next/image";
import { interiorProjects } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent } from "@/components/ui/card";
import { PageHero } from "@/components/shared/page-hero";

export default function InteriorsPage() {
  return (
    <div>
      <PageHero
        title="Interior Design"
        subtitle="Transform your house into a home with personalized interior design services from Delhi's best company. Explore our portfolio."
        image={{
          id: "interiors-hero",
          imageHint: "modern living room",
        }}
      />
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {interiorProjects.map((project) => {
            const projectImage = PlaceHolderImages.find(p => p.id === project.images[0]);
            return (
              <Card key={project.id} className="overflow-hidden group relative">
                <div className="relative h-96 w-full">
                  {projectImage && (
                    <Image
                      src={projectImage.imageUrl}
                      alt={project.title}
                      data-ai-hint={projectImage.imageHint}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2 className="text-2xl font-bold text-white">{project.title}</h2>
                  <p className="mt-2 text-sm text-neutral-300 line-clamp-2">{project.description}</p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  );
}
