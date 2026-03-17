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

class AuditInsightSet(BaseModel):
    insights: List[AuditInsight] = Field(
        description="List of audit insights extracted from page metrics"
    )


# --- Stage 2: Prioritized Recommendation Model ---
class PrioritizedRecommendation(BaseModel):
    priority: Literal["Low", "Medium", "High"] = Field(
        description="Implementation priority (High / Medium / Low)"
    )

    action: str = Field(
        description="Specific, actionable directive (1–2 sentences)"
    )

    reasoning: str = Field(
        description="Strategic rationale: why this matters, linked to evidence and business outcome"
    )

    related_insights: List[int] = Field(
        default_factory=list,
        description="List of insight indices this recommendation addresses"
    )


# --- Stage 2: Final Prioritized Report ---
class PrioritizedRecommendationSet(BaseModel):
    recommendations: List[PrioritizedRecommendation] = Field(
        description="3–5 high-impact, prioritized recommendations"
    )


# --- Stage 1: Final Report (legacy, kept for compatibility) ---
class AuditReport(BaseModel):
    insights: List[AuditInsight]
    recommendations: List[PrioritizedRecommendation]