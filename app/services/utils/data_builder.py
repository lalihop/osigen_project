from database import task_collection, ai_collection
from pathlib import Path
from datetime import datetime
import json
from collections import Counter
from urllib.parse import urlparse
from collections import defaultdict

# 🧩 가이드라인 JSON 로딩
GUIDELINE_PATH = Path("static/guideline.json")  # 실제 위치에 따라 수정
with open(GUIDELINE_PATH, "r", encoding="utf-8") as f:
    GUIDELINES = json.load(f)


async def build_structured_vuln_data(task_id: str) -> dict:
    # ✅ 데이터베이스 조회
    task = await task_collection.find_one({"_id": task_id})
    if not task:
        raise ValueError("task를 찾을 수 없습니다.")
    
    ai = await ai_collection.find_one({"task_id": task_id})
    if not ai:
        raise ValueError("ai summary를 찾을 수 없습니다.")
    
    
    zap_result = task.get("result", {}).get("zap", {})
    zap_details = []

    # 도메인(URL)별로 취약점 리스트를 평탄화
    for url_key, issue_list in zap_result.items():
        if isinstance(issue_list, list):
            zap_details.extend(issue_list)

    subdomains = task.get("result", {}).get("subdomains", [])
    target = task.get("primary_url") or task.get("domain") or ""

    # 🧠 상세 정보 구성
    structured_details = []

    for item in zap_details:
        if not isinstance(item, dict):
            continue

        name = item.get("name", "")
        guideline = GUIDELINES.get(name, {})

        examples = {
            key: value
            for key, value in guideline.items()
            if key.startswith("example_")
        }

        structured_details.append({
            "name": name,
            "translated": guideline.get("translated", name),
            "risk": item.get("risk", ""),
            "url": item.get("url", ""),
            "evidence": item.get("evidence", ""),
            "description": guideline.get("description", ""),
            "solution_guidelines": guideline.get("solution_guidelines", []),
            "examples": examples,
        })

        # 🧩 서브도메인별 취약점 목록 구성
        subdomain_map = defaultdict(list)

        for item in structured_details:
            domain = "(알 수 없음)"
            try:
                parsed = urlparse(item.get("url", ""))
                domain = parsed.hostname or domain
            except:
                pass
            subdomain_map[domain].append({
                "name": item["translated"] or item["name"],
                "risk": item["risk"],
                "description": item["description"]
            })

        subdomain_findings = [
            {"domain": domain, "alerts": alerts}
            for domain, alerts in subdomain_map.items()
        ]


    # 1️⃣ 심각도별 통계
    severity_counter = Counter(item.get("risk", "Unknown") for item in structured_details)

    # 2️⃣ 취약점 이름별 통계
    vuln_name_counter = Counter(item.get("translated", item.get("name", "Unknown")) for item in structured_details)

    # top 5만 추출
    top_vulns = [{"name": name, "count": count} for name, count in vuln_name_counter.most_common(5)]

    # details 기반으로 자동 집계
    severity_counts = dict(Counter(item.get("risk", "Unknown") for item in structured_details))

    # 📦 전체 데이터 구성
    structured_data = {
        "target": target,
        "created_at": task.get("created_at", datetime.utcnow()).strftime("%Y-%m-%d %H:%M"),
        "analysis_type": task.get("type", "unknown"),
        "zap_summary": {
            "severity_counts": dict(severity_counter),
            "top_vulns": top_vulns
        },
        "ai_summary": {
            "summary": ai.get("summary", []),
            "prompt_examples": ai.get("prompt_examples", [])
        },
        "details": structured_details,
        "subdomains": subdomains,
        "subdomain_findings": subdomain_findings,
    }

    return structured_data
