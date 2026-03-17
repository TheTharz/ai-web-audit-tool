# AI Web Audit Tool

A full-stack URL audit application that combines deterministic page scraping with structured AI analysis.

The system analyzes a public webpage URL, extracts factual SEO/conversion metrics, and then asks Gemini to produce actionable insights and recommendations in a strict JSON shape that the frontend can render safely.

## Tech Stack

- Backend: FastAPI, Pydantic, HTTPX, BeautifulSoup, Google GenAI SDK
- Frontend: Next.js (App Router), React, TypeScript, Axios
- AI Model: Gemini 2.5 Flash (configured via environment variable)

## Architecture Overview

The app is split into two deployable units:

- `backend/`: API and audit pipeline
- `frontend/`: UI for URL input and report visualization

Request flow:

1. User submits a URL from the frontend form.
2. Frontend sends `POST /analyze` to FastAPI.
3. Backend scraper fetches and parses HTML with HTTPX + BeautifulSoup.
4. Backend computes factual metrics (headings, links, images, metadata, CTA count, text sample).
5. Backend builds AI prompt from instruction templates and factual metrics.
6. Gemini returns strict JSON (validated by Pydantic schema).
7. Backend deduplicates overlapping insights/recommendations.
8. API returns combined payload:
   - `factual_metrics`
   - `ai_analysis`
9. Frontend renders metrics cards and AI recommendations.

Key backend modules:

- `backend/controller/analysis_controller.py`: API endpoints and error mapping
- `backend/services/scraper_service.py`: deterministic page scraping/metric extraction
- `backend/services/analysis_service.py`: orchestration, prompting, model call, deduplication
- `backend/schemas/analysis_schema.py`: request/response schema contracts
- `backend/instructions/`: system instruction and user prompt templates

Key frontend modules:

- `frontend/hooks/useUrlAnalyzer.ts`: submit/load/error/result state orchestration
- `frontend/api/analyzerApi.ts`: typed API client with centralized error handling
- `frontend/components/`: report presentation (factual + AI panels)

## AI Design Decisions

### 1) Grounded Reasoning

Instead of asking the AI to "browse the site," we feed it specific, pre-calculated metrics.

Why:

- Reduces hallucinations
- Keeps recommendations tied to measurable facts
- Makes audits reproducible and easier to debug

### 2) Structured Output (JSON Schema)

We use Gemini structured output with:

- `response_mime_type: "application/json"`
- `response_schema: AuditReport` (Pydantic)

Why:

- Prevents malformed responses from breaking the UI
- Guarantees required fields are present in each insight/recommendation
- Enforces a stable contract between model output and frontend rendering

### 3) Context Window Optimization

We do not send full raw HTML to the model. We extract readable text and selected metadata, then send compact context (`raw_content` sample + computed metrics).

Why:

- Cuts token usage and latency
- Lowers API cost
- Reduces prompt noise from scripts/styles/boilerplate markup

### 4) System Prompting

The model is instructed to act as a "Senior Web Auditor" focused on SEO and conversion optimization.

Why:

- Produces domain-focused, business-relevant recommendations
- Improves consistency of tone and output quality
- Avoids generic, unfocused feedback

## Trade-offs

### Static vs. Dynamic Scraping

Decision:

- Use HTTPX + BeautifulSoup for this MVP

Benefit:

- Fast, lightweight, simple deployment

Trade-off:

- Cannot execute JavaScript
- Can under-report content on SPAs (React/Next/Vue)
- May show gaps such as missing media-derived signals (for example, client-rendered videos)

### Cost vs. Intelligence

Decision:

- Use Gemini 2.5 Flash instead of higher-cost models

Benefit:

- Lower cost per request
- Better throughput for internal/high-volume usage
- Generous free-tier and fast latency

Trade-off:

- Slightly less depth/nuance vs premium reasoning models on complex qualitative audits

## What I Would Improve With More Time

1. Dynamic Rendering Support
- Add Playwright-based rendering path for JS-heavy/SPA pages
- Detect when fallback to headless browser is needed

2. Richer Technical Metrics
- Add Core Web Vitals/Lighthouse integration
- Add accessibility audits (WCAG checks, ARIA/contrast validation)
- Add structured data/schema.org validation

3. Better AI Reliability Controls
- Add confidence scoring and explicit "insufficient evidence" handling
- Add prompt/version tracking for reproducibility
- Add guardrails to prevent duplicate or low-value recommendations

4. Product and UX Enhancements
- Multi-page crawl mode (not only single URL)
- Side-by-side baseline vs re-audit comparison
- Export to PDF/CSV and shareable report links

5. Ops and Quality
- End-to-end tests for `POST /analyze` and UI rendering
- Caching and rate-limiting strategies
- Observability: structured logs, request tracing, model latency/cost dashboards

## Local Development

### Prerequisites

- Python 3.11+
- Node.js 20+
- Gemini API key

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:

```env
GEMINI_API_KEY=your_api_key
MODEL=gemini-2.5-flash
```

Run backend:

```bash
python main.py
```

Backend default URL: `http://127.0.0.1:8000`

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_ANALYZER_API_BASE_URL=http://127.0.0.1:8000
```

Run frontend:

```bash
npm run dev
```

Frontend default URL: `http://localhost:3000`

## API Contract

### `POST /analyze`

Request:

```json
{
  "url": "https://example.com"
}
```

Response shape:

- `factual_metrics`: deterministic scrape metrics
- `ai_analysis`:
  - `insights[]`: categorized findings with evidence/impact/severity
  - `recommendations[]`: prioritized actions with reasoning and optional linked insight index
