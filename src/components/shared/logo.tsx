import Link from 'next/link';
import { Building2 } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 w-fit">
      <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary">
          <Building2 className="h-6 w-6"/>
      </div>
      <h1 className="text-xl font-bold tracking-tight">Estately</h1>
    </Link>
  );
}
