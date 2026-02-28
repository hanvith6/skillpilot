from fastapi import APIRouter, Depends, HTTPException
from app.services.auth import get_current_user
from app.services.llm.router import get_llm_router
from app.services.prompts import (
    build_safe_prompt, parse_json_result, filter_output,
    RESUME_PROMPT, PROJECT_PROMPT, ENGLISH_PROMPT, INTERVIEW_PROMPT,
)
from app.services.credits import calculate_credits_needed, save_generation
from app.models.generation import ResumeRequest, ProjectRequest, EnglishRequest, InterviewRequest
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/generate", tags=["generation"])


@router.post("/resume")
async def generate_resume(request: ResumeRequest, current_user: dict = Depends(get_current_user)):
    credits_needed = calculate_credits_needed("resume", request.emergent_mode)

    if current_user["credits"] < credits_needed:
        raise HTTPException(status_code=402, detail="Insufficient credits")

    prompt = build_safe_prompt(RESUME_PROMPT, {
        "target_role": request.target_role,
        "country": request.country,
        "resume_text": request.resume_text,
    })

    temperature = 0.3 if request.emergent_mode else 0.7
    max_tokens = 1500 if request.emergent_mode else 2000

    try:
        llm = get_llm_router()
        result = await llm.generate(prompt, temperature, max_tokens)
        result = filter_output(result)
        result_json = parse_json_result(result, {
            "summary": result, "skills": [], "experience": [], "education": [], "projects": [], "keywords": []
        })
        history_id = await save_generation(
            current_user["id"], "Resume",
            f"{request.target_role} - {request.country}",
            result_json, credits_needed
        )
        return {
            "success": True, "data": result_json,
            "credits_used": credits_needed, "history_id": history_id
        }
    except Exception as e:
        logger.error(f"Resume generation error: {e}")
        raise HTTPException(status_code=500, detail="Generation failed")


@router.post("/project")
async def generate_project(request: ProjectRequest, current_user: dict = Depends(get_current_user)):
    credits_needed = calculate_credits_needed("project", request.emergent_mode)

    if current_user["credits"] < credits_needed:
        raise HTTPException(status_code=402, detail="Insufficient credits")

    prompt = build_safe_prompt(PROJECT_PROMPT, {
        "topic": request.topic,
        "branch": request.branch,
    })

    temperature = 0.3 if request.emergent_mode else 0.7
    max_tokens = 1500 if request.emergent_mode else 2000

    try:
        llm = get_llm_router()
        result = await llm.generate(prompt, temperature, max_tokens)
        result = filter_output(result)
        result_json = parse_json_result(result, {
            "abstract": result, "problem_statement": "", "objectives": [], "modules": []
        })
        history_id = await save_generation(
            current_user["id"], "Project", request.topic,
            result_json, credits_needed
        )
        return {
            "success": True, "data": result_json,
            "credits_used": credits_needed, "history_id": history_id
        }
    except Exception as e:
        logger.error(f"Project generation error: {e}")
        raise HTTPException(status_code=500, detail="Generation failed")


@router.post("/english")
async def generate_english(request: EnglishRequest, current_user: dict = Depends(get_current_user)):
    credits_needed = calculate_credits_needed("english", request.emergent_mode)

    if current_user["credits"] < credits_needed:
        raise HTTPException(status_code=402, detail="Insufficient credits")

    prompt = build_safe_prompt(ENGLISH_PROMPT, {"text": request.text})

    temperature = 0.3 if request.emergent_mode else 0.7
    max_tokens = 1500 if request.emergent_mode else 2000

    try:
        llm = get_llm_router()
        result = await llm.generate(prompt, temperature, max_tokens)
        result = filter_output(result)
        result_json = parse_json_result(result, {
            "formal": result, "semi_formal": result, "simple": result
        })
        history_id = await save_generation(
            current_user["id"], "English", "Text Improvement",
            result_json, credits_needed
        )
        return {
            "success": True, "data": result_json,
            "credits_used": credits_needed, "history_id": history_id
        }
    except Exception as e:
        logger.error(f"English generation error: {e}")
        raise HTTPException(status_code=500, detail="Generation failed")


@router.post("/interview")
async def generate_interview(request: InterviewRequest, current_user: dict = Depends(get_current_user)):
    credits_needed = calculate_credits_needed("interview", request.emergent_mode)

    if current_user["credits"] < credits_needed:
        raise HTTPException(status_code=402, detail="Insufficient credits")

    prompt = build_safe_prompt(INTERVIEW_PROMPT, {
        "question_type": request.question_type,
        "background": request.background or "Fresh graduate in computer science",
    })

    temperature = 0.3 if request.emergent_mode else 0.7
    max_tokens = 1500 if request.emergent_mode else 2000

    try:
        llm = get_llm_router()
        result = await llm.generate(prompt, temperature, max_tokens)
        result = filter_output(result)
        result_json = parse_json_result(result, {
            "answer": result, "delivery_notes": ""
        })
        history_id = await save_generation(
            current_user["id"], "Interview", request.question_type,
            result_json, credits_needed
        )
        return {
            "success": True, "data": result_json,
            "credits_used": credits_needed, "history_id": history_id
        }
    except Exception as e:
        logger.error(f"Interview generation error: {e}")
        raise HTTPException(status_code=500, detail="Generation failed")
