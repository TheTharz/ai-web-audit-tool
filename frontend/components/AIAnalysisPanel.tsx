import { MouseEvent } from "react";

import { AnalyzeResponse, PrioritizedRecommendation, AuditInsight } from "@/types/analyzer";

type AIAnalysisPanelProps = {
  data: AnalyzeResponse;
};

export function AIAnalysisPanel({ data }: AIAnalysisPanelProps) {
  const { ai_analysis } = data;

  function scrollToInsight(
    event: MouseEvent<HTMLAnchorElement>,
    insightIndex: number
  ) {
    event.preventDefault();

    const target = document.getElementById(`insight-${insightIndex}`);
    if (!target) {
      return;
    }

    const stickyForm = document.querySelector(".form-card");
    const stickyHeight =
      stickyForm instanceof HTMLElement ? stickyForm.offsetHeight : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - stickyHeight - 24;

    window.scrollTo({
      top,
      behavior: "smooth",
    });

    window.history.replaceState(null, "", `#insight-${insightIndex}`);
  }

  function groupRecommendationsByPriority(recommendations: PrioritizedRecommendation[]) {
    return {
      high: recommendations.filter(r => r.priority === 'High'),
      medium: recommendations.filter(r => r.priority === 'Medium'),
      low: recommendations.filter(r => r.priority === 'Low'),
    };
  }

  const groupedRecommendations = groupRecommendationsByPriority(ai_analysis.recommendations);

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
        <p className="recommendations-intro">Priority-ordered actions to improve your site performance and user experience.</p>

        {groupedRecommendations.high.length > 0 && (
          <div className="recommendation-group priority-group-high">
            <div className="priority-group-header">
              <h4 className="priority-group-title">High Priority</h4>
              <span className="recommendation-count">{groupedRecommendations.high.length}</span>
            </div>
            <div className="stack-list">
              {groupedRecommendations.high.map((item, index) => (
                <RecommendationCard
                  key={`high-${index}`}
                  recommendation={item}
                  insights={ai_analysis.insights}
                  onScrollToInsight={scrollToInsight}
                  cardNumber={index + 1}
                />
              ))}
            </div>
          </div>
        )}

        {groupedRecommendations.medium.length > 0 && (
          <div className="recommendation-group priority-group-medium">
            <div className="priority-group-header">
              <h4 className="priority-group-title">Medium Priority</h4>
              <span className="recommendation-count">{groupedRecommendations.medium.length}</span>
            </div>
            <div className="stack-list">
              {groupedRecommendations.medium.map((item, index) => (
                <RecommendationCard
                  key={`medium-${index}`}
                  recommendation={item}
                  insights={ai_analysis.insights}
                  onScrollToInsight={scrollToInsight}
                  cardNumber={groupedRecommendations.high.length + index + 1}
                />
              ))}
            </div>
          </div>
        )}

        {groupedRecommendations.low.length > 0 && (
          <div className="recommendation-group priority-group-low">
            <div className="priority-group-header">
              <h4 className="priority-group-title">Low Priority</h4>
              <span className="recommendation-count">{groupedRecommendations.low.length}</span>
            </div>
            <div className="stack-list">
              {groupedRecommendations.low.map((item, index) => (
                <RecommendationCard
                  key={`low-${index}`}
                  recommendation={item}
                  insights={ai_analysis.insights}
                  onScrollToInsight={scrollToInsight}
                  cardNumber={groupedRecommendations.high.length + groupedRecommendations.medium.length + index + 1}
                />
              ))}
            </div>
          </div>
        )}

        {ai_analysis.recommendations.length === 0 && (
          <p className="no-recommendations">No recommendations available.</p>
        )}
      </div>
    </article>
  );
}

type RecommendationCardProps = {
  recommendation: PrioritizedRecommendation;
  insights: AuditInsight[];
  onScrollToInsight: (event: MouseEvent<HTMLAnchorElement>, index: number) => void;
  cardNumber: number;
};

function RecommendationCard({
  recommendation,
  insights,
  onScrollToInsight,
  cardNumber,
}: RecommendationCardProps) {
  return (
    <div className={`recommendation-card priority-${recommendation.priority.toLowerCase()}`}>
      <div className="recommendation-top">
        <div className="recommendation-number">{cardNumber}</div>
        <span className={`priority-badge priority-${recommendation.priority.toLowerCase()}`}>
          {recommendation.priority} Priority
        </span>
      </div>

      <div className="recommendation-content">
        <h5 className="recommendation-action">{recommendation.action}</h5>
        <p className="recommendation-reasoning">{recommendation.reasoning}</p>
      </div>

      {recommendation.related_insights.length > 0 && (
        <details className="related-insights-inline">
          <summary className="related-insights-summary">
            <span className="related-Count-badge">{recommendation.related_insights.length}</span>
            <span className="related-summary-text">View related insights</span>
          </summary>
          <div className="related-insights-content">
            <ul className="related-insights-list">
              {recommendation.related_insights.map((insightIdx) => {
                const insight = insights[insightIdx];
                if (!insight) return null;

                return (
                  <li key={insightIdx} className="related-insight-item">
                    <div className="insight-item-header">
                      <a
                        href={`#insight-${insightIdx}`}
                        onClick={(e) => onScrollToInsight(e, insightIdx)}
                        className="insight-item-title"
                      >
                        {insight.finding}
                      </a>
                      <span className="insight-item-category">{insight.category}</span>
                      <span className={`insight-item-severity severity-${insight.severity?.toLowerCase()}`}>
                        {insight.severity}
                      </span>
                    </div>
                    <p className="related-evidence">{insight.evidence}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </details>
      )}
    </div>
  );
}
