"use client";

const STEPS = [
  {
    num: "01",
    label: "Reddit Scraping",
    title: "Pull real conversations from Web3 communities",
    desc: "Signal hits Reddit's open JSON API across 8 subreddits — r/ethereum, r/ethdev, r/defi, r/web3, r/solana, r/CryptoCurrency, and more. No API key, no rate limits, just real talk.",
  },
  {
    num: "02",
    label: "Frustration Detection",
    title: "Find people saying 'why can't I...' and 'someone should build...'",
    desc: "Three-tier pattern matching scans for explicit calls-to-build, complaint language, and hidden frustration. Noise filters kill testnet begging, career posts, and memes.",
  },
  {
    num: "03",
    label: "Global Scale Filter",
    title: "Kill ideas that only work in one country or for one person",
    desc: "Every signal is checked: Does this affect users in Argentina, Nigeria, Vietnam, and Germany equally? Is it chain-agnostic? Can it work without geo-gated KYC?",
  },
  {
    num: "04",
    label: "Idea Generation",
    title: "Turn complaints into structured hackathon cards",
    desc: "Each surviving signal becomes a complete project card: problem statement, source quote, user persona, why-Web3 reasoning, tech stack suggestion, and a tight pitch.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 border-t border-[#1E2D4A]">
      <div className="max-w-5xl mx-auto px-5">
        <div className="overline mb-3">How It Works</div>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-3">
          The full pipeline
        </h2>
        <p className="text-[14px] text-[#8A9BB5] max-w-lg mb-12">
          From Reddit post to hackathon-ready idea card — every step is
          transparent and repeatable.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="relative bg-[#0D1428] border border-[#1E2D4A] rounded-xl p-5 hover:border-[#253556] transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[32px] font-bold text-[#1E2D4A] group-hover:text-[#253556] transition-colors tabular-nums leading-none">
                  {step.num}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#4A5670] bg-[#111A33] px-2 py-0.5 rounded">
                  {step.label}
                </span>
              </div>
              <h3 className="text-[14px] font-semibold text-white mb-1.5">
                {step.title}
              </h3>
              <p className="text-[12px] text-[#8A9BB5] leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
