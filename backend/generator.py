"""
Signal Generator — Global-scale filter + Web3 idea card builder.
Takes frustrated Reddit posts and turns them into hackathon-ready project ideas.
"""

# ─── Global Scale Qualifier ────────────────────────────────────

# Questions every idea must pass. If any answer is "no," the idea is dropped.
GLOBAL_SCALE_QUESTIONS = [
    "Does this problem affect users in developing and developed countries equally?",
    "Is the solution chain-agnostic or deployable on multiple chains?",
    "Can the solution work without geo-gated KYC or regional restrictions?",
    "Would this be useful to someone in Argentina, Nigeria, Vietnam, and Germany?",
]

# Keywords that suggest a problem is LOCAL, not global — these get filtered OUT
LOCAL_SIGNALS = [
    "my country", "in my city", "my bank", "my local", "here in",
    "regulation in", "banned in", "my government", "my exchange",
    "binance", "coinbase", "kraken",  # exchange-specific complaints
    "my wallet got hacked",  # individual security failure, not systemic
    "scam", "rugpull", "rug pull",  # often one-off incidents
]


def passes_global_scale(post: dict) -> tuple[bool, str]:
    """
    Check if a complaint represents a global-scale problem.
    Returns (passes, reason).
    """
    text = f"{post['title']} {post['selftext']}".lower()

    # Check for local/individual signals
    for pattern in LOCAL_SIGNALS:
        if pattern in text:
            return False, f"Local/individual issue detected: '{pattern}'"

    # Community signal is a soft signal, not a hard gate.
    # A complaint about cross-chain yields is global whether it has
    # 2 upvotes or 200. We only filter out truly zero-engagement
    # posts (0 score AND 0 comments = likely spam/self-post).
    if post.get("score", 0) == 0 and post.get("num_comments", 0) == 0:
        return False, "Zero engagement — likely spam"

    return True, "Passes global scale check"


# ─── Problem → Web3 Category Mapper ────────────────────────────

CATEGORY_KEYWORDS = {
    "Cross-Chain / Interoperability": [
        "bridge", "cross-chain", "multichain", "multi-chain",
        "layerzero", "wormhole", "chainlink", "oracle",
        "l1", "l2", "layer 2", "rollup", "sidechain",
    ],
    "Identity / Reputation": [
        "identity", "reputation", "did", "ens", "lens", "farcaster",
        "proof", "attestation", "credential", "kyc", "verify",
        "soulbound", "sbt", "passport", "worldcoin",
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


def categorize(post: dict) -> list[str]:
    """Map a post to Web3 problem categories."""
    text = f"{post['title']} {post['selftext']}".lower()
    matches = []
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in text for kw in keywords):
            matches.append(category)
    return matches if matches else ["General / Uncategorized"]


# ─── Idea Card Generator ───────────────────────────────────────

IDEA_TEMPLATES = {
    "Cross-Chain / Interoperability": {
        "stack": "LayerZero / Wormhole / Chainlink CCIP + React + wagmi",
        "pitch_seed": "Unify the fragmented Web3 experience by",
    },
    "Identity / Reputation": {
        "stack": "EAS / Verax / SPs + Ceramic + Next.js + Privy",
        "pitch_seed": "Give users back control of their digital identity with",
    },
    "DAO / Governance": {
        "stack": "Snapshot + Gnosis Safe + Hats Protocol + Next.js",
        "pitch_seed": "Fix broken DAO coordination by",
    },
    "DeFi / Finance": {
        "stack": "Solidity + Foundry + The Graph + React + wagmi",
        "pitch_seed": "Democratize financial access through",
    },
    "Wallet / UX": {
        "stack": "EIP-4337 + Pimlico / Biconomy + React Native + wagmi",
        "pitch_seed": "Remove the friction from Web3 with",
    },
    "MEV / Fairness": {
        "stack": "Solidity + Flashbots / SUAVE + Rust + The Graph",
        "pitch_seed": "Protect everyday users from hidden exploitation with",
    },
    "Data / Storage": {
        "stack": "IPFS / Arweave + The Graph + Ceramic + Next.js",
        "pitch_seed": "Build permanent, censorship-resistant infrastructure for",
    },
    "Payments / Remittances": {
        "stack": "Solidity + Circle / Stellar + React Native + wagmi",
        "pitch_seed": "Move money across borders instantly with",
    },
    "General / Uncategorized": {
        "stack": "Solidity + Foundry + Next.js + wagmi + The Graph",
        "pitch_seed": "Solve a real Web3 pain point:",
    },
}


def generate_idea_card(post: dict) -> dict:
    """
    Take a frustrated post and produce a structured hackathon
    project idea card.
    """
    categories = categorize(post)
    primary_category = categories[0]
    template = IDEA_TEMPLATES.get(primary_category, IDEA_TEMPLATES["General / Uncategorized"])

    # Discovered timestamp
    created = post.get("created_utc", 0)
    discovered_date = (
        f"{created:.0f}" if created else "unknown"
    )

    return {
        "id": f"sig-{post['id']}",
        "source_url": post["url"],
        "source_subreddit": f"r/{post['subreddit']}",
        "source_author": post.get("author", "anonymous"),
        "reddit_score": post.get("score", 0),
        "reddit_comments": post.get("num_comments", 0),
        "discovered_at": post.get("mined_at", ""),
        # --- Analysis ---
        "frustration_score": post["frustration_score"],
        "signal_score": post["final_score"],
        "signal_tier": post["signal_tier"],
        "categories": categories,
        "primary_category": primary_category,
        # --- Generated ---
        "problem_title": _generate_title(post),
        "source_quote": _extract_quote(post),
        "user_persona": _infer_persona(post),
        "idea_summary": _generate_summary(post, primary_category),
        "why_web3": _generate_why_web3(post, primary_category),
        "tech_stack": template["stack"],
        "pitch": _generate_pitch(post, primary_category, template["pitch_seed"]),
    }


def _generate_title(post: dict) -> str:
    """Create a crisp problem title from the post."""
    title = post["title"]
    # Clean up Reddit noise
    title = title.replace("[", "").replace("]", "")
    if len(title) > 100:
        title = title[:97] + "..."
    return title


def _extract_quote(post: dict) -> str:
    """Pull the most quotable line from the post."""
    text = post.get("selftext", "")
    if not text or len(text) < 30:
        return f'"{post["title"]}"'
    # Take first 200 chars as the quote
    quote = text[:200].replace("\n", " ").strip()
    if len(text) > 200:
        quote += "..."
    return f'"{quote}"'


def _infer_persona(post: dict) -> str:
    """Guess who this problem affects."""
    text = f"{post['title']} {post.get('selftext', '')}".lower()
    personas = []
    if any(kw in text for kw in ["dev", "developer", "solidity", "contract", "code"]):
        personas.append("Web3 developers")
    if any(kw in text for kw in ["user", "new", "onboard", "confus", "ux", "hard to"]):
        personas.append("everyday crypto users")
    if any(kw in text for kw in ["defi", "yield", "trade", "swap", "lp", "farm"]):
        personas.append("DeFi participants")
    if any(kw in text for kw in ["dao", "governance", "vote", "community"]):
        personas.append("DAO members & contributors")
    if any(kw in text for kw in ["send", "remittance", "transfer", "pay"]):
        personas.append("global remittance users")
    if not personas:
        personas.append("Web3 users worldwide")
    return " + ".join(personas[:2])


def _generate_summary(post: dict, category: str) -> str:
    """Write a one-paragraph idea summary."""
    problem = post["title"].lower().rstrip(".")
    return (
        f"Users are frustrated that {problem}. "
        f"This project builds a {category.lower()} solution that addresses "
        f"this pain point directly — turning a recurring complaint into a "
        f"usable product."
    )


def _generate_why_web3(post: dict, category: str) -> str:
    """Explain why this needs blockchain, not just a database."""
    reasons = {
        "Cross-Chain / Interoperability": "Cross-chain messaging and state proofs require on-chain verification — a centralized database can't validate what happened on Ethereum from Solana. Smart contracts and light clients make trustless bridging possible.",
        "Identity / Reputation": "Self-sovereign identity requires cryptographic proofs that no central authority can revoke. On-chain attestations and zero-knowledge proofs let users prove claims without exposing data.",
        "DAO / Governance": "Transparent, immutable voting and treasury management requires on-chain execution. Smart contracts ensure rules can't be changed retroactively by any single party.",
        "DeFi / Finance": "Non-custodial, permissionless financial infrastructure requires smart contracts — no bank, no broker, no intermediary. Composability means any new DeFi primitive plugs into the entire ecosystem.",
        "Wallet / UX": "Account abstraction (EIP-4337), session keys, and gas sponsorship all require smart contract wallets and bundler infrastructure on-chain. These aren't frontend-only fixes.",
        "MEV / Fairness": "MEV is a direct consequence of block proposer power in permissionless consensus. Solutions require protocol-level changes — encrypted mempools, fair ordering, PBS — not app-layer patches.",
        "Data / Storage": "Censorship-resistant, permanent data storage requires decentralized infrastructure with crypto-economic guarantees — IPFS pinning incentives, Arweave endowment, Filecoin proofs.",
        "Payments / Remittances": "Borderless value transfer without correspondent banking requires a global settlement layer. Stablecoins on permissionless chains enable instant, near-free cross-border payments.",
        "General / Uncategorized": "Decentralized infrastructure removes single points of failure and gatekeepers — the core promise of Web3. Smart contracts enable permissionless innovation where centralized platforms would block it.",
    }
    return reasons.get(category, reasons["General / Uncategorized"])


def _generate_pitch(post: dict, category: str, seed: str) -> str:
    """Write a tight 15-second pitch."""
    title = post["title"].lower().rstrip(".")
    # Make it snappy
    return f"{seed} solving: {title}."


# ─── Pipeline Runner ───────────────────────────────────────────

def run_generator(signals: list[dict]) -> list[dict]:
    """
    Take raw pipeline signals, filter for global scale, and generate
    full idea cards.
    """
    ideas = []
    filtered = 0

    for post in signals:
        passes, reason = passes_global_scale(post)
        if not passes:
            filtered += 1
            continue
        ideas.append(generate_idea_card(post))

    print(f"📊 Generator: {len(signals)} signals → {len(ideas)} ideas "
          f"({filtered} filtered out)")

    return ideas


if __name__ == "__main__":
    from pipeline import run_pipeline

    signals = run_pipeline(["ethereum", "defi", "ethdev"])
    ideas = run_generator(signals)

    for i, idea in enumerate(ideas[:5], 1):
        print(f"\n{'─'*60}")
        print(f"📋 IDEA #{i}  •  {idea['signal_score']}/100  •  {idea['source_subreddit']}")
        print(f"\n{idea['source_quote']}")
        print(f"\nPROBLEM: {idea['problem_title']}")
        print(f"PERSONA: {idea['user_persona']}")
        print(f"IDEA: {idea['idea_summary']}")
        print(f"WHY WEB3: {idea['why_web3'][:150]}...")
        print(f"STACK: {idea['tech_stack']}")
        print(f"PITCH: {idea['pitch']}")
