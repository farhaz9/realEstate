import Link from 'next/link';
import { Building2 } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 w-fit">
       <div className="text-center">
        <div className="text-base font-semibold tracking-wide text-black">
          FALCON
        </div>
        <div className="text-[0.45rem] tracking-[0.2em] text-purple-700">
          H O M E S
        </div>
    </div>
    </Link>
  );
}
