"use client";

import { Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ContactButtons() {
    return (
        <TooltipProvider>
            <div className="fixed bottom-20 right-4 z-40 flex flex-col gap-3 md:bottom-6">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button asChild size="icon" className="rounded-full h-14 w-14 bg-green-500 hover:bg-green-600 shadow-lg">
                            <Link href="https://wa.me/910000000000" target="_blank" aria-label="Chat on WhatsApp">
                                <MessageCircle className="h-7 w-7" />
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        <p>Chat on WhatsApp</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button asChild size="icon" className="rounded-full h-14 w-14 shadow-lg">
                            <Link href="tel:+910000000000" aria-label="Call us">
                                <Phone className="h-7 w-7" />
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        <p>Call Us</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    )
}
