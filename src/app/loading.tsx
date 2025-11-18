import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="animate-pulse">
        <Image
          src="https://images-r-eal-estae.vercel.app/farhaz%20homes%20widtyh.png"
          alt="Farhaz Homes Logo"
          width={200}
          height={53}
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
