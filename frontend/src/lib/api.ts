// API client for Signal backend

import { IdeasResponse, StatsResponse, SignalIdea } from "@/lib/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function tryBackend<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) return res.json();
  } catch {}
  return null;
}

async function loadCachedIdeas(): Promise<SignalIdea[]> {
  try {
    const res = await fetch("/data/ideas.json");
    if (res.ok) return res.json();
  } catch {}
  return [];
}

export async function fetchIdeas(params?: {
  category?: string;
  minScore?: number;
  tier?: string;
  limit?: number;
  refresh?: boolean;
}): Promise<IdeasResponse & { cached?: boolean }> {
  // Try live backend first
  const url = new URL(`${API_BASE}/api/ideas`);
  if (params?.category) url.searchParams.set("category", params.category);
  if (params?.minScore !== undefined) url.searchParams.set("min_score", String(params.minScore));
  if (params?.tier) url.searchParams.set("tier", params.tier);
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  if (params?.refresh) url.searchParams.set("refresh", "true");

  const live = await tryBackend<unknown>(url.pathname + url.search);
  if (live) return live as IdeasResponse;

  // Fallback to cached data
  let ideas = await loadCachedIdeas();
  if (params?.category) ideas = ideas.filter((i) => i.categories?.includes(params.category!));
  if (params?.minScore) ideas = ideas.filter((i) => i.signal_score >= params.minScore!);
  if (params?.tier) ideas = ideas.filter((i) => i.signal_tier === params.tier);
  if (params?.limit) ideas = ideas.slice(0, params.limit);

  return {
    count: ideas.length,
    generated_at: "",
    subreddits_scanned: [],
    ideas,
    cached: true,
  };
}

export async function fetchStats(): Promise<StatsResponse & { cached?: boolean }> {
  const live = await tryBackend<StatsResponse>("/api/stats");
  if (live) return live;

  // Fallback: compute stats from cached ideas
  const ideas = await loadCachedIdeas();
  const categories: Record<string, number> = {};
  const tiers = { strong: 0, medium: 0, weak: 0 };
  for (const i of ideas) {
    for (const c of i.categories || []) categories[c] = (categories[c] || 0) + 1;
    tiers[i.signal_tier as keyof typeof tiers]++;
  }
  return {
    total_ideas: ideas.length,
    categories,
    tiers,
    avg_signal_score: ideas.length
      ? Math.round((ideas.reduce((s, i) => s + i.signal_score, 0) / ideas.length) * 10) / 10
      : 0,
    cached: true,
  };
}

export async function triggerRefresh(): Promise<{ count: number }> {
  const live = await tryBackend<{ count: number }>("/api/refresh");
  if (live) return live;
  return { count: 0 };
}
