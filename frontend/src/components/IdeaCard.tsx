"use client";

import { SignalIdea } from "@/lib/types";

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    strong: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    weak: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  };
  return (
    <span
      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
        colors[tier] || colors.weak
      }`}
    >
      {tier}
    </span>
  );
}

function ScoreRing({ score, size = 48 }: { score: number; size?: number }) {
  const color =
    score >= 60 ? "#10b981" : score >= 35 ? "#f59e0b" : "#71717a";
  const circumference = 2 * Math.PI * (size / 2 - 4);
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - 4}
        fill="none"
        stroke="#27272a"
        strokeWidth="3"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - 4}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        className="text-[11px] font-bold"
        fill="white"
      >
        {score}
      </text>
    </svg>
  );
}

export default function IdeaCard({ idea }: { idea: SignalIdea }) {
  const catColorMap: Record<string, string> = {
    "DeFi / Finance": "border-l-emerald-500",
    "Cross-Chain / Interoperability": "border-l-violet-500",
    "Identity / Reputation": "border-l-blue-500",
    "DAO / Governance": "border-l-amber-500",
    "Wallet / UX": "border-l-rose-500",
    "MEV / Fairness": "border-l-red-500",
    "Data / Storage": "border-l-cyan-500",
    "Payments / Remittances": "border-l-green-500",
  };

  const borderColor =
    catColorMap[idea.primary_category] || "border-l-zinc-600";

  return (
    <div
      className={`bg-[#141414] border border-zinc-800 border-l-2 ${borderColor} rounded-lg p-5 hover:border-zinc-700 hover:bg-[#181818] transition-colors group`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono text-zinc-500">
              {idea.source_subreddit}
            </span>
            <TierBadge tier={idea.signal_tier} />
          </div>
          <h3 className="text-[15px] font-semibold text-white leading-snug group-hover:text-zinc-100">
            {idea.problem_title}
          </h3>
        </div>
        <ScoreRing score={idea.signal_score} />
      </div>

      {/* Quote */}
      <blockquote className="text-[13px] text-zinc-400 italic border-l-2 border-zinc-800 pl-3 my-3 leading-relaxed">
        {idea.source_quote}
      </blockquote>

      {/* Meta row */}
      <div className="flex items-center gap-4 text-[11px] text-zinc-500 font-mono mb-3">
        <span>
          ▲ {idea.reddit_score} · 💬 {idea.reddit_comments}
        </span>
        <span className="text-zinc-600">by u/{idea.source_author}</span>
      </div>

      {/* Summary */}
      <p className="text-[13px] text-zinc-300 leading-relaxed mb-3">
        {idea.idea_summary}
      </p>

      {/* Why Web3 */}
      <div className="bg-zinc-900/50 rounded-md p-3 mb-3 border border-zinc-800/50">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1 block">
          Why Web3
        </span>
        <p className="text-[12px] text-zinc-400 leading-relaxed">
          {idea.why_web3.length > 200
            ? idea.why_web3.slice(0, 200) + "..."
            : idea.why_web3}
        </p>
      </div>

      {/* Tags + Stack */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {idea.categories.map((cat) => (
          <span
            key={cat}
            className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium"
          >
            {cat}
          </span>
        ))}
      </div>
      <div className="text-[11px] text-zinc-600 font-mono mb-3">
        Stack: {idea.tech_stack}
      </div>

      {/* Pitch */}
      <div className="bg-gradient-to-r from-zinc-900 to-transparent rounded-md p-3 border border-zinc-800/30">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1 block">
          Pitch
        </span>
        <p className="text-[13px] text-zinc-200 font-medium leading-snug">
          {idea.pitch}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800/50">
        <span className="text-[10px] text-zinc-600 font-mono">
          {idea.user_persona}
        </span>
        <a
          href={idea.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors font-medium flex items-center gap-1"
        >
          View source ↗
        </a>
      </div>
    </div>
  );
}
