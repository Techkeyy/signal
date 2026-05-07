"use client";

import { useState, useEffect, useCallback } from "react";
import { SignalIdea, StatsResponse } from "@/lib/types";
import { fetchIdeas, fetchStats, triggerRefresh } from "@/lib/api";
import IdeaCard from "@/components/IdeaCard";
import Filters from "@/components/Filters";

export default function Home() {
  const [ideas, setIdeas] = useState<SignalIdea[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (filters?: { category?: string; minScore?: number; tier?: string }) => {
      setLoading(true);
      try {
        const data = await fetchIdeas({
          category: filters?.category,
          minScore: filters?.minScore,
          tier: filters?.tier,
          limit: 30,
        });
        setIdeas(data.ideas);
      } catch {
        // Silently fail — API might not be running locally
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const loadStats = useCallback(async () => {
    try {
      const s = await fetchStats();
      setStats(s);
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    load();
    loadStats();
  }, [load, loadStats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await triggerRefresh();
      await load();
      await loadStats();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808]">
      <div className="max-w-4xl mx-auto px-5 py-8">
        {/* Hero */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <span className="text-black text-sm font-bold">S</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Signal
            </h1>
          </div>
          <p className="text-[15px] text-zinc-500 leading-relaxed max-w-lg">
            Web3 hackathon ideas mined from real complaints on Reddit.
            Every card links to a real person frustrated about a real problem.
          </p>
        </header>

        {/* Stats bar */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 mb-10">
            <div className="bg-[#111] border border-[#1f1f1f] rounded-xl px-4 py-3">
              <div className="text-[22px] font-bold text-white tabular-nums">
                {stats.total_ideas}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">
                ideas found
              </div>
            </div>
            <div className="bg-[#111] border border-[#1f1f1f] rounded-xl px-4 py-3">
              <div className="text-[22px] font-bold text-amber-400 tabular-nums">
                {stats.avg_signal_score}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">
                avg signal score
              </div>
            </div>
            <div className="bg-[#111] border border-[#1f1f1f] rounded-xl px-4 py-3">
              <div className="text-[22px] font-bold text-emerald-400 tabular-nums">
                {Object.keys(stats.categories).length}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">
                categories
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <Filters
          onFilterChange={(f) => load(f)}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          totalIdeas={stats?.total_ideas ?? ideas.length}
        />

        {/* Idea grid */}
        {loading && !refreshing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-[#111] border border-[#1f1f1f] rounded-xl p-5 animate-pulse h-48"
              />
            ))}
          </div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-zinc-500 text-[15px]">
              No ideas match these filters.
            </p>
            <p className="text-zinc-700 text-[13px] mt-1">
              Try broadening your search or hitting refresh.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ideas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-6 border-t border-[#1f1f1f] text-center">
          <p className="text-[12px] text-zinc-700">
            Signal · Data from{" "}
            <span className="text-zinc-600">
              r/ethereum r/ethdev r/defi r/CryptoCurrency r/web3 r/solana
            </span>
          </p>
        </footer>
      </div>
    </div>
  );
}
