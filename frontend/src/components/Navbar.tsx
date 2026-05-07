"use client";

export default function Navbar() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0A0F1E]/95 backdrop-blur-xl border-b border-[#1E2D4A]">
      <div className="max-w-5xl mx-auto px-5 h-12 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => scrollTo("hero")}
            className="flex items-center gap-2 group"
          >
            <div className="w-6 h-6 rounded-md bg-[#00D4AA] flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-[#0A0F1E] text-[10px] font-bold">S</span>
            </div>
            <span className="text-[14px] font-semibold tracking-tight text-white">
              Signal
            </span>
          </button>

          <div className="hidden sm:flex items-center gap-1">
            {[
              ["Overview", "hero"],
              ["How It Works", "how-it-works"],
              ["Explorer", "explorer"],
            ].map(([label, id]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="text-[12px] text-[#8A9BB5] hover:text-white px-2.5 py-1 rounded-md hover:bg-[#111A33] transition-all"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <a
          href="https://github.com/Techkeyy/signal"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] text-[#8A9BB5] hover:text-white transition-colors flex items-center gap-1.5"
        >
          GitHub
          <span className="text-[10px]">↗</span>
        </a>
      </div>
    </nav>
  );
}
