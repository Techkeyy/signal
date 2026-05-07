"""
Signal Pipeline v2 — Deep scraper with comment mining.
Reddit free .json API. No auth needed.
"""

import requests
import re
import time
from datetime import datetime
from typing import Optional

# ─── Configuration ──────────────────────────────────────────────

SUBREDDITS = [
    "ethereum", "ethdev", "defi", "CryptoCurrency", "web3",
    "ethtrader", "solana", "solidity",
    "Arbitrum", "optimism", "0xPolygon", "Chainlink",
]

USER_AGENT = "signal-idea-miner/0.2 (by /u/signal_bot)"
REQUEST_DELAY = 1.5
POST_LIMIT = 50
COMMENT_LIMIT = 20   # top-level comments to mine from hot threads

# ─── Frustration Patterns (v2 — expanded) ──────────────────────

FRUSTRATION_EXPLICIT = [
    r"(?i)why (can'?t|isn'?t there) (I|we|you|someone) ",
    r"(?i)someone (needs to|should|please) build",
    r"(?i)there'?s (no|not a) (way|tool|app|dapp|protocol) to",
    r"(?i)how (do|can) (you|I|we) (guys )?(deal with|handle|solve|fix)",
    r"(?i)(I|we) (really |desperately )?need (a|an) ",
    r"(?i)(this|it) (should|needs to) (be|exist|work)",
    r"(?i)(I|we) (just |)want (to |a )",
    r"(?i)wish (there was|I could|we had|someone would)",
    r"(?i)(has|have) (anyone|anybody|someone) (built|made|created)",
    r"(?i)imagine if (we |you |)(could|had)",
    r"(?i)wouldn'?t it be (great|nice|amazing) if",
]

FRUSTRATION_COMPLAINT = [
    r"(?i)(I|we) (hate|can'?t stand|am so tired of) ",
    r"(?i)this is (so |really |incredibly |)frustrating",
    r"(?i)(it'?s|this is) (so |really |)(broken|terrible|awful|unusable)",
    r"(?i)(the|this) (UX|user experience|experience) (is |)(awful|terrible|bad)",
    r"(?i)(I|we) (just |)(lost|lose) .*(because|due to|thanks to)",
    r"(?i)gas fees? (are|is) (insane|ridiculous|killing me)",
    r"(?i)(this|it) (cost|costs) (me|us) (so much|a fortune)",
    r"(?i)(I|we) (keep|always|constantly) (getting|having|running into)",
    r"(?i)every (single |)time (I|we) (try|attempt)",
    r"(?i)(drives me|crazy|insane|nuts)",
    r"(?i)(worst|horrible|dreadful) (experience|UX|interface)",
    r"(?i)how (are|is) (we|people|anyone) (supposed to|meant to)",
]

FRUSTRATION_HIDDEN = [
    r"(?i)am I the only one who",
    r"(?i)does anyone (else |)(think|feel|hate|struggle)",
    r"(?i)is it just me or",
    r"(?i)(honestly|seriously|literally) (though |)(why|how|what)",
    r"(?i)(ugh|sigh|ffs|smh|facepalm)",
    r"(?i)(I|we) give up",
    r"(?i)back to (square one|the drawing board)",
    r"(?i)maybe (I|we|it)(\'?s| is) (just|only) me",
    r"(?i)(never|can'?t|won'?t) (going to|gonna) (work|happen|scale)",
]

# ─── Noise Filters (v2 — much broader) ─────────────────────────

NOISE_PATTERNS = [
    # Begging / faucet
    r"(?i)(loan|send|lend) me .*(eth|sol|matic|token|testnet|sepolia|goerli)",
    r"(?i)(faucet|testnet.*token|need.*test.*eth)",
    # Career / learning
    r"(?i)(job|career|salary|hire|interview|resume|cv|recruit)",
    r"(?i)(tutorial|course|bootcamp|certification|learn.*solidity)",
    r"(?i)^(help|please help|can anyone|can someone|does anyone know)",
    r"(?i)(how|where) (to|can I) (get|find|start|learn|begin)",
    r"(?i)(what|which) (language|framework|stack|tool) (should|to use)",
    # Speculation / price talk
    r"(?i)(price|chart|pump|dump|moon|wen|ngmi|wagmi|hodl)",
    r"(?i)(airdrop|giveaway|free.*token|claim.*now)",
    r"(?i)(just bought|just sold|bought the dip|sold the top)",
    r"(?i)(bear|bull|correction|crash|rally|ath)",
    # Scam reports (individual incidents, not systemic)
    r"(?i)(scam|hack|phish|drain).*(my|me|wallet|funds)",
    r"(?i)(rugpull|rug pull|honeypot)",
    # Meta / self-referential
    r"(?i)(project ideas|what should I build|looking for ideas|idea for)",
    r"(?i)(posting on|linkedin|twitter.*follow|follow.*twitter)",
    # Technical support (individual issues)
    r"(?i)(error|bug|fail|not working|stuck).*(help|fix|please)",
    r"(?i)(transaction|tx).*(stuck|pending|failed|revert)",
    # AI / LLM hype posts (not Web3 problems)
    r"(?i)(chatgpt|claude|gemini|copilot).*(build|code|write|solidity)",
    # Exchange complaints (localized, not protocol-level)
    r"(?i)(binance|coinbase|kraken|kucoin|bybit).*(withdraw|deposit|kyc|ban|suspend|block)",
    # Token shilling
    r"(?i)(check out|launching|presale|ido|ico).*(token|coin|project)",
    r"(?i)(best|top).*(token|coin|altcoin|nft) (to |for )",
]

ALL_FRUSTRATION = FRUSTRATION_EXPLICIT + FRUSTRATION_COMPLAINT + FRUSTRATION_HIDDEN


def is_noise(text: str) -> bool:
    for pattern in NOISE_PATTERNS:
        if re.search(pattern, text):
            return True
    return False


def fetch_subreddit(subreddit: str, sort: str = "hot") -> list[dict]:
    """Fetch posts from a subreddit."""
    url = f"https://www.reddit.com/r/{subreddit}/{sort}.json?limit={POST_LIMIT}"
    headers = {"User-Agent": USER_AGENT}

    try:
        resp = requests.get(url, headers=headers, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        posts = []
        for child in data.get("data", {}).get("children", []):
            post = child["data"]
            posts.append({
                "id": post.get("id"),
                "title": post.get("title", ""),
                "selftext": post.get("selftext", ""),
                "score": post.get("score", 0),
                "num_comments": post.get("num_comments", 0),
                "url": f"https://reddit.com{post.get('permalink', '')}",
                "subreddit": post.get("subreddit", subreddit),
                "created_utc": post.get("created_utc", 0),
                "author": post.get("author", "[deleted]"),
                "sort": sort,
            })
        return posts
    except Exception as e:
        print(f"  ⚠ r/{subreddit}/{sort}: {e}")
        return []


def fetch_comments(post: dict) -> list[str]:
    """Mine top-level comments from a post. Real frustration lives in comments."""
    permalink = post["url"].replace("https://reddit.com", "")
    url = f"https://www.reddit.com{permalink}.json?limit={COMMENT_LIMIT}"
    headers = {"User-Agent": USER_AGENT}

    try:
        resp = requests.get(url, headers=headers, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        comments = []
        # Reddit returns [post_data, comment_data]
        if len(data) > 1:
            for child in data[1].get("data", {}).get("children", []):
                if child["kind"] == "t1":  # t1 = comment
                    body = child["data"].get("body", "")
                    if len(body) > 30:
                        comments.append(body)
        return comments
    except Exception:
        return []


def detect_frustration(text: str) -> tuple[bool, float, list[str]]:
    """Scan text for frustration signals. Returns (is_frustrated, score, patterns)."""
    matched = []
    score = 0.0

    for pattern in FRUSTRATION_EXPLICIT:
        if re.search(pattern, text):
            matched.append(pattern)
            score += 0.4

    for pattern in FRUSTRATION_COMPLAINT:
        if re.search(pattern, text):
            matched.append(pattern)
            score += 0.25

    for pattern in FRUSTRATION_HIDDEN:
        if re.search(pattern, text):
            matched.append(pattern)
            score += 0.1

    score = min(score, 1.0)
    is_frustrated = score >= 0.25
    return is_frustrated, score, matched


def score_post(post: dict) -> Optional[dict]:
    """Analyze a post. If frustration detected, return enriched post."""
    text = f"{post['title']} {post['selftext']}"

    if is_noise(text):
        return None

    is_frustrated, frust_score, patterns = detect_frustration(text)

    # Also scan comments for frustration signals
    comment_frust_score = 0.0
    if post.get("num_comments", 0) >= 3:
        comments = fetch_comments(post)
        for comment in comments:
            if is_noise(comment):
                continue
            _, c_score, _ = detect_frustration(comment)
            comment_frust_score = max(comment_frust_score, c_score)
        # Blend: 70% post frustration, 30% comment frustration
        frust_score = max(frust_score, frust_score * 0.7 + comment_frust_score * 0.3)

    if not is_frustrated and comment_frust_score < 0.25:
        return None

    # Community engagement weight: recency-boosted
    hours_ago = max((time.time() - post.get("created_utc", time.time())) / 3600, 0)
    recency_boost = max(0, 1.0 - hours_ago / 72)  # linear decay over 72h
    community_weight = min((post["score"] + post["num_comments"] * 2) / 200, 1.0)
    community_weight = community_weight * 0.7 + recency_boost * 0.3

    final_score = round((frust_score * 0.7 + community_weight * 0.3) * 100)

    # Hackathon feasibility heuristic
    title = post["title"].lower()
    is_small_scope = any(kw in title for kw in ["widget", "extension", "bot", "dashboard", "tracker", "aggregator", "checker", "calculator"])
    is_large_scope = any(kw in title for kw in ["protocol", "chain", "network", "consensus", "governance", "treasury", "dao", "bridge", "oracle"])
    if is_small_scope:
        hackathon_fit = 9
    elif is_large_scope:
        hackathon_fit = 4
    else:
        hackathon_fit = 7

    return {
        **post,
        "frustration_score": round(frust_score * 100),
        "final_score": final_score,
        "matched_patterns": len(patterns),
        "signal_tier": (
            "strong" if frust_score >= 0.6
            else "medium" if frust_score >= 0.35
            else "weak"
        ),
        "hackathon_fit": hackathon_fit,
        "comment_frustration": round(comment_frust_score * 100),
        "mined_at": datetime.utcnow().isoformat(),
    }


def run_pipeline(subreddits: list[str] = None) -> list[dict]:
    """Main pipeline: fetch posts + comments → detect frustration → return scored results."""
    if subreddits is None:
        subreddits = SUBREDDITS

    all_signals = []

    print(f"\n🔍 Signal Pipeline v2 — {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}")
    print(f"   Scanning {len(subreddits)} subreddits (hot + rising, {POST_LIMIT} posts each)...\n")

    for sub in subreddits:
        for sort_mode in ["hot", "rising"]:
            print(f"   r/{sub}/{sort_mode}...", end=" ", flush=True)
            posts = fetch_subreddit(sub, sort=sort_mode)
            hits = 0
            for post in posts:
                result = score_post(post)
                if result:
                    all_signals.append(result)
                    hits += 1
            print(f"{len(posts)} posts, {hits} signals")
            time.sleep(REQUEST_DELAY)

    # Deduplicate by ID
    seen = set()
    unique = []
    for s in sorted(all_signals, key=lambda x: x["final_score"], reverse=True):
        if s["id"] not in seen:
            seen.add(s["id"])
            unique.append(s)

    print(f"\n✅ Pipeline complete: {len(unique)} unique signals\n")
    return unique


if __name__ == "__main__":
    signals = run_pipeline()
    for i, s in enumerate(signals[:20], 1):
        print(f"  #{i} [{s['final_score']}/100] [{s['signal_tier']}] r/{s['subreddit']}: {s['title'][:120]}")
