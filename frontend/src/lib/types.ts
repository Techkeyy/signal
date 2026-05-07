// Types for the Signal API

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
  categories: string[];
  primary_category: string;
  problem_title: string;
  source_quote: string;
  user_persona: string;
  idea_summary: string;
  why_web3: string;
  tech_stack: string;
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
  tiers: Record<string, number>;
  avg_signal_score: number;
}
