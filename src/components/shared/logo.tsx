import Link from 'next/link';
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: 'default' | 'large';
  className?: string;
}

export function Logo({ size = 'default', className }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 w-fit", className)}>
       <div className="text-center">
        <div className={cn(
          "font-semibold tracking-wide text-black",
          size === 'large' ? 'text-5xl' : 'text-xl'
        )}>
          FALCON
        </div>
        <div className={cn(
          "tracking-[0.4em] text-purple-700",
          size === 'large' ? 'text-sm' : 'text-[0.5rem]'
        )}>
          ESTATES
        </div>
    </div>
    </Link>
  );
}