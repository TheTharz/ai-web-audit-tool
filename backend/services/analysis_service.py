import logging
import os
import json
from google import genai
from schemas.analysis_schema import AuditInsightSet, PrioritizedRecommendationSet
from services.scraper_service import scrape_url
from utility.instruction_utility import load_instruction

logger = logging.getLogger(__name__)

async def perform_full_analysis(url: str) -> dict:
    """
    Two-stage analysis pipeline:
    Stage 1: Extract insights from metrics (insights only, no recommendations)
    Stage 2: Synthesize insights into 3–5 high-impact, prioritized recommendations
    """
    metrics = await scrape_url(url)
    
    # Stage 1: Generate insights only
    insight_set = await generate_ai_insights(metrics)
    
    # Deduplicate insights based on dedup_key and track index shifts
    unique_insights = []
    seen_keys = {} # dedup_key -> new_index
    index_mapping = {} # old_index -> new_index
    
    for old_idx, insight in enumerate(insight_set.insights):
        if insight.dedup_key and insight.dedup_key in seen_keys:
            # Map duplicate's old index to the new index of the kept insight
            index_mapping[old_idx] = seen_keys[insight.dedup_key]
            continue
            
        new_idx = len(unique_insights)
        if insight.dedup_key:
            seen_keys[insight.dedup_key] = new_idx
            
        index_mapping[old_idx] = new_idx
        unique_insights.append(insight)
        
    insight_set.insights = unique_insights
    
    # Stage 2: Prioritize insights into strategic recommendations
    prioritized_recs = await generate_prioritized_recommendations(
        metrics=metrics,
        insights=insight_set.insights
    )
    
    ai_report_data = {
        "insights": [insight.model_dump() for insight in insight_set.insights],
        "recommendations": [rec.model_dump() for rec in prioritized_recs.recommendations]
    }
    
    return {
        "factual_metrics": metrics,
        "ai_analysis": ai_report_data
    }

async def generate_ai_insights(data: dict) -> AuditInsightSet:
    """
    Stage 1: Generate insights only from page metrics.
    No recommendations are generated in this stage.
    """
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    
    system_instruction = load_instruction("system_instruction.txt")

    user_prompt_template = load_instruction("user_prompt.txt")
    user_prompt = user_prompt_template.format(**data)

    logger.info("Stage 1 - System Prompt: %s", system_instruction)
    logger.info("Stage 1 - User Prompt: %s", user_prompt)

    # Call Gemini with Structured Output configuration
    response = client.models.generate_content(
        model=os.getenv("MODEL"),
        contents=user_prompt,
        config={
            "system_instruction": system_instruction,
            "response_mime_type": "application/json",
            "response_schema": AuditInsightSet,
        }
    )

    logger.info("Stage 1 - Insights output: %s", response.text)

    return response.parsed


async def generate_prioritized_recommendations(metrics: dict, insights: list) -> PrioritizedRecommendationSet:
    """
    Stage 2: Takes insights from Stage 1 and generates 3–5 
    high-impact, prioritized recommendations.
    """
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    
    system_instruction = load_instruction("recommendation_system_instruction.txt")
    user_prompt_template = load_instruction("recommendation_user_prompt.txt")
    
    # Serialize insights to JSON for the prompt
    insights_json = json.dumps(
        [insight.model_dump() for insight in insights],
        indent=2
    )
    
    # Format user prompt with metrics and serialized insights
    user_prompt = user_prompt_template.format(
        meta_title=metrics.get("meta_title", ""),
        word_count=metrics.get("word_count", 0),
        headings=metrics.get("headings", {}),
        total_images=metrics.get("total_images", 0),
        alt_missing_percent=metrics.get("alt_missing_percent", 0),
        internal_links=metrics.get("internal_links", 0),
        external_links=metrics.get("external_links", 0),
        cta_count=metrics.get("cta_count", 0),
        meta_description=metrics.get("meta_description", ""),
        raw_insights_json=insights_json
    )
    
    logger.info("Stage 2 - System Prompt: %s", system_instruction)
    logger.info("Stage 2 - User Prompt: %s", user_prompt)
    
    # Call Gemini with Structured Output for prioritized recommendations
    response = client.models.generate_content(
        model=os.getenv("MODEL"),
        contents=user_prompt,
        config={
            "system_instruction": system_instruction,
            "response_mime_type": "application/json",
            "response_schema": PrioritizedRecommendationSet,
        }
    )
    
    logger.info("Stage 2 - Prioritized recommendations output: %s", response.text)
    
    return response.parsed
