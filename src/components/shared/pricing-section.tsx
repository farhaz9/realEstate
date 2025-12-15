
'use client';

import { Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const benefits = [
    'Verified Dealer Badge',
    'Property appears at Top of Search Results',
    'Higher visibility & more leads',
    'Dealer name shown prominently',
    'Trust badge increases buyer confidence',
    'Valid for 30 days',
];

export function PricingSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Become a Verified Professional</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              Gain trust, visibility, and more leads with our "Pro Verified" badge.
            </p>
        </div>
        <div className="flex justify-center">
          <Card className="max-w-md w-full shadow-lg border-2 border-primary/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold uppercase px-4 py-1 rounded-bl-lg">
                Pro Verified
            </div>
            <CardHeader className="text-center pt-12">
              <div className="flex justify-center items-center gap-2 mb-4">
                  <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
                  <Star className="h-10 w-10 text-yellow-400 fill-yellow-400" />
                  <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
              </div>
              <CardTitle className="text-4xl font-extrabold">₹99 / month</CardTitle>
              <CardDescription>or ₹1000 annually (Save 16%)</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <span className="font-medium text-foreground/90">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button size="lg" className="w-full h-12 text-lg">
                Get Verified Now
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
