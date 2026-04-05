const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div
        className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full animate-blob-1"
        style={{
          background: "radial-gradient(circle, hsl(187 85% 43% / 0.08) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full animate-blob-2"
        style={{
          background: "radial-gradient(circle, hsl(270 91% 65% / 0.1) 0%, transparent 70%)",
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
