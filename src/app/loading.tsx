
export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <div className="text-center" style={{ fontFamily: "'Cinzel', serif" }}>
        <div className="text-5xl font-semibold tracking-wide text-black">
          FALCON AXE
        </div>
        <div className="mt-2 text-sm tracking-[0.6em] text-purple-700">
          H O M E S
        </div>
        <div className="mt-6 flex justify-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.32s]"></span>
          <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.16s]"></span>
          <span className="h-2 w-2 rounded-full bg-primary animate-bounce"></span>
        </div>
      </div>
    </div>
  );
}
