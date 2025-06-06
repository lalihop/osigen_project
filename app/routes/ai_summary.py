from fastapi import APIRouter, HTTPException
from database import task_collection, ai_collection
from datetime import datetime
import os
from bson import ObjectId
from bson.errors import InvalidId
from services.ai_summary_runner import run_ai_summary

router = APIRouter()


@router.post("/ai/summarize/{task_id}")
async def summarize_ai_result(task_id: str):
    try:
        summary_id = await run_ai_summary(task_id)
        return {"message": "요약 성공", "summary_id": summary_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 요약 처리 중 오류: {str(e)}")

@router.get("/ai/summarize/{ai_summary_id}")
async def get_ai_summary(ai_summary_id: str):
    try:
        obj_id = ObjectId(ai_summary_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="유효하지 않은 ObjectId입니다.")

    doc = await ai_collection.find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(status_code=404, detail="AI 요약 결과가 없습니다.")

    return {
        "task_id": doc.get("task_id"),
        "domain": doc.get("domain"),
        "summary": doc.get("summary", []),
        "prompt_examples": doc.get("prompt_examples", []),
        "created_at": doc.get("created_at")
    }


# @router.post("/ai/resummarize/{task_id}")
# async def resummarize_ai_result(task_id: str):
#     """
#     기존 Gemini 요약 삭제 후 재요약
#     """
#     await ai_collection.delete_many({"task_id": task_id})
#     return await summarize_ai_result(task_id)
