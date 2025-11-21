import Image from "next/image";
import { builders } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building } from "lucide-react";

export default function BuildersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Our Esteemed Builder Partners in Delhi</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
          We collaborate with Delhi's finest real estate builders to deliver homes of exceptional quality and design.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {builders.map((builder) => {
          const builderImage = PlaceHolderImages.find(p => p.id === builder.logo);
          return (
            <Card key={builder.id} className="text-center flex flex-col items-center p-6 hover:bg-secondary/50 transition-colors">
              <CardHeader>
                {builderImage && (
                  <div className="h-20 flex items-center justify-center mb-4">
                    <Image
                      src={builderImage.imageUrl}
                      alt={builder.name}
                      data-ai-hint={builderImage.imageHint}
                      width={150}
                      height={75}
                      className="object-contain"
                    />
                  </div>
                )}
                <CardTitle>{builder.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{builder.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
