# AI Web Audit Tool

A full-stack URL audit application that combines deterministic page scraping with structured AI analysis.

The system analyzes a public webpage URL, extracts factual SEO/conversion metrics, and then uses a two-stage AI pipeline (via Gemini) to first extract distinct audit insights and then synthesize them into prioritized actionable recommendations in a strict JSON shape that the frontend can render safely.

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
5. Backend executes **Stage 1 AI inference**: builds a prompt to extract distinct, deduplicated insights from the computed facts.
6. Backend executes **Stage 2 AI inference**: synthesizes the Stage 1 insights into a concise list of high-priority strategic recommendations.
7. Both stages return strict JSON (validated by Pydantic schemas).
8. API returns combined payload:
   - `factual_metrics`
   - `ai_analysis` (Insights + Recommendations)
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

### 5) Two-Stage Pipeline

Instead of a single zero-shot prompt that tries to find issues and solve them simultaneously, we split the reasoning into two distinct stages:
1. **Extraction (Stage 1):** Scans the raw factual data to find and categorize isolated insights (SEO, UX, Content) with specific evidence and severity.
2. **Synthesis (Stage 2):** Takes the raw insights and acts as a strategic consultant, prioritizing and merging them into 3-5 high-impact, executive-ready recommendations.

Why:

- Improves the depth and accuracy of findings.
- Prevents the model from being overwhelmed by trying to format and synthesize at the same time.
- Ensures recommendations explicitly address the most critical insights identified in the first stage.

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

3. Better AI Reliability Controls
- Add confidence scoring and explicit "insufficient evidence" handling

4. Product and UX Enhancements
- Multi-page crawl mode (not only single URL)
- Side-by-side baseline vs re-audit comparison

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
