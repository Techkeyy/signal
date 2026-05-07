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

function timeAgo(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  } catch {
    return "";
  }
}

export default function IdeaCard({ idea }: { idea: SignalIdea }) {
  const borderColor =
    CATEGORY_COLORS[idea.primary_category] || "border-l-zinc-600";

  const scoreColor =
    idea.signal_score >= 50
      ? "text-emerald-400"
      : idea.signal_score >= 35
        ? "text-amber-400"
        : "text-zinc-500";

  const tierChecked =
    idea.signal_tier === "strong"
      ? "✓ strong"
      : idea.signal_tier === "medium"
        ? "✓ medium"
        : "weak";

  return (
    <div
      className={`bg-[#0d0d0d] border border-[#1a1a1a] border-l-2 ${borderColor} rounded-xl p-4 hover:bg-[#111] hover:border-[#222] transition-all group`}
    >
      {/* Header: source + score */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] font-medium text-zinc-500 truncate">
            {idea.source_subreddit}
          </span>
          <span className="text-[10px] text-zinc-600">·</span>
          <span className="text-[10px] text-zinc-600">{tierChecked}</span>
        </div>
        <span className={`text-[13px] font-bold tabular-nums ${scoreColor}`}>
          {idea.signal_score}%
        </span>
      </div>

      {/* Title */}
      <h3 className="text-[14px] font-semibold text-zinc-100 leading-snug mb-1.5">
        {idea.problem_title}
      </h3>

      {/* Quote — one line */}
      <p className="text-[12px] text-zinc-500 italic leading-relaxed mb-3 line-clamp-2">
        {idea.source_quote}
      </p>

      {/* Pitch */}
      <div className="bg-[#111] border border-[#1a1a1a] rounded-lg px-3 py-2 mb-3">
        <p className="text-[12px] text-zinc-300 leading-relaxed">
          {idea.pitch}
        </p>
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-zinc-600 truncate max-w-[55%]">
          {idea.user_persona}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-600">
            {timeAgo(idea.discovered_at)}
          </span>
          <a
            href={idea.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-zinc-600 hover:text-zinc-300 transition-colors"
          >
            source ↗
          </a>
        </div>
      </div>
    </div>
  );
}
