// Types for the Signal API v2

export interface SignalIdea {
  id: string;
  source_url: string;
  source_subreddit: string;
  source_author: string;
  reddit_score: number;
  reddit_comments: number;
  discovered_at: string;
  frustration_score: number;
  signal_score: number;
  signal_tier: "strong" | "medium" | "weak";
  // New v2 fields
  hackathon_fit: number;
  timeliness: "hot" | "warm" | "cold";
  difficulty: "beginner" | "intermediate" | "advanced";
  categories: string[];
  primary_category: string;
  project_name: string;
  problem_title: string;
  source_quote: string;
  user_persona: string;
  elevator_pitch: string;
  judge_pitch: string;
  why_web3: string;
  why_now: string;
  tech_stack: string;
  target_chain: string;
  differentiator: string;
  traction_hook: string;
  // Legacy compat
  idea_summary: string;
  pitch: string;
}

export interface IdeasResponse {
  count: number;
  generated_at: string;
  subreddits_scanned: string[];
  ideas: SignalIdea[];
}

export interface StatsResponse {
  total_ideas: number;
  categories: Record<string, number>;
  target_chains?: Record<string, number>;
  timeliness?: Record<string, number>;
  difficulties?: Record<string, number>;
  tiers: Record<string, number>;
  avg_signal_score: number;
  avg_hackathon_fit?: number;
}
