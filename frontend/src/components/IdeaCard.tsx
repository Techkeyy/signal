"use client";

import { SignalIdea } from "@/lib/types";

const CATEGORY_COLORS: Record<string, string> = {
  "DeFi / Finance": "border-l-emerald-400",
  "Cross-Chain / Interoperability": "border-l-violet-400",
  "Identity / Reputation": "border-l-sky-400",
  "DAO / Governance": "border-l-amber-400",
  "Wallet / UX": "border-l-rose-400",
  "MEV / Fairness": "border-l-red-400",
  "Data / Storage": "border-l-cyan-400",
  "Payments / Remittances": "border-l-lime-400",
};

const TIER_STYLES: Record<string, string> = {
  strong: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  medium: "bg-amber-400/10 text-amber-300 border-amber-400/20",
  weak: "bg-zinc-400/10 text-zinc-400 border-zinc-400/20",
};

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 60 ? "#4ade80" : score >= 35 ? "#fbbf24" : "#a3a3a3";
  const r = 16;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <svg width={40} height={40} className="flex-shrink-0 opacity-80">
      <circle
        cx={20} cy={20} r={r}
        fill="none" stroke="#222" strokeWidth="2"
      />
      <circle
        cx={20} cy={20} r={r}
        fill="none" stroke={color} strokeWidth="2"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 20 20)"
      />
      <text
        x={20} y={21} textAnchor="middle" dominantBaseline="central"
        fill={color} className="text-[10px] font-bold"
      >
        {score}
      </text>
    </svg>
  );
}

export default function IdeaCard({ idea }: { idea: SignalIdea }) {
  const borderColor =
    CATEGORY_COLORS[idea.primary_category] || "border-l-zinc-600";
  const tierStyle =
    TIER_STYLES[idea.signal_tier] || TIER_STYLES.weak;

  return (
    <div
      className={`card-enter bg-[#111] border border-[#1f1f1f] border-l-2 ${borderColor} rounded-xl p-5 hover:bg-[#161616] hover:border-[#2a2a2a] transition-all duration-200`}
    >
      {/* Top row: meta + score */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="text-[11px] font-medium text-zinc-500 bg-[#1a1a1a] px-2 py-0.5 rounded-full">
            {idea.source_subreddit}
          </span>
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${tierStyle}`}
          >
            {idea.signal_tier}
          </span>
        </div>
        <ScoreRing score={idea.signal_score} />
      </div>

      {/* Title */}
      <h3 className="text-[15px] font-semibold text-zinc-100 leading-snug mb-2">
        {idea.problem_title}
      </h3>

      {/* Quote — subtle, one line */}
      <p className="text-[13px] text-zinc-500 italic leading-relaxed mb-3 line-clamp-2">
        {idea.source_quote}
      </p>

      {/* Summary — brief */}
      <p className="text-[13px] text-zinc-400 leading-relaxed mb-4 line-clamp-3">
        {idea.idea_summary}
      </p>

      {/* Pitch — the star */}
      <div className="bg-gradient-to-r from-zinc-800/30 to-transparent border border-zinc-800/30 rounded-lg px-3.5 py-2.5 mb-3">
        <p className="text-[13px] text-zinc-200 font-medium leading-snug">
          {idea.pitch}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-zinc-600 truncate max-w-[60%]">
          {idea.user_persona}
        </span>
        <div className="flex items-center gap-3 text-zinc-600">
          <span>▲{idea.reddit_score} · 💬{idea.reddit_comments}</span>
          <a
            href={idea.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            source ↗
          </a>
        </div>
      </div>
    </div>
  );
}
