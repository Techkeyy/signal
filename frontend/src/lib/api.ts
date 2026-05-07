// API client for Signal backend

import { IdeasResponse, StatsResponse } from "@/lib/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchIdeas(params?: {
  category?: string;
  minScore?: number;
  tier?: string;
  limit?: number;
  refresh?: boolean;
}): Promise<IdeasResponse> {
  const url = new URL(`${API_BASE}/api/ideas`);

  if (params?.category) url.searchParams.set("category", params.category);
  if (params?.minScore !== undefined)
    url.searchParams.set("min_score", String(params.minScore));
  if (params?.tier) url.searchParams.set("tier", params.tier);
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  if (params?.refresh) url.searchParams.set("refresh", "true");

  const res = await fetch(url.toString(), {
    next: { revalidate: 300 }, // ISR: revalidate every 5 min
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchStats(): Promise<StatsResponse> {
  const res = await fetch(`${API_BASE}/api/stats`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function triggerRefresh(): Promise<{ count: number }> {
  const res = await fetch(`${API_BASE}/api/refresh`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
