import Link from 'next/link';
import Image from 'next/image';

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2"
      aria-label="Farhaz Homes Home"
    >
      <Image
        src="https://images-r-eal-estae.vercel.app/farhaz%20homes.png"
        alt="Farhaz Homes Logo"
        width={150}
        height={40}
        className="object-cover"
        priority
      />
    </Link>
  );
}
