"use client";

import { SignalIdea } from "@/lib/types";

const CATEGORY_COLORS: Record<string, string> = {
  "DeFi / Finance": "border-l-[#00D4AA]",
  "Cross-Chain / Interoperability": "border-l-[#A855F7]",
  "Identity / Reputation": "border-l-[#1D6FEB]",
  "DAO / Governance": "border-l-[#F5A623]",
  "Wallet / UX": "border-l-[#F43F5E]",
  "MEV / Fairness": "border-l-[#EF4444]",
  "Data / Storage": "border-l-[#06B6D4]",
  "Payments / Remittances": "border-l-[#22C55E]",
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

function TimelinessBadge({ tl }: { tl: string }) {
  const colors: Record<string, string> = {
    hot: "bg-red-500/10 text-red-400 border-red-500/20",
    warm: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    cold: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };
  return (
    <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${colors[tl] || colors.warm}`}>
      {tl === "hot" ? "🔥 hot" : tl === "warm" ? "warm" : "cold"}
    </span>
  );
}

export default function IdeaCard({ idea }: { idea: SignalIdea }) {
  const borderColor =
    CATEGORY_COLORS[idea.primary_category] || "border-l-[#4A5670]";

  const scoreColor =
    idea.signal_score >= 50
      ? "text-[#00D4AA]"
      : idea.signal_score >= 35
        ? "text-[#F5A623]"
        : "text-[#4A5670]";

  const tierChecked =
    idea.signal_tier === "strong"
      ? "✓ strong"
      : idea.signal_tier === "medium"
        ? "✓ medium"
        : "weak";

  const hasV2 = !!idea.project_name;

  return (
    <div
      className={`bg-[#0D1428] border border-[#1E2D4A] border-l-2 ${borderColor} rounded-xl p-4 hover:bg-[#111A33] hover:border-[#253556] transition-all group`}
    >
      {/* Top bar: subreddit, tier, score, timeliness */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] font-medium text-[#8A9BB5] truncate">
            {idea.source_subreddit}
          </span>
          <span className="text-[10px] text-[#4A5670]">·</span>
          <span className="text-[10px] text-[#4A5670]">{tierChecked}</span>
          {hasV2 && (
            <>
              <span className="text-[10px] text-[#4A5670]">·</span>
              <TimelinessBadge tl={idea.timeliness} />
            </>
          )}
        </div>
        <span className={`text-[13px] font-bold tabular-nums ${scoreColor}`}>
          {idea.signal_score}
        </span>
      </div>

      {/* Project name (v2) or title */}
      {hasV2 ? (
        <h3 className="text-[14px] font-semibold text-white leading-snug mb-0.5">
          {idea.project_name}
        </h3>
      ) : null}
      <p className={`text-[12px] text-[#8A9BB5] leading-snug ${hasV2 ? "mb-1.5" : "mb-0.5"}`}>
        {idea.problem_title}
      </p>

      {/* Quote */}
      <p className="text-[12px] text-[#8A9BB5] italic leading-relaxed mb-3 line-clamp-2">
        {idea.source_quote}
      </p>

      {/* Pitch (v2: elevator pitch) */}
      <div className="bg-[#111A33] border border-[#1E2D4A] rounded-lg px-3 py-2 mb-2">
        <p className="text-[12px] text-[#8A9BB5] leading-relaxed">
          {idea.elevator_pitch || idea.pitch}
        </p>
      </div>

      {/* v2: metadata chips */}
      {hasV2 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          {idea.target_chain && (
            <span className="text-[9px] font-medium text-[#8A9BB5] bg-[#0A0F1E] border border-[#1E2D4A] rounded px-1.5 py-0.5">
              {idea.target_chain}
            </span>
          )}
          {idea.difficulty && (
            <span className="text-[9px] font-medium text-[#8A9BB5] bg-[#0A0F1E] border border-[#1E2D4A] rounded px-1.5 py-0.5">
              {idea.difficulty}
            </span>
          )}
          {idea.hackathon_fit != null && (
            <span className="text-[9px] font-medium text-[#8A9BB5] bg-[#0A0F1E] border border-[#1E2D4A] rounded px-1.5 py-0.5">
              🏗 {idea.hackathon_fit}/10 hackathon
            </span>
          )}
          {idea.tech_stack && (
            <span className="text-[9px] font-medium text-[#4A5670] truncate max-w-[200px]">
              {idea.tech_stack}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[#4A5670] truncate max-w-[55%]">
          {idea.user_persona}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#4A5670]">
            {timeAgo(idea.discovered_at)}
          </span>
          <a
            href={idea.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-[#8A9BB5] hover:text-white transition-colors"
          >
            source ↗
          </a>
        </div>
      </div>
    </div>
  );
}
