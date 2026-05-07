"use client";

import { useState, useEffect, useCallback } from "react";
import { StatsResponse, SignalIdea } from "@/lib/types";
import { fetchIdeas, fetchStats, triggerRefresh } from "@/lib/api";

/* ═══════════════════════════════════════════════════════
   Signal — MemoryMerge verbatim clone
   Every value extracted from live MemoryMerge DOM
   ═══════════════════════════════════════════════════════ */

const S = {
  maxWidth: 1160,
  navH: 61,
  // Colors (exact MemoryMerge)
  bg: "#0A0F1E",
  bgCard: "#0D1428",
  border: "#1E2D4A",
  text: "#FFFFFF",
  text2: "#8A9BB5",
  accent: "#1D6FEB",
  teal: "#00D4AA",
  purple: "#A855F7",
  // Font stacks
  font: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
  mono: `"SF Mono", "Fira Code", "JetBrains Mono", monospace`,
} as const;

export default function Home() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [ideas, setIdeas] = useState<SignalIdea[]>([]);
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadStats = useCallback(async () => {
    try { setStats(await fetchStats()); } catch {}
  }, []);

  const loadIdeas = useCallback(async () => {
    setLoading(true);
    try {
      const cat = activeTab === "All" ? "" : activeTab;
      const data = await fetchIdeas({ category: cat, limit: 30 });
      setIdeas(data.ideas);
    } catch {}
    setLoading(false);
  }, [activeTab]);

  useEffect(() => { loadStats(); loadIdeas(); }, [loadStats, loadIdeas]);

  useEffect(() => {
    const i = setInterval(() => setSecondsAgo(Math.floor((Date.now() - lastRefresh.getTime()) / 1000)), 1000);
    return () => clearInterval(i);
  }, [lastRefresh]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try { await triggerRefresh(); await loadIdeas(); await loadStats(); setLastRefresh(new Date()); setSecondsAgo(0); } catch {}
    setRefreshing(false);
  };

  const total = stats?.total_ideas ?? ideas.length;
  const catCount = stats ? Object.keys(stats.categories).length : 0;
  const avgScore = stats?.avg_signal_score ?? 0;
  const subCount = 8;

  // ── helpers ──
  const timeAgo = (d: string) => {
    try { const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000); if (s < 60) return "just now"; const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; return `${Math.floor(h / 24)}d ago`; } catch { return ""; }
  };

  type TierKey = "strong" | "medium" | "weak";
  const tierLabel: Record<TierKey, string> = { strong: "✓ strong", medium: "✓ medium", weak: "weak" };
  const tierColor: Record<TierKey, string> = { strong: "#00D4AA", medium: "#F5A623", weak: "#8A9BB5" };
  const scoreColor = (s: number) => s >= 50 ? "#00D4AA" : s >= 35 ? "#F5A623" : "#8A9BB5";

  const TAB_CATEGORIES = ["All", "DeFi / Finance", "Cross-Chain / Interoperability", "Identity / Reputation", "DAO / Governance", "Wallet / UX", "MEV / Fairness", "Data / Storage", "Payments / Remittances"];

  return (
    <div style={{ background: S.bg, color: S.text, fontFamily: S.font, minHeight: "100vh" }}>
      {/* ═══════════ NAV ═══════════ */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, height: S.navH, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", background: "rgba(10,15,30,0.92)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${S.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: S.teal, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: S.bg, fontSize: 11, fontWeight: 800 }}>S</span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.3px" }}>Signal</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a href="#overview" style={{ fontSize: 12, color: S.text2, textDecoration: "none", letterSpacing: "0.02em" }}>Overview</a>
          <a href="#how-it-works" style={{ fontSize: 12, color: S.text2, textDecoration: "none", letterSpacing: "0.02em" }}>How It Works</a>
          <a href="#explorer" style={{ fontSize: 12, color: S.text2, textDecoration: "none", letterSpacing: "0.02em" }}>Explorer</a>
          <a href="https://github.com/Techkeyy/signal" target="_blank" rel="noopener" style={{ fontSize: 12, color: S.text2, textDecoration: "none", letterSpacing: "0.02em" }}>GitHub</a>
        </div>
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <section id="overview" style={{ maxWidth: S.maxWidth, margin: "0 auto", padding: "86px 24px 54px", textAlign: "center" }}>
        {/* Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 20, background: `${S.accent}15`, border: `1px solid ${S.accent}30`, marginBottom: 26 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: S.teal }} />
          <span style={{ fontSize: 12, color: S.text2 }}>Mined from r/ethereum, r/defi, r/web3 + 5 more</span>
        </div>

        {/* Heading */}
        <h1 style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.06, letterSpacing: "-1.7px", marginBottom: 18, background: "linear-gradient(135deg, #FFFFFF 0%, #B7C4E6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Web3 hackathon ideas
          <br />
          from real complaints
        </h1>

        {/* Description */}
        <p style={{ fontSize: 18, color: S.text2, maxWidth: 640, margin: "0 auto 32px", lineHeight: 1.7 }}>
          Signal scrapes Reddit&apos;s crypto communities, detects real frustration, filters for
          global-scale problems, and generates structured project cards — each one backed by a
          real person&apos;s complaint.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => document.getElementById("explorer")?.scrollIntoView({ behavior: "smooth" })} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 9, border: "none", background: S.accent, color: "white", fontSize: 14, fontWeight: 600 }}>
            Browse Ideas
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </button>
          <button onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 9, border: `1px solid ${S.border}`, background: "transparent", color: S.text, fontSize: 14, fontWeight: 500 }}>
            How It Works
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>

        {/* Metadata cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 40 }}>
          {[
            { label: "Subreddits", value: subCount, sub: "Web3 communities" },
            { label: "Ideas Found", value: total, sub: `${stats?.tiers?.strong ?? 0} strong signal`, mono: true },
            { label: "Avg Score", value: avgScore, sub: "out of 100", accent: true },
            { label: "Categories", value: catCount, sub: "problem domains", purple: true },
          ].map((m, i) => (
            <div key={i} style={{ background: S.bgCard, border: `1px solid ${S.border}`, borderRadius: 12, padding: "18px 20px", textAlign: "left" }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: S.text2 }}>{m.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: m.accent ? "#F5A623" : m.purple ? S.purple : S.text, marginTop: 6, letterSpacing: "-0.3px", fontFamily: m.mono ? S.mono : S.font }}>{m.value}</div>
              <div style={{ fontSize: 11, color: S.text2, marginTop: 2 }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ STATUS BAR ═══════════ */}
      <section style={{ maxWidth: S.maxWidth, margin: "0 auto", padding: "0 24px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: 999, background: S.teal }} />
            <span style={{ fontSize: 12, color: S.text2 }}>Preview state · refreshed {secondsAgo}s ago</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleRefresh} disabled={refreshing} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 8, border: `1px solid ${S.border}`, background: "transparent", color: S.text2, opacity: refreshing ? 0.5 : 1 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: refreshing ? S.teal : S.text2 }} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════ WHAT IT DOES (Features) ═══════════ */}
      <section id="features" style={{ borderTop: `1px solid ${S.border}`, borderBottom: `1px solid ${S.border}`, background: S.bgCard }}>
        <div style={{ maxWidth: S.maxWidth, margin: "0 auto", padding: "72px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 46 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: S.text2 }}>What It Does</div>
            <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.8px", marginTop: 10, color: S.text }}>Built different. Built to last.</h2>
            <p style={{ fontSize: 15, color: S.text2, marginTop: 10, maxWidth: 540, margin: "10px auto 0", lineHeight: 1.7 }}>
              Signal turns Reddit complaints into infrastructure. The pipeline scrapes communities,
              detects frustration, filters noise, and generates structured project cards automatically.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {[
              { icon: "🔍", iconBg: `${S.accent}15`, iconColor: S.accent, title: "Reddit Scraping", body: "Hits Reddit's open JSON API across 8 subreddits — r/ethereum, r/ethdev, r/defi, r/web3, r/solana, r/CryptoCurrency. No API key, no rate limits, just real talk." },
              { icon: "⚡", iconBg: `${S.purple}15`, iconColor: S.purple, title: "Frustration Detection", body: "Three-tier pattern matching scans for explicit calls-to-build, complaint language, and hidden frustration. Noise filters kill testnet begging, career posts, and memes." },
              { icon: "🌍", iconBg: `#F5A62315`, iconColor: "#F5A623", title: "Global Scale Filter", body: "Every signal is checked: Does this affect users in Argentina, Nigeria, Vietnam, and Germany equally? Is it chain-agnostic? Can it work without geo-gated KYC?" },
              { icon: "💡", iconBg: `#00D4AA15`, iconColor: S.teal, title: "Idea Generation", body: "Each surviving signal becomes a complete project card: problem statement, source quote, user persona, why-Web3 reasoning, tech stack suggestion, and a tight pitch." },
            ].map((f, i) => (
              <div key={i} style={{ background: S.bgCard, border: `1px solid ${S.border}`, borderRadius: 12, padding: 24 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: f.iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, fontSize: 22 }}>{f.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8, color: S.text }}>{f.title}</div>
                <div style={{ fontSize: 13, color: S.text2, lineHeight: 1.65 }}>{f.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section id="how-it-works" style={{ maxWidth: S.maxWidth, margin: "0 auto", padding: "72px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 46 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: S.text2 }}>How It Works</div>
          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.8px", marginTop: 10, color: S.text }}>The full execution flow</h2>
          <p style={{ fontSize: 15, color: S.text2, marginTop: 10, maxWidth: 540, margin: "10px auto 0", lineHeight: 1.7 }}>
            From Reddit post to hackathon-ready idea card — every step is transparent, auditable, and repeatable.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {[
            { num: "01", agent: "Scraper", title: "Pull real conversations from Web3 communities", desc: "Signal hits Reddit JSON endpoints across 8 subreddits. Posts are fetched, deduplicated, and passed to the detection layer." },
            { num: "02", agent: "Detector", title: "Find people saying 'why can't I...' and 'someone should build...'", desc: "Three-tier pattern matching scans for explicit calls-to-build, complaint language, and hidden frustration signals." },
            { num: "03", agent: "Filter", title: "Kill ideas that only work in one country or for one person", desc: "Every signal is checked against global-scale criteria. Local problems and individual support requests are filtered out." },
            { num: "04", agent: "Generator", title: "Turn complaints into structured hackathon cards", desc: "Each surviving signal becomes a complete project card with problem statement, source quote, persona, pitch, and tech stack." },
          ].map((s, i) => (
            <div key={i} style={{ background: S.bgCard, border: `1px solid ${S.border}`, borderRadius: 12, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: S.border, letterSpacing: "-1px", lineHeight: 1 }}>{s.num}</span>
                <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: S.text2, background: `${S.accent}10`, padding: "4px 10px", borderRadius: 6 }}>{s.agent}</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8, color: S.text }}>{s.title}</div>
              <div style={{ fontSize: 13, color: S.text2, lineHeight: 1.65 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ LIVE EXPLORER ═══════════ */}
      <section id="explorer" style={{ borderTop: `1px solid ${S.border}`, background: S.bgCard }}>
        <div style={{ maxWidth: S.maxWidth, margin: "0 auto", padding: "72px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 46 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: S.text2 }}>Live Explorer</div>
            <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.8px", marginTop: 10, color: S.text }}>Complaint pipeline in real time</h2>
            <p style={{ fontSize: 15, color: S.text2, marginTop: 10, maxWidth: 540, margin: "10px auto 0", lineHeight: 1.7 }}>
              This dashboard shows ideas mined from Reddit: problem statements, source quotes, pitches, and source links.
            </p>
          </div>

          {/* Explorer status */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
            <div style={{ width: 8, height: 8, borderRadius: 999, background: S.teal }} />
            <span style={{ fontSize: 12, color: S.text2 }}>Last synced {secondsAgo}s ago</span>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
            {[
              { label: "Ideas", value: total, sub: `${stats?.tiers?.strong ?? 0} strong · ${stats?.tiers?.medium ?? 0} medium` },
              { label: "Avg Score", value: avgScore, sub: "across all ideas", accent: true },
              { label: "Subreddits", value: subCount, sub: "scanned every 6h" },
              { label: "Refresh", value: "6h", sub: "interval", teal: true },
            ].map((s, i) => (
              <div key={i} style={{ flex: "1 1 0", minWidth: 120, background: S.bgCard, border: `1px solid ${S.border}`, borderRadius: 12, padding: "18px 20px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: S.text2 }}>{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: s.accent ? "#F5A623" : s.teal ? S.teal : S.text, marginTop: 6, letterSpacing: "-0.3px" }}>{s.value}</div>
                <div style={{ fontSize: 11, color: S.text2, marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Tab switcher */}
          <div style={{ display: "flex", gap: 6, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }}>
            {TAB_CATEGORIES.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ cursor: "pointer", flexShrink: 0, padding: "6px 14px", borderRadius: 8, border: `1px solid ${activeTab === tab ? S.accent : S.border}`, background: activeTab === tab ? `${S.accent}15` : "transparent", color: activeTab === tab ? S.accent : S.text2, fontSize: 12, fontWeight: activeTab === tab ? 600 : 400 }}>
                {tab}{tab === "All" && total > 0 ? ` ${total}` : ""}
              </button>
            ))}
          </div>

          {/* Idea cards */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: S.text2, fontSize: 14 }}>Loading ideas...</div>
          ) : ideas.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: 15, color: S.text2 }}>No ideas in this category yet.</div>
              <div style={{ fontSize: 13, color: "#4A5670", marginTop: 6 }}>Try a different tab or hit refresh.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {ideas.map((idea) => {
                const tier = (idea.signal_tier || "weak") as TierKey;
                const catColorMap: Record<string, string> = { "DeFi / Finance": S.teal, "Cross-Chain / Interoperability": S.purple, "Identity / Reputation": S.accent, "DAO / Governance": "#F5A623", "Wallet / UX": "#F43F5E", "MEV / Fairness": "#EF4444", "Data / Storage": "#06B6D4", "Payments / Remittances": "#22C55E" };
                const catColor = catColorMap[idea.primary_category] || "#4A5670";
                return (
                  <div key={idea.id} style={{ background: S.bgCard, border: `1px solid ${S.border}`, borderLeft: `3px solid ${catColor}`, borderRadius: 12, padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, color: S.text2, fontFamily: S.mono }}>{idea.source_subreddit}</span>
                        <span style={{ fontSize: 10, color: "#4A5670" }}>·</span>
                        <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: tierColor[tier] }}>{tierLabel[tier]}</span>
                      </div>
                      <span style={{ fontSize: 18, fontWeight: 700, color: scoreColor(idea.signal_score), fontFamily: S.mono }}>{idea.signal_score}</span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6, color: S.text, lineHeight: 1.4 }}>{idea.problem_title}</div>
                    <div style={{ fontSize: 13, color: S.text2, lineHeight: 1.6, marginBottom: 12, fontStyle: "italic" }}>{idea.source_quote}</div>
                    <div style={{ background: `${S.accent}08`, border: `1px solid ${S.border}`, borderRadius: 8, padding: "12px 14px", marginBottom: 10 }}>
                      <div style={{ fontSize: 13, color: S.text2, lineHeight: 1.55 }}>{idea.pitch}</div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 10, color: "#4A5670" }}>{idea.user_persona}</span>
                        <span style={{ fontSize: 10, color: "#4A5670" }}>{timeAgo(idea.discovered_at)}</span>
                      </div>
                      <a href={idea.source_url} target="_blank" rel="noopener" style={{ fontSize: 11, color: S.text2, textDecoration: "none" }}>source ↗</a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer style={{ borderTop: `1px solid ${S.border}`, padding: "32px 24px" }}>
        <div style={{ maxWidth: S.maxWidth, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: S.text2, marginBottom: 4 }}>Signal</div>
            <div style={{ fontSize: 12, color: "#4A5670" }}>
              r/ethereum · r/ethdev · r/defi · r/CryptoCurrency · r/web3 · r/solana · r/ethtrader · r/solidity
            </div>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <a href="https://github.com/Techkeyy/signal" target="_blank" rel="noopener" style={{ fontSize: 12, color: S.text2, textDecoration: "none" }}>GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
