"""
Signal Enricher — LLM-powered idea enrichment.
Takes raw pipeline signals and transforms them into
polished, creative hackathon idea cards.

Uses DeepSeek API (OpenAI-compatible endpoint).
"""

import os
import json
import time
from datetime import datetime
from typing import Optional
from openai import OpenAI

# ─── Configuration ──────────────────────────────────────────────

DEEPSEEK_API_KEY = os.environ.get(
    "DEEPSEEK_API_KEY",
    "sk-4bbec1bd26584050ba2a3a7916d5c6f9",
)
DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1"
DEEPSEEK_MODEL = "deepseek-chat"  # fast + cheap for enrichment

client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url=DEEPSEEK_BASE_URL)

ENRICHMENT_PROMPT = """You are an expert Web3 hackathon scout. Given a Reddit post where someone is genuinely frustrated about a Web3 problem, your job is to turn it into a polished hackathon project idea card.

Rules:
- Be SPECIFIC. No generic "improve DeFi UX" — say exactly what to build.
- Pitches should sound like a human hacker wrote them, not a corporate deck.
- Tech stacks must be concrete: name real protocols, SDKs, chains.
- Project names should be catchy, 2-4 words, lowercase-hacker-style (e.g. "gassless", "bridgelink", "voteflow").
- Every idea must be buildable in a 48-hour hackathon. Rate hackathon_fit honestly — if it needs months, score it 3/10.
- "Why now" should reference current trends, recent protocol launches, or ecosystem momentum.

Input (Reddit complaint):
Title: {title}
Body: {body}
Subreddit: {subreddit}
Frustration score: {frustration_score}/100
Signal score: {signal_score}/100

Return ONLY valid JSON, no markdown, no explanations:

{{
  "project_name": "catchy-2-4-word-lowercase-name",
  "problem_statement": "One sharp sentence describing the real pain. Be specific — name the broken thing.",
  "source_quote": "The most quotable line from the complaint that captures the frustration.",
  "user_persona": "Who exactly suffers from this? Be specific (e.g. 'Solana DeFi yield farmers' not 'users').",
  "elevator_pitch": "One sentence. If you had 10 seconds with a VC at a hackathon, what do you say?",
  "judge_pitch": "Three sentences for a judging panel. Problem → Solution → Impact. Make it compelling.",
  "why_web3": "Why does this need blockchain, not just a database? One specific, technical reason.",
  "tech_stack": "Concrete stack: name specific protocols, SDKs, chains. Format: 'Protocol/SDK + Framework + Chain'.",
  "target_chain": "Which specific L1/L2 is the best fit? Pick ONE: Ethereum, Solana, Arbitrum, Optimism, Polygon, Base, Starknet, etc.",
  "hackathon_fit": <1-10, how buildable in 48 hours? 10=weekend solo project, 5=ambitious team sprint, 1=needs months>,
  "timeliness": "<hot|warm|cold> — is this problem peaking RIGHT NOW based on current narratives?",
  "why_now": "One sentence: why is this the right moment to build this?",
  "difficulty": "<beginner|intermediate|advanced> — what skill level does this require?",
  "categories": ["category1", "category2"],
  "differentiator": "What makes this different from existing solutions? One sentence.",
  "traction_hook": "How would you get the first 100 users? One creative, specific idea."
}}"""


def enrich_signal(post: dict) -> Optional[dict]:
    """Send a signal to DeepSeek for creative enrichment."""
    title = post.get("title", "")[:300]
    body = post.get("selftext", "")[:800]
    frust = post.get("frustration_score", 50)
    signal = post.get("final_score", 50)
    subreddit = f"r/{post.get('subreddit', 'unknown')}"

    prompt = ENRICHMENT_PROMPT.format(
        title=title,
        body=body if body else "(no body text)",
        subreddit=subreddit,
        frustration_score=frust,
        signal_score=signal,
    )

    try:
        response = client.chat.completions.create(
            model=DEEPSEEK_MODEL,
            messages=[
                {"role": "system", "content": "You are a Web3 hackathon idea scout. You always return valid JSON only, no explanations."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.8,
            max_tokens=800,
        )

        raw = response.choices[0].message.content.strip()
        # Clean up any markdown fences
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        enriched = json.loads(raw)
        return enriched

    except Exception as e:
        print(f"  ⚠ Enrichment failed for {post.get('id', '?')}: {e}")
        return None


# Map LLM-generated categories back to our predefined ones
CATEGORY_ALIASES = {
    "defi": "DeFi / Finance", "DeFi": "DeFi / Finance",
    "privacy": "Identity / Reputation", "compliance": "Identity / Reputation",
    "cross-chain": "Cross-Chain / Interoperability", "bridge": "Cross-Chain / Interoperability",
    "dao": "DAO / Governance", "dao-tools": "DAO / Governance", "governance": "DAO / Governance",
    "wallet": "Wallet / UX", "ux": "Wallet / UX", "gas": "Wallet / UX",
    "mev": "MEV / Fairness", "fairness": "MEV / Fairness",
    "storage": "Data / Storage", "data": "Data / Storage", "indexing": "Data / Storage",
    "payment": "Payments / Remittances", "remittance": "Payments / Remittances", "stablecoin": "Payments / Remittances",
    "identity": "Identity / Reputation", "reputation": "Identity / Reputation",
    "analytics": "General / Uncategorized", "infrastructure": "General / Uncategorized",
    "developer-tools": "General / Uncategorized", "automation": "General / Uncategorized",
    "trading": "DeFi / Finance", "aggregator": "DeFi / Finance", "risk management": "DeFi / Finance",
    "accounting": "DAO / Governance", "narrative-trading": "General / Uncategorized",
}

# Ideas that are meme coins, shitcoins, or pure speculation — filter OUT
MEME_NOISE = ["meme", "meme-coin", "memecoin", "shitcoin", "shitpost", "consumer-tools"]

def build_idea_card(post: dict, enriched: dict, categories: list[str]) -> dict:
    """Merge pipeline data + LLM enrichment into final idea card."""
    # Use our regex-based categories as primary (more reliable than LLM guessing)
    our_cats = categories if categories else ["General / Uncategorized"]

    # Map LLM categories to our predefined ones
    llm_cats = enriched.get("categories", [])
    mapped_llm = []
    for c in llm_cats:
        mapped = CATEGORY_ALIASES.get(c.lower(), c)
        if mapped not in our_cats and mapped not in mapped_llm:
            mapped_llm.append(mapped)

    # Filter: if LLM primary category is meme/shitcoin, skip this idea
    primary_raw = (llm_cats[0] if llm_cats else "").lower()
    if any(m in primary_raw for m in MEME_NOISE):
        return None  # caller should filter this out

    primary_category = our_cats[0]

    created = post.get("created_utc", 0)
    discovered_date = post.get("mined_at", datetime.utcnow().isoformat())

    return {
        "id": f"sig-{post['id']}",
        "source_url": post["url"],
        "source_subreddit": f"r/{post['subreddit']}",
        "source_author": post.get("author", "anonymous"),
        "reddit_score": post.get("score", 0),
        "reddit_comments": post.get("num_comments", 0),
        "discovered_at": discovered_date,
        # Analysis
        "frustration_score": post["frustration_score"],
        "signal_score": post["final_score"],
        "signal_tier": post["signal_tier"],
        "hackathon_fit": enriched.get("hackathon_fit", post.get("hackathon_fit", 5)),
        "timeliness": enriched.get("timeliness", "warm"),
        "difficulty": enriched.get("difficulty", "intermediate"),
        # Categorization
        "categories": enriched.get("categories", categories),
        "primary_category": primary_category,
        # Generated content
        "project_name": enriched.get("project_name", ""),
        "problem_title": enriched.get("problem_statement", post["title"]),
        "source_quote": enriched.get("source_quote", f'"{post["title"]}"'),
        "user_persona": enriched.get("user_persona", "Web3 users"),
        "elevator_pitch": enriched.get("elevator_pitch", ""),
        "judge_pitch": enriched.get("judge_pitch", ""),
        "why_web3": enriched.get("why_web3", ""),
        "why_now": enriched.get("why_now", ""),
        "tech_stack": enriched.get("tech_stack", ""),
        "target_chain": enriched.get("target_chain", ""),
        "differentiator": enriched.get("differentiator", ""),
        "traction_hook": enriched.get("traction_hook", ""),
        # Legacy compat
        "idea_summary": enriched.get("elevator_pitch", ""),
        "pitch": enriched.get("elevator_pitch", ""),
    }


def categorize(post: dict) -> list[str]:
    """Map a post to Web3 problem categories."""
    CATEGORY_KEYWORDS = {
        "Cross-Chain / Interoperability": [
            "bridge", "cross-chain", "multichain", "multi-chain",
            "layerzero", "wormhole", "chainlink", "oracle",
            "l1", "l2", "layer 2", "rollup", "sidechain",
        ],
        "Identity / Reputation": [
            "identity", "reputation", "did", "ens", "lens", "farcaster",
            "proof", "attestation", "credential", "kyc", "verify",
            "soulbound", "sbt", "passport",
        ],
        "DAO / Governance": [
            "dao", "governance", "vote", "voting", "proposal",
            "snapshot", "delegate", "delegation", "treasury",
            "multisig", "gnosis", "safe",
        ],
        "DeFi / Finance": [
            "defi", "yield", "lending", "borrow", "swap", "dex",
            "amm", "liquidity", "pool", "stake", "staking",
            "apy", "apr", "impermanent loss", "slippage",
        ],
        "Wallet / UX": [
            "wallet", "seed phrase", "private key", "metamask", "rainbow",
            "sign", "signing", "transaction", "gas", "fees",
            "approve", "approval", "tx", "txn",
        ],
        "MEV / Fairness": [
            "mev", "frontrun", "front-run", "sandwich", "mempool",
            "priority fee", "tip", "builder", "searcher",
        ],
        "Data / Storage": [
            "ipfs", "arweave", "filecoin", "storage", "ceramic",
            "graph", "subgraph", "index", "indexing", "query",
        ],
        "Payments / Remittances": [
            "payment", "remittance", "send money", "transfer",
            "stablecoin", "usdc", "usdt", "dai", "pay",
        ],
    }
    text = f"{post['title']} {post.get('selftext', '')}".lower()
    matches = []
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in text for kw in keywords):
            matches.append(category)
    return matches if matches else ["General / Uncategorized"]


def run_enricher(signals: list[dict], max_enrich: int = 20) -> list[dict]:
    """
    Take pipeline signals, enrich the best ones with LLM, return idea cards.
    Only enriches top `max_enrich` signals to manage API costs.
    """
    # Sort by final score, take top N
    top = sorted(signals, key=lambda x: x["final_score"], reverse=True)[:max_enrich]

    ideas = []
    enriched_count = 0

    print(f"\n🧠 Enricher — {len(top)} signals to enrich via DeepSeek\n")

    for i, post in enumerate(top, 1):
        print(f"   [{i}/{len(top)}] {post['title'][:80]}...", end=" ", flush=True)

        enriched = enrich_signal(post)
        if enriched:
            categories = categorize(post)
            idea = build_idea_card(post, enriched, categories)
            if idea:
                ideas.append(idea)
                enriched_count += 1
                print(f"✅ → \"{enriched.get('project_name', '?')}\"")
            else:
                print("🚫 filtered (noise/meme)")
        else:
            print("⚠ skipped (enrichment failed)")

        time.sleep(0.3)  # rate limit courtesy

    print(f"\n✅ Enricher complete: {enriched_count}/{len(top)} enriched\n")
    return ideas


if __name__ == "__main__":
    from pipeline import run_pipeline

    signals = run_pipeline(["ethereum", "defi", "web3"])
    ideas = run_enricher(signals, max_enrich=5)

    for i, idea in enumerate(ideas, 1):
        print(f"\n{'='*60}")
        print(f"📋 #{i}  {idea['project_name']}  •  {idea['signal_score']}/100  •  {idea['target_chain']}")
        print(f"   Hackathon fit: {idea['hackathon_fit']}/10  •  {idea['timeliness']}  •  {idea['difficulty']}")
        print(f"\n   Problem: {idea['problem_title']}")
        print(f"   Persona: {idea['user_persona']}")
        print(f"   Elevator: {idea['elevator_pitch']}")
        print(f"   Stack: {idea['tech_stack']}")
        print(f"   Traction: {idea['traction_hook']}")
