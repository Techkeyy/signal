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

  const update = (
    c?: string,
    s?: number,
    t?: string
  ) => {
    const cat = c ?? category;
    const score = s ?? minScore;
    const tr = t ?? tier;
    setCategory(cat);
    setMinScore(score);
    setTier(tr);
    onFilterChange({
      category: cat === "All" ? "" : cat,
      minScore: score,
      tier: tr === "all" ? "" : tr,
    });
  };

  return (
    <div className="sticky top-0 z-10 bg-[#080808]/95 backdrop-blur-md pb-4 mb-8 border-b border-[#1f1f1f]">
      {/* Category pills */}
      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => update(cat)}
            className={`text-[12px] px-3 py-1 rounded-full font-medium transition-all ${
              category === cat
                ? "bg-white text-black"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-[#1a1a1a]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Bottom row: score filter + refresh */}
      <div className="flex items-center gap-3">
        <select
          value={minScore}
          onChange={(e) => update(undefined, Number(e.target.value))}
          className="text-[12px] bg-[#111] text-zinc-400 border border-[#1f1f1f] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-zinc-600 appearance-none cursor-pointer"
        >
          <option value={0}>Any score</option>
          <option value={30}>30+</option>
          <option value={40}>40+</option>
          <option value={50}>50+</option>
          <option value={60}>60+</option>
        </select>

        <select
          value={tier}
          onChange={(e) => update(undefined, undefined, e.target.value)}
          className="text-[12px] bg-[#111] text-zinc-400 border border-[#1f1f1f] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-zinc-600 appearance-none cursor-pointer"
        >
          <option value="all">All tiers</option>
          <option value="strong">Strong</option>
          <option value="medium">Medium</option>
          <option value="weak">Weak</option>
        </select>

        <div className="flex-1" />

        <span className="text-[11px] text-zinc-600 tabular-nums">
          {totalIdeas} ideas
        </span>

        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="text-[12px] font-medium text-zinc-400 hover:text-white bg-[#111] hover:bg-[#1a1a1a] px-3 py-1.5 rounded-lg border border-[#1f1f1f] hover:border-[#2a2a2a] transition-all disabled:opacity-40"
        >
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>
    </div>
  );
}
