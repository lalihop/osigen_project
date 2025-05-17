from fastapi import APIRouter, HTTPException
from datetime import datetime
from bson import ObjectId
from services.validators import determine_primary_url
from models import AnalyzeRequest
from database import task_collection
from services.crawler.controller import run_all
from services.zap_project.zap_scan import run_zap_scan
import asyncio

router = APIRouter()

@router.post("/analyze")
async def analyze(request: AnalyzeRequest):
    try:
        result = determine_primary_url(request.domain)

        if result["primary_url"] is None:
            raise HTTPException(status_code=400, detail="도메인을 다시 입력해주세요.")

        task_id = str(ObjectId())

        await task_collection.insert_one({
            "_id": task_id,
            "domain": request.domain,
            "primary_url": result["primary_url"],
            "attempts": result["attempts"],
            "type": request.analysis_type,
            "status": "processing",
            "created_at": datetime.utcnow(),
            "result": None
        })

        # ✅ 분석 유형에 따라 비동기 작업 분기
        if request.analysis_type == "full":
            asyncio.create_task(crawl_and_scan(task_id, request.domain))
        else:
            asyncio.create_task(quick_scan(task_id, result["primary_url"]))

        return {"status": "submitted", "task_id": task_id}

    except Exception as e:
        print("[분석 요청 처리 실패]", str(e))
        raise HTTPException(status_code=500, detail="분석 요청 처리 중 오류가 발생했습니다.")


# ✅ 통합 분석: 크롤러 + ZAP
async def crawl_and_scan(task_id: str, domain: str):
    try:
        result = await run_all(domain)
        subdomains = result["subdomains"]

        zap_results = {}

        for sub in subdomains:
            try:
                zap_results[sub] = await run_zap_scan(sub)
            except Exception as zap_error:
                zap_results[sub] = [{"error": str(zap_error)}]

        await task_collection.update_one(
            {"_id": task_id},
            {"$set": {
                "status": "done",
                "result": {
                    "crawler": result,
                    "zap": zap_results,
                }
            }}
        )
    except Exception as e:
        await task_collection.update_one(
            {"_id": task_id},
            {"$set": {
                "status": "error",
                "result": {"error": str(e)}
            }}
        )


# ✅ 빠른 분석: ZAP만 실행
async def quick_scan(task_id: str, target_url: str):
    try:
        zap_results = {}

        zap_results[target_url] = await run_zap_scan(target_url)

        await task_collection.update_one(
            {"_id": task_id},
            {"$set": {
                "status": "done",
                "result": {
                    "crawler": None,
                    "zap": zap_results,
                }
            }}
        )
    except Exception as e:
        await task_collection.update_one(
            {"_id": task_id},
            {"$set": {
                "status": "error",
                "result": {"error": str(e)}
            }}
        )


# ✅ 상태 조회 API
@router.get("/analyze/status/{task_id}")
async def get_status(task_id: str):
    task = await task_collection.find_one({"_id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="작업을 찾을 수 없습니다.")
    return {"task_id": task_id, "status": task["status"]}


# ✅ 결과 조회 API
@router.get("/analyze/result/{task_id}")
async def get_result(task_id: str):
    task = await task_collection.find_one({"_id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="작업을 찾을 수 없습니다.")

    if task["status"] != "done":
        return {"status": "processing", "message": "분석이 아직 완료되지 않았습니다."}

    return {"status": "done", "result": task["result"]}
