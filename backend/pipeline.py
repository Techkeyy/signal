"""
Signal Pipeline — Reddit scraper + frustration detection engine.
Uses Reddit's free .json API — no auth, no rate limits for read-only access.
"""

import requests
import re
import time
from datetime import datetime
from typing import Optional

# ─── Configuration ──────────────────────────────────────────────

SUBREDDITS = [
    "ethereum",
    "ethdev",
    "defi",
    "CryptoCurrency",
    "web3",
    "ethtrader",
    "solana",
    "solidity",
]

USER_AGENT = "signal-idea-miner/0.1 (by /u/signal_bot)"

REQUEST_DELAY = 2  # seconds between subreddit requests (be polite)

POST_LIMIT = 25  # posts per subreddit

# ─── Frustration Patterns ──────────────────────────────────────

# Tier 1: Explicit "I wish this existed" language — highest signal
FRUSTRATION_EXPLICIT = [
    r"(?i)why (can'?t|isn'?t there) (I|we|you|someone) ",
    r"(?i)someone (needs to|should) build",
    r"(?i)there'?s (no|not a) (way|tool|app|dapp|protocol) to",
    r"(?i)how (do|can) (you|I|we) (guys )?(deal with|handle|solve|fix)",
    r"(?i)(I|we) (really |desperately )?need (a|an) ",
    r"(?i)(this|it) (should|needs to) (be|exist|work)",
    r"(?i)(I|we) (just |)want (to |a )",
    r"(?i)wish (there was|I could|we had|someone would)",
]

# Tier 2: Complaint language — medium signal
FRUSTRATION_COMPLAINT = [
    r"(?i)(I|we) (hate|can'?t stand|am so tired of) ",
    r"(?i)this is (so |really |incredibly |)frustrating",
    r"(?i)(it'?s|this is) (so |really |)(broken|terrible|awful|unusable)",
    r"(?i)(the|this) (UX|user experience|experience) (is |)(awful|terrible|bad)",
    r"(?i)(I|we) (just |)(lost|lose) .*(because|due to|thanks to)",
    r"(?i)gas fees? (are|is) (insane|ridiculous|killing me)",
    r"(?i)(this|it) (cost|costs) (me|us) (so much|a fortune)",
]

# Tier 3: Hidden frustration — rhetorical questions, sighs
FRUSTRATION_HIDDEN = [
    r"(?i)am I the only one who",
    r"(?i)does anyone (else |)(think|feel|hate)",
    r"(?i)is it just me or",
    r"(?i)(honestly|seriously|literally) (though |)(why|how|what)",
    r"(?i)(ugh|sigh|ffs|smh|facepalm)",
    r"(?i)(I|we) give up",
    r"(?i)back to (square one|the drawing board)",
]

# Combined
ALL_FRUSTRATION = FRUSTRATION_EXPLICIT + FRUSTRATION_COMPLAINT + FRUSTRATION_HIDDEN


def fetch_subreddit(subreddit: str, sort: str = "hot") -> list[dict]:
    """Fetch top posts from a subreddit via Reddit's JSON API."""
    url = f"https://www.reddit.com/r/{subreddit}/{sort}.json?limit={POST_LIMIT}"
    headers = {"User-Agent": USER_AGENT}

    try:
        resp = requests.get(url, headers=headers, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        posts = []
        for child in data.get("data", {}).get("children", []):
            post = child["data"]
            posts.append(
                {
                    "id": post.get("id"),
                    "title": post.get("title", ""),
                    "selftext": post.get("selftext", ""),
                    "score": post.get("score", 0),
                    "num_comments": post.get("num_comments", 0),
                    "url": f"https://reddit.com{post.get('permalink', '')}",
                    "subreddit": post.get("subreddit", subreddit),
                    "created_utc": post.get("created_utc", 0),
                    "author": post.get("author", "[deleted]"),
                }
            )
        return posts
    except Exception as e:
        print(f"  ⚠ Failed to fetch r/{subreddit}: {e}")
        return []


def detect_frustration(text: str) -> tuple[bool, float, list[str]]:
    """
    Scan text for frustration signals.
    Returns: (is_frustrated, score 0-1, matched_patterns)
    """
    matched = []
    score = 0.0

    for pattern in FRUSTRATION_EXPLICIT:
        if re.search(pattern, text):
            matched.append(pattern)
            score += 0.4  # Tier 1: highest weight

    for pattern in FRUSTRATION_COMPLAINT:
        if re.search(pattern, text):
            matched.append(pattern)
            score += 0.25  # Tier 2: medium weight

    for pattern in FRUSTRATION_HIDDEN:
        if re.search(pattern, text):
            matched.append(pattern)
            score += 0.1  # Tier 3: lower weight, but still signal

    score = min(score, 1.0)  # Cap at 1.0
    is_frustrated = score >= 0.25  # Threshold: at least one Tier 1 or two Tier 2

    return is_frustrated, score, matched


def score_post(post: dict) -> Optional[dict]:
    """
    Analyze a single post. If frustration detected, return enriched post.
    Otherwise return None.
    """
    text = f"{post['title']} {post['selftext']}"
    is_frustrated, frust_score, patterns = detect_frustration(text)

    if not is_frustrated:
        return None

    # Composite score: frustration * community engagement
    community_weight = min((post["score"] + post["num_comments"] * 2) / 200, 1.0)
    final_score = round((frust_score * 0.7 + community_weight * 0.3) * 100)

    return {
        **post,
        "frustration_score": round(frust_score * 100),
        "final_score": final_score,
        "matched_patterns": len(patterns),
        "signal_tier": (
            "strong"
            if frust_score >= 0.6
            else "medium" if frust_score >= 0.35
            else "weak"
        ),
        "mined_at": datetime.utcnow().isoformat(),
    }


def run_pipeline(subreddits: list[str] = None) -> list[dict]:
    """
    Main pipeline: fetch posts → detect frustration → return scored results.
    """
    if subreddits is None:
        subreddits = SUBREDDITS

    all_signals = []

    print(f"\n🔍 Signal Pipeline — {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}")
    print(f"   Scanning {len(subreddits)} subreddits...\n")

    for sub in subreddits:
        print(f"   r/{sub}...", end=" ", flush=True)
        posts = fetch_subreddit(sub)
        hits = 0
        for post in posts:
            result = score_post(post)
            if result:
                all_signals.append(result)
                hits += 1
        print(f"{len(posts)} posts, {hits} signals")
        time.sleep(REQUEST_DELAY)

    # Sort by final score descending
    all_signals.sort(key=lambda x: x["final_score"], reverse=True)

    print(f"\n✅ Pipeline complete: {len(all_signals)} signals detected\n")
    return all_signals


if __name__ == "__main__":
    signals = run_pipeline()
    for i, s in enumerate(signals[:10], 1):
        print(
            f"  #{i} [{s['final_score']}/100] r/{s['subreddit']}: {s['title'][:100]}"
        )
