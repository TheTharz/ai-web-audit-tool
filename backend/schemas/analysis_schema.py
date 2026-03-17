from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class AnalyzeRequest(BaseModel):
    url: str = Field(description="Target webpage URL to audit")


# --- Core Insight Model ---
class AuditInsight(BaseModel):
    dedup_key: Optional[str] = Field(
        description="Normalized identifier for deduplication (e.g., 'missing_alt_text', 'low_cta_count')"
    )
    
    category: Literal["SEO", "Performance", "Accessibility", "UX", "Conversion", "Content"] = Field(
        description="Audit category"
    )

    finding: str = Field(
        description="Clear, specific observation grounded in metrics"
    )

    evidence: str = Field(
        description="Exact supporting data (numbers, percentages, counts)"
    )

    impact: str = Field(
        description="Business or user impact of this issue"
    )

    severity: Literal["Low", "Moderate", "High", "Critical"] = Field(
        description="Severity level based on impact and scale"
    )


# --- Recommendation Model ---
class Recommendation(BaseModel):
    priority: Literal["Low", "Medium", "High"] = Field(
        description="Implementation priority"
    )

    action: str = Field(
        description="Clear, actionable step"
    )

    reasoning: str = Field(
        description="Why this action is recommended based on findings"
    )

    related_insight: Optional[int] = Field(
        description="Index of the related insight this recommendation addresses"
    )

# --- Final Report ---
class AuditReport(BaseModel):
    insights: List[AuditInsight]
    recommendations: List[Recommendation]