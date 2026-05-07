"use client";

import { useState, useEffect, useCallback } from "react";
import { SignalIdea, StatsResponse } from "@/lib/types";
import { fetchIdeas, triggerRefresh } from "@/lib/api";
import IdeaCard from "./IdeaCard";

const CATEGORY_TABS = [
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

interface ExplorerProps {
  stats: StatsResponse | null;
  onStatsRefresh: () => void;
}

export default function Explorer({ stats, onStatsRefresh }: ExplorerProps) {
  const [ideas, setIdeas] = useState<SignalIdea[]>([]);
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [secondsAgo, setSecondsAgo] = useState(0);

  // Live timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsAgo(
        Math.floor((Date.now() - lastRefresh.getTime()) / 1000)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [lastRefresh]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const cat = activeTab === "All" ? "" : activeTab;
      const data = await fetchIdeas({ category: cat, limit: 30 });
      setIdeas(data.ideas);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await triggerRefresh();
      await load();
      onStatsRefresh();
      setLastRefresh(new Date());
      setSecondsAgo(0);
    } finally {
      setRefreshing(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const total = stats?.total_ideas ?? ideas.length;
  const strong = stats?.tiers?.strong ?? 0;
  const medium = stats?.tiers?.medium ?? 0;
  const avgScore = stats?.avg_signal_score ?? 0;

  return (
    <section id="explorer" className="py-20 border-t border-[#1a1a1a]">
      <div className="max-w-5xl mx-auto px-5">
        <div className="overline mb-3">Live Explorer</div>
        <h2 className="text-2xl font-bold tracking-tight mb-3">
          Complaint pipeline in real time
        </h2>
        <p className="text-[14px] text-zinc-500 max-w-lg mb-6">
          Every idea links to a real Reddit post. Data refreshes every 6 hours
          automatically.
        </p>

        {/* Status bar */}
        <div className="flex items-center gap-3 mb-6 text-[12px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Last synced {secondsAgo}s ago
          </span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-40"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg px-4 py-3">
            <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-0.5">
              Ideas
            </div>
            <div className="text-xl font-bold tabular-nums">{total}</div>
            <div className="text-[10px] text-zinc-600 mt-0.5">
              {strong} strong · {medium} medium
            </div>
          </div>
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg px-4 py-3">
            <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-0.5">
              Avg Score
            </div>
            <div className="text-xl font-bold text-amber-400 tabular-nums">
              {avgScore}
            </div>
            <div className="text-[10px] text-zinc-600 mt-0.5">out of 100</div>
          </div>
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg px-4 py-3">
            <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-0.5">
              Subreddits
            </div>
            <div className="text-xl font-bold tabular-nums">8</div>
            <div className="text-[10px] text-zinc-600 mt-0.5">scanned</div>
          </div>
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg px-4 py-3">
            <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-0.5">
              Refresh
            </div>
            <div className="text-xl font-bold tabular-nums text-emerald-400">
              6h
            </div>
            <div className="text-[10px] text-zinc-600 mt-0.5">interval</div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`text-[12px] px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "bg-white text-black"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-[#111]"
              }`}
            >
              {tab}
              {tab === "All" && total > 0 && (
                <span className="ml-1.5 text-[10px] opacity-60">{total}</span>
              )}
            </button>
          ))}
        </div>

        {/* Idea cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-5 animate-pulse h-40"
              />
            ))}
          </div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-500 text-[14px]">
              No ideas in this category yet.
            </p>
            <p className="text-zinc-700 text-[12px] mt-1">
              Try a different tab or hit refresh.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ideas.map((idea, i) => (
              <div
                key={idea.id}
                className={`animate-in stagger-${Math.min(i + 1, 6)}`}
              >
                <IdeaCard idea={idea} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
