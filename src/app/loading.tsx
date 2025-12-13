import { Spinner } from "@/components/ui/spinner-1";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Spinner size={48} />
    </div>
  );
}
