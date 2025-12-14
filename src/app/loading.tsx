export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: '#0B0B0B' }}>
      <div className="text-center" style={{ fontFamily: "'Cinzel', serif", color: '#C9A24D' }}>
        <div style={{ fontSize: '48px', letterSpacing: '2px' }}>FALCON AXE</div>
        <div style={{ fontSize: '16px', letterSpacing: '10px', marginTop: '8px' }}>H O M E S</div>
        <div 
          className="mx-auto mt-5 h-[2px] w-[120px] animate-pulse-loader"
          style={{ 
            background: '#C9A24D',
          }}
        ></div>
      </div>
    </div>
  );
}
