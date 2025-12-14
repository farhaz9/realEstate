export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <div className="text-center" style={{ fontFamily: "'Cinzel', serif" }}>
        <div className="text-5xl text-black" style={{ letterSpacing: '2px' }}>
          FALCON AXE
        </div>
        <div className="text-base text-primary mt-1.5" style={{ letterSpacing: '10px' }}>
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
