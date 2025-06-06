from fastapi import APIRouter, HTTPException
from datetime import datetime
from bson import ObjectId
from services.validators import determine_primary_url
from models import AnalyzeRequest
from database import task_collection, ai_collection 
from services.crawler.controller import run_all
from services.zap_project.zap_scan import run_zap_scan
import asyncio
from routes.ai_summary import summarize_ai_result
from fastapi import Request
from fastapi.responses import FileResponse
from services.pdf_export import generate_pdf_report
from pathlib import Path
import uuid
from services.utils.data_builder import build_structured_vuln_data

router = APIRouter()

def clean_url(url: str) -> str:
    if not url or not isinstance(url, str):
        return "N/A"
    if "javascript:" in url.lower():
        return "N/A"
    return url

def trim(text: str, max_len: int = 300):
    return text[:max_len] + "..." if text and len(text) > max_len else text

def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0]
    return request.client.host

@router.post("/analyze")
async def analyze(request: Request, analyze_req: AnalyzeRequest):
    try:
        result = determine_primary_url(analyze_req.domain)

        if result["primary_url"] is None:
            raise HTTPException(status_code=400, detail="도메인을 다시 입력해주세요.")

        task_id = str(ObjectId())
        client_ip = get_client_ip(request)

        await task_collection.insert_one({
            "_id": task_id,
            "domain": analyze_req.domain,
            "primary_url": result["primary_url"],
            "attempts": result["attempts"],
            "type": analyze_req.analysis_type,
            "status": "processing",
            "created_at": datetime.utcnow(),
            "client_ip": client_ip,
            "result": None
        })

        # ✅ 분석 유형에 따라 비동기 작업 분기
        if analyze_req.analysis_type == "full":
            asyncio.create_task(crawl_and_scan(task_id, analyze_req.domain))
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
                zap_results[sub] = await run_zap_scan(sub, task_id)
            except Exception as zap_error:
                zap_results[sub] = [{"error": str(zap_error)}]

        # ✅ AI 요약 자동 실행
        try:
            await summarize_ai_result(task_id)
            print(f"[*] AI 요약 자동 생성 완료 (task_id: {task_id})")
        except Exception as ai_error:
            print(f"[!] AI 요약 자동 생성 실패 (task_id: {task_id}):", ai_error)

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

        zap_results[target_url] = await run_zap_scan(target_url, task_id)

        # ✅ AI 요약 자동 실행
        try:
            await summarize_ai_result(task_id)
            print(f"[*] AI 요약 자동 생성 완료 (task_id: {task_id})")
        except Exception as ai_error:
            print(f"[!] AI 요약 자동 생성 실패 (task_id: {task_id}):", ai_error)

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
    return {"task_id": task_id, "status": task["status"], "progress": task.get("progress", "")}


# ✅ 결과 조회 API
# @router.get("/analyze/result/{task_id}")
# async def get_result(task_id: str):
#     task = await task_collection.find_one({"_id": task_id})
#     if not task:
#         raise HTTPException(status_code=404, detail="작업을 찾을 수 없습니다.")

#     if task["status"] != "done":
#         return {"status": "processing", "message": "분석이 아직 완료되지 않았습니다."}

#     return {"status": "done", "type": task["type"], "result": task["result"], "ai_summary_id": task["ai_summary_id"]}
@router.get("/analyze/result/{task_id}")
async def get_result(task_id: str):
    task = await task_collection.find_one({"_id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="작업을 찾을 수 없습니다.")

    if task["status"] != "done":
        return {"status": "processing", "message": "분석이 아직 완료되지 않았습니다."}

    # ✅ 통합 구조화 함수 호출
    structured_data = await build_structured_vuln_data(task_id)
    return {"status": "done", "result": structured_data}


@router.get("/admin/logs")
async def get_admin_logs():
    tasks = await task_collection.find({}, {
        "_id": 1,
        "domain": 1,
        "type": 1,
        "status": 1,
        "created_at": 1,
        "client_ip":1
    }).sort("created_at", -1).to_list(length=1000)

    for task in tasks:
        task["_id"] = str(task["_id"])

    return {"logs": tasks}

@router.get("/tasks/{task_id}/export/json")
async def export_json(task_id: str):
    task = await task_collection.find_one({"_id": task_id})
    if not task or task["status"] != "done":
        raise HTTPException(status_code=404, detail="분석 결과를 찾을 수 없습니다.")

    return task.get("result", {})

@router.get("/tasks/{task_id}/export/pdf")
async def export_pdf(task_id: str):
    task = await task_collection.find_one({"_id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="작업을 찾을 수 없습니다.")

    if task["status"] != "done":
        raise HTTPException(status_code=400, detail="분석이 아직 완료되지 않았습니다.")

    # ✅ 구조화된 데이터 생성
    data = await build_structured_vuln_data(task_id)

    raw_target = task.get("target") or task.get("primary_url") or task.get("domain") or "unknown"
    safe_name = raw_target.replace("https://", "").replace("http://", "").replace("/", "_")
    filename = f"{safe_name}_{uuid.uuid4().hex[:8]}.pdf"
    output_path = Path("generated_reports") / filename
    output_path.parent.mkdir(parents=True, exist_ok=True)

    generate_pdf_report(data, output_path)
    return FileResponse(path=output_path, filename=filename, media_type="application/pdf")