import logging
import os
from google import genai
from schemas.analysis_schema import AuditReport
from services.scraper_service import scrape_url
from utility.instruction_utility import load_instruction

logger = logging.getLogger(__name__)

async def perform_full_analysis(url: str) -> dict:
    metrics = await scrape_url(url)
    ai_report_object = await generate_ai_insights(metrics)
    
    # 1. Deduplicate insights based on dedup_key and track index shifts
    unique_insights = []
    seen_keys = {} # dedup_key -> new_index
    index_mapping = {} # old_index -> new_index
    
    for old_idx, insight in enumerate(ai_report_object.insights):
        if insight.dedup_key and insight.dedup_key in seen_keys:
            # Map duplicate's old index to the new index of the kept insight
            index_mapping[old_idx] = seen_keys[insight.dedup_key]
            continue
            
        new_idx = len(unique_insights)
        if insight.dedup_key:
            seen_keys[insight.dedup_key] = new_idx
            
        index_mapping[old_idx] = new_idx
        unique_insights.append(insight)
        
    ai_report_object.insights = unique_insights
    
    # 2. Update recommendation indices and deduplicate them by action
    unique_recs = []
    seen_actions = set()
    
    for rec in ai_report_object.recommendations:
        # Update pointer if the insight was shifted or deduplicated
        if rec.related_insight is not None and rec.related_insight in index_mapping:
            rec.related_insight = index_mapping[rec.related_insight]
                
        action_normalized = rec.action.lower().strip()
        if action_normalized not in seen_actions:
            seen_actions.add(action_normalized)
            unique_recs.append(rec)
            
    ai_report_object.recommendations = unique_recs
    
    ai_report_data = ai_report_object.model_dump()
    
    return {
        "factual_metrics": metrics,
        "ai_analysis": ai_report_data
    }

async def generate_ai_insights(data: dict):
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    
    system_instruction = load_instruction("system_instruction.txt")

    user_prompt_template = load_instruction("user_prompt.txt")
    user_prompt = user_prompt_template.format(**data)

    logger.info("System Prompt: %s", system_instruction)
    logger.info("User Prompt: %s", user_prompt)

    # Call Gemini with Structured Output configuration
    response = client.models.generate_content(
        model=os.getenv("MODEL"),
        contents=user_prompt,
        config={
            "system_instruction": system_instruction,
            "response_mime_type": "application/json",
            "response_schema": AuditReport,
        }
    )

    logger.info("AI raw output: %s", response.text)

    return response.parsed
