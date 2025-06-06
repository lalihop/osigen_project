from fastapi import APIRouter, HTTPException
from database import task_collection, ai_collection
from services.gemini.summarizer import summarize_zap_report # save_summary_json
from datetime import datetime
import os
from bson import ObjectId
from bson.errors import InvalidId

router = APIRouter()


@router.post("/ai/summarize/{task_id}")
async def summarize_ai_result(task_id: str):
    """
    ZAP 결과들을 하나로 합쳐서 Gemini 요약 수행 + DB 저장 + 결과 반환
    """
    task = await task_collection.find_one({"_id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="해당 작업을 찾을 수 없습니다.")

    if task["status"] != "done":
        raise HTTPException(status_code=400, detail="분석이 아직 완료되지 않았습니다.")

    zap_results = task["result"].get("zap", {})
    if not zap_results:
        raise HTTPException(status_code=400, detail="ZAP 결과가 없습니다.")

    try:
        # 1. 모든 도메인의 zap 결과를 하나로 합침
        zap_data = []
        for alerts in zap_results.values():
            zap_data.extend(alerts)

        if not zap_data:
            raise ValueError("ZAP 결과가 비어 있습니다.")

        # 2. 대표 도메인 추출 (파일명 생성용)
        domain_list = list(zap_results.keys())
        base_domain = domain_list[0].replace("http://", "").replace("https://", "").replace("/", "")

        # 3. Gemini 요약 수행
        result = summarize_zap_report(zap_data, base_domain)
        # save_path = save_summary_json(result["summary"], result["domain"], result["timestamp"])

        # 4. 요약 DB에 저장
        insert_result = await ai_collection.insert_one({
            "task_id": task_id,
            "domain": result["domain"],
            "summary": result["summary"].get("key_vulnerabilities", []),
            "prompt_examples": result["summary"].get("prompt_examples", []),
            "created_at": datetime.utcnow()
        })

        await task_collection.update_one(
            {"_id": task_id},
            {"$set": {"ai_summary_id": str(insert_result.inserted_id)}}
        )

        return {
            "message": "요약 성공",
            "summary": result["summary"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 요약 처리 중 오류: {str(e)}")


@router.get("/ai/summarize/{ai_summary_id}")
async def get_ai_summary(ai_summary_id: str):
    """
    AI 요약 결과 조회
    """
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
