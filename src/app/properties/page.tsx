import { PropertyCard } from "@/components/property-card";
import { properties } from "@/lib/data";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ListFilter } from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";

const locations = [...new Set(properties.map(p => p.location))];
const types = [...new Set(properties.map(p => p.type))];

export default function PropertiesPage() {
  return (
    <div>
      <PageHero
        title="Luxury Properties in Delhi"
        subtitle="Browse our curated selection of high-end homes, villas, and apartments from the best real estate company in Delhi."
        image={{
          id: "properties-hero",
          imageHint: "luxury villa",
        }}
      />
      <div className="container mx-auto px-4 py-16">
        <Card className="mb-8 p-3 sm:p-4 bg-card/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 items-end">
            <div>
              <label htmlFor="location-filter" className="text-sm font-medium text-muted-foreground">Location</label>
              <Select>
                <SelectTrigger id="location-filter">
                  <SelectValue placeholder="All Localities" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="type-filter" className="text-sm font-medium text-muted-foreground">Property Type</label>
              <Select>
                <SelectTrigger id="type-filter">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  {types.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full">
              <ListFilter className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </div>
  );
}
