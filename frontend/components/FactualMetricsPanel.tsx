import { AnalyzeResponse } from "@/types/analyzer";

import { StatCard } from "@/components/StatCard";

type FactualMetricsPanelProps = {
  data: AnalyzeResponse;
};

export function FactualMetricsPanel({ data }: FactualMetricsPanelProps) {
  const { factual_metrics: metrics } = data;

  return (
    <article className="card">
      <header className="section-header">
        <h2>Factual Metrics</h2>
        <p>Objective, extractable page data.</p>
      </header>

      <div className="stats-grid">
        <StatCard label="Word Count" value={metrics.word_count} />
        <StatCard
          label="Headings"
          value={`H1 ${metrics.headings.h1} · H2 ${metrics.headings.h2} · H3 ${metrics.headings.h3}`}
        />
        <StatCard label="Internal Links" value={metrics.internal_links} />
        <StatCard label="External Links" value={metrics.external_links} />
        <StatCard label="Total Images" value={metrics.total_images} />
        <StatCard label="Alt Missing %" value={`${metrics.alt_missing_percent}%`} />
        <StatCard label="CTA Count" value={metrics.cta_count} />
      </div>

      <div className="meta-block">
        <h3>Meta Title</h3>
        <p>{metrics.meta_title || "N/A"}</p>
        <h3>Meta Description</h3>
        <p>{metrics.meta_description || "N/A"}</p>
      </div>

      <details className="raw-content">
        <summary>Raw Content (expand)</summary>
        <p>{metrics.raw_content || "No content extracted."}</p>
      </details>
    </article>
  );
}
