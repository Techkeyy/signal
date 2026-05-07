"use client";

export default function Navbar() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#060606]/90 backdrop-blur-xl border-b border-[#1a1a1a]">
      <div className="max-w-5xl mx-auto px-5 h-12 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => scrollTo("hero")}
            className="flex items-center gap-2 group"
          >
            <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-black text-[10px] font-bold">S</span>
            </div>
            <span className="text-[14px] font-semibold tracking-tight">
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
                className="text-[12px] text-zinc-500 hover:text-zinc-300 px-2.5 py-1 rounded-md hover:bg-[#111] transition-all"
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
          className="text-[12px] text-zinc-500 hover:text-zinc-200 transition-colors flex items-center gap-1.5"
        >
          GitHub
          <span className="text-[10px]">↗</span>
        </a>
      </div>
    </nav>
  );
}
