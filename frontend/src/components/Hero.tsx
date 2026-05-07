"use client";

interface HeroProps {
  stats: {
    total_ideas: number;
    avg_signal_score: number;
    categories: Record<string, number>;
    tiers: Record<string, number>;
  } | null;
  onExplore: () => void;
}

export default function Hero({ stats, onExplore }: HeroProps) {
  const subCount = 8;
  const catCount = stats ? Object.keys(stats.categories).length : 0;
  const avgScore = stats?.avg_signal_score ?? 0;
  const strongCount = stats?.tiers?.strong ?? 0;

  return (
    <section id="hero" className="pt-16 pb-20">
      <div className="max-w-5xl mx-auto px-5">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111] border border-[#1a1a1a] text-[11px] text-zinc-400 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Mined from r/ethereum, r/defi, r/web3 + 5 more
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-4">
          Web3 hackathon ideas
          <br />
          <span className="text-zinc-500">from real complaints</span>
        </h1>

        {/* Description */}
        <p className="text-[15px] text-zinc-400 leading-relaxed max-w-xl mb-8">
          Signal scrapes Reddit&apos;s crypto communities, detects real
          frustration, filters for global-scale problems, and generates
          structured project cards — each one backed by a real person&apos;s
          complaint.
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-3 mb-12">
          <button
            onClick={onExplore}
            className="px-4 py-2 bg-white text-black text-[13px] font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Browse Ideas
          </button>
          <button
            onClick={() =>
              document
                .getElementById("how-it-works")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="px-4 py-2 bg-[#111] text-zinc-300 text-[13px] font-medium rounded-lg border border-[#1a1a1a] hover:border-[#2e2e2e] hover:bg-[#161616] transition-all"
          >
            How It Works
          </button>
        </div>

        {/* Metadata cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-4">
            <div className="overline mb-1">Subreddits</div>
            <div className="text-2xl font-bold tabular-nums">{subCount}</div>
            <div className="text-[11px] text-zinc-600 mt-0.5">Web3 communities</div>
          </div>
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-4">
            <div className="overline mb-1">Ideas Found</div>
            <div className="text-2xl font-bold tabular-nums">
              {stats?.total_ideas ?? 0}
            </div>
            <div className="text-[11px] text-zinc-600 mt-0.5">
              {strongCount} strong signal
            </div>
          </div>
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-4">
            <div className="overline mb-1">Avg Score</div>
            <div className="text-2xl font-bold text-amber-400 tabular-nums">
              {avgScore}
            </div>
            <div className="text-[11px] text-zinc-600 mt-0.5">out of 100</div>
          </div>
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-4">
            <div className="overline mb-1">Categories</div>
            <div className="text-2xl font-bold text-violet-400 tabular-nums">
              {catCount}
            </div>
            <div className="text-[11px] text-zinc-600 mt-0.5">problem domains</div>
          </div>
        </div>
      </div>
    </section>
  );
}
