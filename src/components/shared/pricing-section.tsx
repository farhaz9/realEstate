
'use client';

import { Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { cn } from '@/lib/utils';


const benefits = [
    'Verified Dealer Badge',
    'Property appears at Top of Search Results',
    'Higher visibility & more leads',
    'Dealer name shown prominently',
    'Trust badge increases buyer confidence',
    'Valid for 30 days',
];

export function PricingSection() {
    const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance font-bold text-3xl md:text-4xl lg:text-5xl lg:tracking-tight">
              Become a Verified Professional
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-balance text-muted-foreground text-lg">
              Gain trust, visibility, and more leads with our "Pro Verified" badge.
            </p>
            <div className="my-12">
              <div
                className="relative mx-auto grid w-fit grid-cols-2 rounded-full border bg-muted p-1"
              >
                <div
                  aria-hidden="true"
                  className={cn(
                      'pointer-events-none absolute inset-1 w-[calc(50%-4px)] rounded-full bg-primary shadow ring-1 ring-black/5 transition-transform duration-500 ease-in-out',
                      isAnnual ? "translate-x-full" : "translate-x-0"
                  )}
                />
                <button
                  className="relative duration-500 rounded-full h-8 w-24 text-sm hover:opacity-75"
                  onClick={() => setIsAnnual(false)}
                  type="button"
                >
                  <span className={cn(!isAnnual ? 'text-primary-foreground' : 'text-foreground')}>Monthly</span>
                </button>
                <button
                  className="relative duration-500 rounded-full h-8 w-24 text-sm hover:opacity-75"
                  onClick={() => setIsAnnual(true)}
                  type="button"
                >
                  <span className={cn(isAnnual ? 'text-primary-foreground' : 'text-foreground')}>Annually</span>
                </button>
              </div>
              <div className="mt-3 text-center text-xs">
                <span className="font-medium text-primary">Save 16%</span> On
                Annual Billing
              </div>
            </div>
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
              <CardTitle className="text-4xl font-extrabold">
                {isAnnual ? '₹1000' : '₹99'}
                <span className="text-lg font-medium text-muted-foreground">/{isAnnual ? 'year' : 'month'}</span>
              </CardTitle>
              <CardDescription>Get the visibility you deserve.</CardDescription>
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
