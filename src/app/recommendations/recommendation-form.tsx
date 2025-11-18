"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getRecommendations } from "./actions";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";

const formSchema = z.object({
  priceRange: z.string().min(1, "Price range is required."),
  location: z.string().min(1, "Location is required."),
  propertyType: z.string().min(1, "Property type is required."),
  desiredAmenities: z.string().min(1, "Please list at least one amenity."),
  browsingHistory: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type RecommendationResult = { recommendations: string } | null;

export default function RecommendationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecommendationResult>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      priceRange: "",
      location: "",
      propertyType: "",
      desiredAmenities: "",
      browsingHistory: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await getRecommendations(values);
      setResult(response);
    } catch (e) {
      setError("Failed to get recommendations. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Your Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="priceRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Range</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 5 Cr - 8 Cr" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Location</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="South Delhi">South Delhi</SelectItem>
                          <SelectItem value="Central Delhi">Central Delhi</SelectItem>
                          <SelectItem value="Lutyens' Delhi">Lutyens' Delhi</SelectItem>
                          <SelectItem value="Gurgaon">Gurgaon</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a property type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Apartment">Apartment</SelectItem>
                        <SelectItem value="Villa">Villa</SelectItem>
                        <SelectItem value="Penthouse">Penthouse</SelectItem>
                        <SelectItem value="Farmhouse">Farmhouse</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="desiredAmenities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desired Amenities</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., swimming pool, gym, garden, 24/7 security" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="browsingHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Browsing History (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Viewed 3BHKs in South Delhi, searched for 'villas with pools'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Find My Property
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center p-8">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Our AI is searching for your perfect match...</p>
        </div>
      )}

      {error && (
        <Card className="mt-8 bg-destructive text-destructive-foreground">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="mr-2 h-6 w-6 text-primary" />
              Your Personalized Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none prose-p:text-foreground prose-headings:text-primary prose-strong:text-foreground">
               <pre className="whitespace-pre-wrap font-sans text-foreground bg-transparent p-0">{result.recommendations}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
