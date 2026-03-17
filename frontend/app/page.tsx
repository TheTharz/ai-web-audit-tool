"use client";

import { AIAnalysisPanel } from "@/components/AIAnalysisPanel";
import { AnalyzerForm } from "@/components/AnalyzerForm";
import { FactualMetricsPanel } from "@/components/FactualMetricsPanel";
import { useUrlAnalyzer } from "@/hooks/useUrlAnalyzer";

export default function Home() {
  const { url, isLoading, error, result, hasResult, setUrl, handleAnalyze } =
    useUrlAnalyzer();

  return (
    <div className="page-shell">
      <main className="analyzer-container">
        <section className="hero">
          <p className="badge">URL Intelligence</p>
          <h1>Website Auditer</h1>
          <p>
            Submit a URL to get measurable factual metrics and AI-powered
            insights for SEO, UX, and conversion improvements.
          </p>
        </section>

        <AnalyzerForm
          url={url}
          isLoading={isLoading}
          error={error}
          onUrlChange={setUrl}
          onSubmit={handleAnalyze}
        />

        {hasResult && result && (
          <section className="results-stack">
            <FactualMetricsPanel data={result} />
            <AIAnalysisPanel data={result} />
          </section>
        )}
      </main>
    </div>
  );
}
