
'use client';

import { ArrowRight, CheckCircle2, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { formatPrice } from '@/lib/utils';

interface BoostReachCardProps {
    price: number;
    onPurchase: () => void;
}

const benefits = [
    'Top placement in search',
    'Verified badge on listing',
    '3x more leads',
];

export function BoostReachCard({ price, onPurchase }: BoostReachCardProps) {
    return (
        <div className="py-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold">Boost Your Reach</h2>
                <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
                    Get premium placement for your property listings.
                </p>
            </div>
             <Card className="max-w-md w-full mx-auto shadow-2xl shadow-primary/20 bg-gradient-to-br from-primary to-accent text-primary-foreground relative overflow-hidden rounded-3xl border-0">
                <CardContent className="p-8 text-center">
                     <div className="absolute top-4 right-4 bg-black/20 text-white text-xs font-bold uppercase px-3 py-1 rounded-full flex items-center gap-1 shadow-lg backdrop-blur-sm">
                        <Star className="w-3 h-3" /> PRO
                    </div>

                    <div className="mb-6 flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-black/10 backdrop-blur-sm flex items-center justify-center">
                             <div className="w-16 h-16 rounded-full bg-black/10 backdrop-blur-sm flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-white" />
                             </div>
                        </div>
                    </div>

                    <h3 className="text-xl font-semibold">Buy Listing Credit</h3>
                    <div className="my-4">
                        <span className="text-6xl font-extrabold tracking-tighter">
                            {formatPrice(price)}
                        </span>
                    </div>
                     <div className="inline-block bg-black/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full">
                        per premium listing
                    </div>

                    <ul className="space-y-4 text-left mt-8">
                        {benefits.map((benefit) => (
                            <li key={benefit} className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-300 flex-shrink-0" />
                                <span>{benefit}</span>
                            </li>
                        ))}
                    </ul>

                     <Button 
                        size="lg" 
                        className="w-full h-14 text-lg mt-8 bg-white text-primary hover:bg-white/90 rounded-xl font-bold"
                        onClick={onPurchase}
                    >
                        Purchase Credits <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>

                     <p className="text-xs text-white/70 mt-4">
                        Secure payment powered by Falcon Pay
                    </p>

                </CardContent>
            </Card>
        </div>
    );
}
