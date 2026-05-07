# Signal

**Web3 hackathon ideas mined from real human complaints.**

Signal scrapes Reddit's crypto/Web3 communities, detects frustration and unsolved problems, filters for global-scale relevance, and generates structured project idea cards — complete with pitches, tech stacks, and source links.

## How It Works

```
Reddit → Frustration Detector → Global Scale Filter → Idea Card Generator → Web App
```

1. **Scrape** — Pulls posts from r/ethereum, r/ethdev, r/defi, r/web3, r/solana, r/CryptoCurrency, and more
2. **Detect** — Pattern-matches complaint language: "why can't I..." "someone needs to build..." "there's no way to..."
3. **Filter** — Kills ideas that are local, individual, or not solvable at global scale
4. **Generate** — Produces structured cards: problem, quote, persona, idea, why Web3, tech stack, pitch

## Project Structure

```
signal/
├── backend/
│   ├── pipeline.py      # Reddit scraper + frustration detection
│   ├── generator.py     # Global filter + idea card generator
│   ├── api.py           # FastAPI server
│   ├── requirements.txt
│   └── data/
│       └── ideas.json   # Cached idea cards
└── frontend/
    └── src/
        ├── app/         # Next.js App Router pages
        ├── components/  # IdeaCard, Filters
        └── lib/         # Types, API client
```

## Getting Started

### Backend

```bash
cd backend
pip install -r requirements.txt
python api.py  # Starts on http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev  # Starts on http://localhost:3000
```

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/ideas` | All mined ideas (with filters) |
| `GET /api/ideas?category=DeFi` | Filter by category |
| `GET /api/ideas?min_score=40` | Minimum signal score |
| `GET /api/ideas?refresh=true` | Force fresh Reddit data |
| `GET /api/refresh` | Trigger pipeline refresh |
| `GET /api/stats` | Pipeline statistics |

## Design

Clean, dark-themed UI inspired by Polymarket's data-dense aesthetic. Every idea card shows:
- **Score ring** — color-coded signal strength
- **Source quote** — real Reddit complaint (social proof for judges)
- **Why Web3** — why this needs blockchain, not a database
- **Pitch** — ready-to-deliver 15-second opener
- **Tech stack** — suggested protocols and primitives

## License

MIT
