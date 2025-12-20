
'use client';

import { ArrowRight, Gem } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { formatPrice } from '@/lib/utils';

interface BoostReachCardProps {
    price: number;
    onPurchase: () => void;
}

export function BoostReachCard({ price, onPurchase }: BoostReachCardProps) {
    return (
        <div className="py-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold">Purchase Listing Credit</h2>
                <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
                    Purchase listing credits to post more properties.
                </p>
            </div>
             <Card className="max-w-2xl w-full mx-auto shadow-2xl shadow-primary/20 bg-gradient-to-br from-primary to-purple-500 relative overflow-hidden rounded-xl border-0">
                <CardContent className="p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <h3 className="text-2xl font-semibold">Buy a Listing Credit</h3>
                        <p className="text-white/80">Get your property seen by more potential buyers.</p>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-center gap-4">
                        <div className="text-center">
                            <span className="text-5xl font-extrabold tracking-tighter">
                                {formatPrice(price)}
                            </span>
                             <div className="text-sm font-medium">
                                per listing
                            </div>
                        </div>
                        <Button 
                            size="lg" 
                            className="w-full h-12 text-base bg-white text-primary hover:bg-white/90 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all"
                            onClick={onPurchase}
                        >
                            Purchase Now <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
