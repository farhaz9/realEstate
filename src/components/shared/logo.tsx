
import Link from 'next/link';
import { Building2 } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 w-fit">
       <div className="text-center">
        <div className="text-3xl font-semibold tracking-wide text-black">
        FALCON AXE
        </div>

        <div className="mt-1 text-xs tracking-[0.4em] text-purple-700">
        HOMES
        </div>
    </div>
    </Link>
  );
}
