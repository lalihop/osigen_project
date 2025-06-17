from database import task_collection, ai_collection
from services.gemini.summarizer import summarize_zap_report
from datetime import datetime

async def run_ai_summary(task_id: str) -> str:
    print(f"ruan_ai_summary 진입함")
    task = await task_collection.find_one({"_id": task_id})
    if not task or task["status"] != "done":
        raise ValueError("유효하지 않거나 완료되지 않은 task입니다.")

    zap_results = task.get("result", {}).get("zap", {})
    if not zap_results:
        raise ValueError("ZAP 결과가 없습니다.")

    zap_data = []
    for alerts in zap_results.values():
        zap_data.extend(alerts)

    if not zap_data:
        raise ValueError("ZAP 결과가 비어 있습니다.")

    domain_list = list(zap_results.keys())
    base_domain = domain_list[0].replace("http://", "").replace("https://", "").replace("/", "")

    result = summarize_zap_report(zap_data, base_domain)
    summary = result.get("summary", {})
    if not isinstance(summary, dict):
        raise ValueError("AI 요약 형식 오류")

    insert_result = await ai_collection.insert_one({
        "task_id": task_id,
        "domain": result.get("domain"),
        "summary": summary.get("key_vulnerabilities", []),
        "prompt_examples": summary.get("prompt_examples", []),
        "created_at": datetime.utcnow()
    })

    await task_collection.update_one(
        {"_id": task_id},
        {"$set": {"ai_summary_id": str(insert_result.inserted_id)}}
    )

    return str(insert_result.inserted_id)
