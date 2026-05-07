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
  const [error, setError] = useState<string | null>(null);

  const loadIdeas = useCallback(
    async (filters?: { category?: string; minScore?: number; tier?: string }) => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchIdeas({
          category: filters?.category,
          minScore: filters?.minScore,
          tier: filters?.tier,
          limit: 30,
        });
        setIdeas(data.ideas);
      } catch (e) {
        setError("Failed to load ideas. Is the API running?");
        console.error(e);
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
    } catch (e) {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    loadIdeas();
    loadStats();
  }, [loadIdeas, loadStats]);

  const handleFilter = (filters: {
    category: string;
    minScore: number;
    tier: string;
  }) => {
    loadIdeas(filters);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await triggerRefresh();
      await loadIdeas();
      await loadStats();
    } catch (e) {
      setError("Refresh failed. Try again.");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Filters
          onFilterChange={handleFilter}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          totalIdeas={stats?.total_ideas ?? ideas.length}
        />

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading && !refreshing ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-[#141414] border border-zinc-800 rounded-lg p-5 animate-pulse"
              >
                <div className="h-4 bg-zinc-800 rounded w-1/3 mb-3" />
                <div className="h-3 bg-zinc-800 rounded w-2/3 mb-2" />
                <div className="h-3 bg-zinc-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-500 text-[15px]">
              No ideas match these filters.
            </p>
            <p className="text-zinc-600 text-[13px] mt-1">
              Try broadening your search or refreshing the pipeline.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {ideas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        )}

        {/* Footer stats */}
        {stats && (
          <div className="mt-12 pt-6 border-t border-zinc-800/50">
            <div className="flex items-center gap-6 text-[11px] text-zinc-600 font-mono flex-wrap">
              <span>
                {stats.total_ideas} total ideas
              </span>
              <span>
                Avg score: {stats.avg_signal_score}/100
              </span>
              <span>
                Strong: {stats.tiers.strong} · Medium:{" "}
                {stats.tiers.medium} · Weak: {stats.tiers.weak}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {Object.entries(stats.categories)
                .slice(0, 6)
                .map(([cat, count]) => (
                  <span
                    key={cat}
                    className="text-[10px] bg-zinc-900 text-zinc-500 px-2 py-0.5 rounded"
                  >
                    {cat}: {count}
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* App footer */}
        <div className="mt-8 text-center text-[11px] text-zinc-700">
          Signal · Web3 hackathon ideas mined from real complaints ·{" "}
          <span className="text-zinc-600">
            r/ethereum r/ethdev r/defi r/CryptoCurrency r/web3 r/solana
          </span>
        </div>
      </div>
    </div>
  );
}
