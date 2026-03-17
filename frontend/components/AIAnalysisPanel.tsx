import { AnalyzeResponse } from "@/types/analyzer";

type AIAnalysisPanelProps = {
  data: AnalyzeResponse;
};

export function AIAnalysisPanel({ data }: AIAnalysisPanelProps) {
  const { ai_analysis } = data;

  function resolveInsightIndex(relatedInsight?: number): number | null {
    if (typeof relatedInsight !== "number") {
      return null;
    }

    const zeroBased = relatedInsight;
    if (zeroBased >= 0 && zeroBased < ai_analysis.insights.length) {
      return zeroBased;
    }

    const oneBased = relatedInsight - 1;
    if (oneBased >= 0 && oneBased < ai_analysis.insights.length) {
      return oneBased;
    }

    return null;
  }

  return (
    <article className="card">
      <header className="section-header">
        <h2>AI Analysis</h2>
        <p>Strategic interpretation and recommendations.</p>
      </header>

      <div className="analysis-section">
        <h3>Insights</h3>
        <div className="stack-list">
          {ai_analysis.insights.map((item, index) => (
            <div id={`insight-${index}`} key={`insight-${index}`} className="insight-card">
              <div className="pill-row">
                <p className="pill">{item.category || "General"}</p>
                <p className="pill">Severity: {item.severity || "N/A"}</p>
              </div>
              <p>
                <strong>Finding:</strong> {item.finding || "N/A"}
              </p>
              <p>
                <strong>Evidence:</strong> {item.evidence || "N/A"}
              </p>
              <p>
                <strong>Impact:</strong> {item.impact || "N/A"}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="analysis-section">
        <h3>Recommendations</h3>
        <div className="stack-list">
          {ai_analysis.recommendations.map((item, index) => (
            <div key={`recommendation-${index}`} className="insight-card recommendation">
              <p className="pill">Priority: {item.priority || "N/A"}</p>
              <p>
                <strong>Action:</strong> {item.action || "N/A"}
              </p>
              <p>
                <strong>Reasoning:</strong> {item.reasoning || "N/A"}
              </p>
              <p>
                <strong>Related Insight:</strong>{" "}
                {(() => {
                  const insightIndex = resolveInsightIndex(item.related_insight);

                  if (insightIndex === null) {
                    return "N/A";
                  }

                  const finding = ai_analysis.insights[insightIndex]?.finding || "Insight";

                  return (
                    <a className="related-link" href={`#insight-${insightIndex}`}>
                      {finding}
                    </a>
                  );
                })()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
