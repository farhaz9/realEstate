import Image from "next/image";
import { interiorProjects } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function InteriorsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Best Interior Design in Delhi</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
          Transform your house into a home with personalized interior design services from Delhi's best company. Explore our portfolio.
        </p>
      </div>

      <div className="space-y-16">
        {interiorProjects.map((project) => (
          <Card key={project.id} className="overflow-hidden border-2 border-primary/20 shadow-lg shadow-primary/10">
            <div className="grid md:grid-cols-5">
              <div className="md:col-span-2 p-8 flex flex-col justify-center">
                <h2 className="text-3xl font-bold text-primary">{project.title}</h2>
                <p className="mt-4 text-muted-foreground">{project.description}</p>
              </div>
              <div className="md:col-span-3">
                <Carousel className="w-full">
                  <CarouselContent>
                    {project.images.map((imageId, index) => {
                      const image = PlaceHolderImages.find(p => p.id === imageId);
                      return (
                        <CarouselItem key={index}>
                           <div className="relative h-96 w-full">
                            {image && (
                              <Image
                                src={image.imageUrl}
                                alt={`${project.title} - Image ${index + 1}`}
                                data-ai-hint={image.imageHint}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                        </CarouselItem>
                      )
                    })}
                  </CarouselContent>
                  <CarouselPrevious className="absolute left-4" />
                  <CarouselNext className="absolute right-4" />
                </Carousel>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
