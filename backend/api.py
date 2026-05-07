"""
Signal API — FastAPI backend serving mined Web3 hackathon ideas.
"""

import json
import os
from pathlib import Path
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

from pipeline import run_pipeline, SUBREDDITS
from generator import run_generator

app = FastAPI(
    title="Signal API",
    description="Web3 hackathon ideas mined from real human complaints",
    version="0.1.0",
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


class IdeaItem(BaseModel):
    id: str
    source_url: str
    source_subreddit: str
    source_author: str
    reddit_score: int
    reddit_comments: int
    discovered_at: str
    frustration_score: int
    signal_score: int
    signal_tier: str
    categories: list[str]
    primary_category: str
    problem_title: str
    source_quote: str
    user_persona: str
    idea_summary: str
    why_web3: str
    tech_stack: str
    pitch: str


class IdeasResponse(BaseModel):
    count: int
    generated_at: str
    subreddits_scanned: list[str]
    ideas: list[IdeaItem]


def load_cached_ideas() -> Optional[list[dict]]:
    """Load previously mined ideas from disk."""
    if IDEAS_FILE.exists():
        with open(IDEAS_FILE) as f:
            return json.load(f)
    return None


def save_ideas(ideas: list[dict]):
    """Save mined ideas to disk for caching."""
    with open(IDEAS_FILE, "w") as f:
        json.dump(ideas, f, indent=2, default=str)


@app.get("/")
def root():
    return {
        "name": "Signal API",
        "version": "0.1.0",
        "endpoints": ["/api/ideas", "/api/refresh", "/api/stats"],
    }


@app.get("/api/ideas", response_model=IdeasResponse)
def get_ideas(
    category: Optional[str] = Query(None, description="Filter by category"),
    min_score: Optional[int] = Query(None, description="Minimum signal score (0-100)"),
    tier: Optional[str] = Query(None, description="Filter by tier: strong, medium, weak"),
    limit: int = Query(20, ge=1, le=50, description="Max ideas to return"),
    refresh: bool = Query(False, description="Force fresh data from Reddit"),
):
    """
    Get mined Web3 hackathon ideas. Uses cached data by default.
    Pass refresh=true to pull fresh data from Reddit.
    """
    if refresh:
        signals = run_pipeline()
        ideas = run_generator(signals)
        save_ideas(ideas)
    else:
        ideas = load_cached_ideas()
        if not ideas:
            # First run — mine fresh
            signals = run_pipeline()
            ideas = run_generator(signals)
            save_ideas(ideas)

    # Apply filters
    if category:
        ideas = [i for i in ideas if category.lower() in [c.lower() for c in i.get("categories", [])]]

    if min_score is not None:
        ideas = [i for i in ideas if i.get("signal_score", 0) >= min_score]

    if tier:
        ideas = [i for i in ideas if i.get("signal_tier") == tier]

    ideas = ideas[:limit]

    return IdeasResponse(
        count=len(ideas),
        generated_at=datetime.utcnow().isoformat(),
        subreddits_scanned=SUBREDDITS,
        ideas=ideas,
    )


@app.get("/api/refresh")
def refresh():
    """Force-refresh the idea pipeline from live Reddit data."""
    signals = run_pipeline()
    ideas = run_generator(signals)
    save_ideas(ideas)
    return {
        "status": "ok",
        "count": len(ideas),
        "refreshed_at": datetime.utcnow().isoformat(),
    }


@app.get("/api/stats")
def stats():
    """Get pipeline stats and available categories."""
    ideas = load_cached_ideas() or []

    categories = {}
    for idea in ideas:
        for cat in idea.get("categories", []):
            categories[cat] = categories.get(cat, 0) + 1

    tiers = {"strong": 0, "medium": 0, "weak": 0}
    for idea in ideas:
        tier = idea.get("signal_tier", "weak")
        tiers[tier] = tiers.get(tier, 0) + 1

    return {
        "total_ideas": len(ideas),
        "categories": dict(sorted(categories.items(), key=lambda x: x[1], reverse=True)),
        "tiers": tiers,
        "avg_signal_score": round(sum(i.get("signal_score", 0) for i in ideas) / max(len(ideas), 1), 1),
    }


@app.get("/api/ideas/{idea_id}")
def get_idea(idea_id: str):
    """Get a single idea by ID."""
    ideas = load_cached_ideas() or []
    for idea in ideas:
        if idea.get("id") == idea_id:
            return idea
    return {"error": "Idea not found"}, 404


# ─── Static Frontend (for simple hosting) ──────────────────────

FRONTEND_DIR = Path(__file__).parent.parent / "frontend" / "out"

@app.get("/app")
@app.get("/app/{path:path}")
def serve_frontend(path: str = ""):
    """Serve the Next.js frontend static export."""
    if FRONTEND_DIR.exists():
        file_path = FRONTEND_DIR / (path or "index.html")
        if file_path.exists():
            return FileResponse(file_path)
    return {"error": "Frontend not built. Run 'npm run build' in frontend/."}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
