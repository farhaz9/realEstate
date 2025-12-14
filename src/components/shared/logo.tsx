
import Link from 'next/link';
import { Building2 } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 w-fit">
       <div className="text-center">
        <div className="text-xl font-semibold tracking-normal text-black">
          FALCON AXE
        </div>
        <div className="mt-0.5 text-[0.6rem] tracking-[0.3em] text-purple-700">
          H O M E S
        </div>
    </div>
    </Link>
  );
}
