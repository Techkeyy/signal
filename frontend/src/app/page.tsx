"use client";

import { useState, useEffect, useCallback } from "react";
import { StatsResponse } from "@/lib/types";
import { fetchStats } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Explorer from "@/components/Explorer";

export default function Home() {
  const [stats, setStats] = useState<StatsResponse | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const s = await fetchStats();
      setStats(s);
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const scrollToExplorer = () => {
    document.getElementById("explorer")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      <Navbar />

      <Hero stats={stats} onExplore={scrollToExplorer} />

      <HowItWorks />

      <Explorer stats={stats} onStatsRefresh={loadStats} />

      {/* Footer */}
      <footer className="py-10 border-t border-[#1E2D4A]">
        <div className="max-w-5xl mx-auto px-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="overline mb-1">Signal</p>
              <p className="text-[12px] text-[#4A5670]">
                Web3 hackathon ideas from real complaints ·{" "}
                <span className="text-[#4A5670]">
                  r/ethereum r/ethdev r/defi r/CryptoCurrency r/web3 r/solana
                  r/ethtrader r/solidity
                </span>
              </p>
            </div>
            <a
              href="https://github.com/Techkeyy/signal"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] text-[#8A9BB5] hover:text-white transition-colors"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
