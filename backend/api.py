"""
Signal API v2 — FastAPI backend with LLM-enriched hackathon ideas.
"""

import json
import os
from pathlib import Path
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from pipeline import run_pipeline, SUBREDDITS

app = FastAPI(
    title="Signal API v2",
    description="Web3 hackathon ideas mined from real human complaints — LLM enriched",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)
IDEAS_FILE = DATA_DIR / "ideas.json"


def load_cached_ideas() -> Optional[list[dict]]:
    if IDEAS_FILE.exists():
        with open(IDEAS_FILE) as f:
            return json.load(f)
    return None


def save_ideas(ideas: list[dict]):
    with open(IDEAS_FILE, "w") as f:
        json.dump(ideas, f, indent=2, default=str)


def run_full_pipeline(use_llm: bool = True, max_enrich: int = 20):
    """Run scraper → enricher → save."""
    signals = run_pipeline()

    if use_llm:
        from enricher import run_enricher
        ideas = run_enricher(signals, max_enrich=max_enrich)
    else:
        # Fallback: use old template generator
        from generator import run_generator
        ideas = run_generator(signals)

    save_ideas(ideas)
    return ideas


@app.get("/")
def root():
    return {
        "name": "Signal API v2",
        "version": "0.2.0",
        "endpoints": ["/api/ideas", "/api/refresh", "/api/stats"],
    }


@app.get("/api/ideas")
def get_ideas(
    category: Optional[str] = Query(None),
    min_score: Optional[int] = Query(None),
    min_hackathon_fit: Optional[int] = Query(None),
    tier: Optional[str] = Query(None),
    timeliness: Optional[str] = Query(None),
    target_chain: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=50),
    refresh: bool = Query(False),
):
    """Get mined Web3 hackathon ideas. Cached by default."""
    if refresh:
        ideas = run_full_pipeline()
    else:
        ideas = load_cached_ideas()
        if not ideas:
            ideas = run_full_pipeline()

    # Filters
    if category:
        ideas = [i for i in ideas if category.lower() in [c.lower() for c in i.get("categories", [])]]
    if min_score is not None:
        ideas = [i for i in ideas if i.get("signal_score", 0) >= min_score]
    if min_hackathon_fit is not None:
        ideas = [i for i in ideas if i.get("hackathon_fit", 0) >= min_hackathon_fit]
    if tier:
        ideas = [i for i in ideas if i.get("signal_tier") == tier]
    if timeliness:
        ideas = [i for i in ideas if i.get("timeliness") == timeliness]
    if target_chain:
        ideas = [i for i in ideas if i.get("target_chain", "").lower() == target_chain.lower()]

    ideas = ideas[:limit]

    return {
        "count": len(ideas),
        "generated_at": datetime.utcnow().isoformat(),
        "subreddits_scanned": SUBREDDITS,
        "ideas": ideas,
    }


@app.get("/api/refresh")
def refresh():
    """Force-refresh the idea pipeline (scrape + LLM enrich)."""
    ideas = run_full_pipeline()
    return {
        "status": "ok",
        "count": len(ideas),
        "refreshed_at": datetime.utcnow().isoformat(),
    }


@app.get("/api/stats")
def stats():
    """Get pipeline stats."""
    ideas = load_cached_ideas() or []

    categories = {}
    chains = {}
    timeliness_counts = {"hot": 0, "warm": 0, "cold": 0}
    difficulties = {}
    tiers = {"strong": 0, "medium": 0, "weak": 0}

    for idea in ideas:
        for cat in idea.get("categories", []):
            categories[cat] = categories.get(cat, 0) + 1
        chain = idea.get("target_chain", "unknown")
        chains[chain] = chains.get(chain, 0) + 1
        tl = idea.get("timeliness", "warm")
        timeliness_counts[tl] = timeliness_counts.get(tl, 0) + 1
        diff = idea.get("difficulty", "intermediate")
        difficulties[diff] = difficulties.get(diff, 0) + 1
        tier = idea.get("signal_tier", "weak")
        tiers[tier] = tiers.get(tier, 0) + 1

    return {
        "total_ideas": len(ideas),
        "categories": dict(sorted(categories.items(), key=lambda x: x[1], reverse=True)),
        "target_chains": dict(sorted(chains.items(), key=lambda x: x[1], reverse=True)),
        "timeliness": timeliness_counts,
        "difficulties": difficulties,
        "tiers": tiers,
        "avg_signal_score": round(sum(i.get("signal_score", 0) for i in ideas) / max(len(ideas), 1), 1),
        "avg_hackathon_fit": round(sum(i.get("hackathon_fit", 0) for i in ideas) / max(len(ideas), 1), 1),
    }


@app.get("/api/ideas/{idea_id}")
def get_idea(idea_id: str):
    """Get a single idea by ID."""
    ideas = load_cached_ideas() or []
    for idea in ideas:
        if idea.get("id") == idea_id:
            return idea
    return {"error": "Idea not found"}, 404


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
