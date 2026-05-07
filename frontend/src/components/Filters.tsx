"use client";

import { useState } from "react";

const CATEGORIES = [
  "All",
  "DeFi / Finance",
  "Cross-Chain / Interoperability",
  "Identity / Reputation",
  "DAO / Governance",
  "Wallet / UX",
  "MEV / Fairness",
  "Data / Storage",
  "Payments / Remittances",
  "General / Uncategorized",
];

interface FiltersProps {
  onFilterChange: (filters: {
    category: string;
    minScore: number;
    tier: string;
  }) => void;
  onRefresh: () => void;
  refreshing: boolean;
  totalIdeas: number;
}

export default function Filters({
  onFilterChange,
  onRefresh,
  refreshing,
  totalIdeas,
}: FiltersProps) {
  const [category, setCategory] = useState("All");
  const [minScore, setMinScore] = useState(0);
  const [tier, setTier] = useState("all");

  const handleChange = (
    newCategory?: string,
    newScore?: number,
    newTier?: string
  ) => {
    const c = newCategory ?? category;
    const s = newScore ?? minScore;
    const t = newTier ?? tier;
    setCategory(c);
    setMinScore(s);
    setTier(t);
    onFilterChange({ category: c === "All" ? "" : c, minScore: s, tier: t === "all" ? "" : t });
  };

  return (
    <div className="sticky top-0 z-10 bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-zinc-800/50 pb-4 mb-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-white tracking-tight">
            Signal
          </h1>
          <span className="text-[11px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded">
            {totalIdeas} ideas
          </span>
        </div>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="text-[12px] font-medium text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 rounded-md border border-zinc-800 hover:border-zinc-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {refreshing ? "↻ Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Category pills */}
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleChange(cat)}
              className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-all ${
                category === cat
                  ? "bg-white text-black"
                  : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-zinc-800 hidden sm:block" />

        {/* Score filter */}
        <select
          value={minScore}
          onChange={(e) => handleChange(undefined, Number(e.target.value))}
          className="text-[11px] bg-zinc-900 text-zinc-400 border border-zinc-800 rounded-md px-2 py-1 focus:outline-none focus:border-zinc-600"
        >
          <option value={0}>Any score</option>
          <option value={30}>30+</option>
          <option value={40}>40+</option>
          <option value={50}>50+</option>
          <option value={60}>60+</option>
        </select>

        {/* Tier filter */}
        <select
          value={tier}
          onChange={(e) => handleChange(undefined, undefined, e.target.value)}
          className="text-[11px] bg-zinc-900 text-zinc-400 border border-zinc-800 rounded-md px-2 py-1 focus:outline-none focus:border-zinc-600"
        >
          <option value="all">All tiers</option>
          <option value="strong">Strong</option>
          <option value="medium">Medium</option>
          <option value="weak">Weak</option>
        </select>
      </div>
    </div>
  );
}
