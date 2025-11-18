import Link from 'next/link';
import { cn } from '@/lib/utils';
import { belleza } from '@/app/fonts';

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2"
      aria-label="Farhaz Homes Home"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-7 w-7 text-primary"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
      <span
        className={cn(
          'text-xl font-bold tracking-tight text-foreground',
          belleza.className
        )}
      >
        FARHAZ HOMES
      </span>
    </Link>
  );
}
