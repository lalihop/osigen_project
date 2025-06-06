# zap_scan.py
import sys
import os
import time
import json
from zapv2 import ZAPv2
from database import task_collection

# --- 설정 ---
ZAP_API_KEY = "changeme"  # docker-compose에서 설정한 키와 동일하게
ZAP_ADDRESS = "localhost"
ZAP_PORT = 8080

zap = ZAPv2(
    apikey=ZAP_API_KEY,
    proxies={
        'http': f'http://{ZAP_ADDRESS}:{ZAP_PORT}',
        'https': f'http://{ZAP_ADDRESS}:{ZAP_PORT}'
    }
)

async def run_zap_scan(target: str, task_id: str = None) -> list:
    if not target.startswith("http://") and not target.startswith("https://"):
        target = "http://" + target

    clean_target = target.replace("http://", "").replace("https://", "").replace("/", "")
    print(f"[*] 대상 URL: {target}")

    zap.urlopen(target)
    time.sleep(2)

    print("[*] Spider 시작")
    scan_id = zap.spider.scan(target)
    while int(zap.spider.status(scan_id)) < 100:
        percent = int(zap.spider.status(scan_id))
        print(f"  - Spider 진행중: {percent}%")
        if task_id:
            await task_collection.update_one(
                {"_id": task_id},
                {"$set": {
                    "progress": {"stage": "Spider 진행 중...", "percent": percent}
                }}
            )
        time.sleep(2)

    print("[*] Active Scan 시작")
    zap.ascan.set_policy_attack_strength("High", "Default Policy")
    zap.ascan.set_policy_alert_threshold("Low", "Default Policy")
    ascan_id = zap.ascan.scan(target, recurse=True)
    
    while int(zap.ascan.status(ascan_id)) < 100:
        percent = int(zap.ascan.status(ascan_id))
        print(f"  - Active Scan 진행중: {percent}%")
        if task_id:
            await task_collection.update_one(
                {"_id": task_id},
                {"$set": {
                    "progress": {"stage": "Active Scan 진행 중...", "percent": percent}
                }}
            )
        time.sleep(5)

    # 완료 처리
    if task_id:
        await task_collection.update_one(
            {"_id": task_id},
            {"$set": {
                "progress": {"stage": "분석 완료", "percent": 100}
            }}
        )

    alerts = [alert for alert in zap.core.alerts(baseurl=target) if alert.get("risk") != "Informational"]

    os.makedirs("reports", exist_ok=True)
    json_path = os.path.join("reports", f"{clean_target}_zap_report.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(alerts, f, indent=2, ensure_ascii=False)

    return alerts