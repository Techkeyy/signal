import json, re

CATEGORY_KEYWORDS = {
    "Cross-Chain / Interoperability": ["bridge", "cross-chain", "multichain", "multi-chain", "layerzero", "wormhole", "chainlink", "oracle", "l1", "l2", "layer 2", "rollup", "sidechain"],
    "Identity / Reputation": ["identity", "reputation", "did", "ens", "lens", "farcaster", "proof", "attestation", "credential", "kyc", "verify", "soulbound", "sbt", "passport"],
    "DAO / Governance": ["dao", "governance", "vote", "voting", "proposal", "snapshot", "delegate", "delegation", "treasury", "multisig", "gnosis", "safe"],
    "DeFi / Finance": ["defi", "yield", "lending", "borrow", "swap", "dex", "amm", "liquidity", "pool", "stake", "staking", "apy", "apr", "impermanent loss", "slippage"],
    "Wallet / UX": ["wallet", "seed phrase", "private key", "metamask", "rainbow", "sign", "signing", "transaction", "gas", "fees", "approve", "approval", "tx", "txn"],
    "MEV / Fairness": ["mev", "frontrun", "front-run", "sandwich", "mempool", "priority fee", "tip", "builder", "searcher"],
    "Data / Storage": ["ipfs", "arweave", "filecoin", "storage", "ceramic", "graph", "subgraph", "index", "indexing", "query"],
    "Payments / Remittances": ["payment", "remittance", "send money", "transfer", "stablecoin", "usdc", "usdt", "dai", "pay"],
}

with open("/root/signal/backend/data/ideas.json") as f:
    ideas = json.load(f)

def categorize(idea):
    text = (idea.get("problem_title", "") + " " + idea.get("source_quote", "") + " " + idea.get("elevator_pitch", "")).lower()
    matches = []
    for cat, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in text for kw in keywords):
            matches.append(cat)
    return matches if matches else ["General / Uncategorized"]

fixed = []
for idea in ideas:
    name = idea.get("project_name", "").lower()
    if "meme" in name or "ufo" in name:
        continue
    idea["categories"] = categorize(idea)
    idea["primary_category"] = idea["categories"][0]
    fixed.append(idea)

with open("/root/signal/backend/data/ideas.json", "w") as f:
    json.dump(fixed, f, indent=2, default=str)

print(f"Fixed {len(fixed)} ideas:")
for i, idea in enumerate(fixed, 1):
    name = idea.get('project_name', idea.get('problem_title', '?')[:20])
    print(f"  #{i} {name:30s} → {idea['primary_category']:35s} (score:{idea['signal_score']})")
