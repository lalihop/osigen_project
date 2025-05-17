# zap_scan.py
import sys
import os
import time
import json
from zapv2 import ZAPv2

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

# # --- 입력 처리 ---
# if len(sys.argv) < 2:
#     print("사용법: python zap_scan.py [타겟 URL]")
#     sys.exit(1)

# target = sys.argv[1]
# if not target.startswith("http://") and not target.startswith("https://"):
#     target = "http://" + target

# clean_target = target.replace("http://", "").replace("https://", "").replace("/", "")

# print(f"[*] 대상 URL: {target}")

# # --- 스캔 시작 ---
# zap.urlopen(target)
# time.sleep(2)

# print("[*] Spider 시작")
# scan_id = zap.spider.scan(target)
# while int(zap.spider.status(scan_id)) < 100:
#     print(f"  - Spider 진행중: {zap.spider.status(scan_id)}%")
#     time.sleep(2)
# print("[+] Spider 완료")

# print("[*] Active Scan 시작")
# zap.ascan.set_policy_attack_strength("Insane", "Default Policy")
# zap.ascan.set_policy_alert_threshold("Low", "Default Policy")
# ascan_id = zap.ascan.scan(target, recurse=True)
# while int(zap.ascan.status(ascan_id)) < 100:
#     print(f"  - Active Scan 진행중: {zap.ascan.status(ascan_id)}%")
#     time.sleep(5)
# print("[+] Active Scan 완료")

# # --- 위험도 'Informational' 제외한 경고만 수집 ---
# alerts = [alert for alert in zap.core.alerts(baseurl=target) if alert.get("risk") != "Informational"]
# print(f"[+] 탐지된 취약점 수 (정보성 제외): {len(alerts)}")

# os.makedirs("reports", exist_ok=True)
# json_path = os.path.join("reports", f"{clean_target}_zap_report.json")
# with open(json_path, "w", encoding="utf-8") as f:
#     json.dump(alerts, f, indent=2, ensure_ascii=False)
# print(f"[+] JSON 리포트 저장됨: {json_path}")

async def run_zap_scan(target: str) -> list:
    if not target.startswith("http://") and not target.startswith("https://"):
        target = "http://" + target

    clean_target = target.replace("http://", "").replace("https://", "").replace("/", "")
    print(f"[*] 대상 URL: {target}")

    zap.urlopen(target)
    time.sleep(2)

    print("[*] Spider 시작")
    scan_id = zap.spider.scan(target)
    while int(zap.spider.status(scan_id)) < 100:
        print(f"  - Spider 진행중: {zap.spider.status(scan_id)}%")
        time.sleep(2)

    print("[*] Active Scan 시작")
    zap.ascan.set_policy_attack_strength("High", "Default Policy")
    zap.ascan.set_policy_alert_threshold("Low", "Default Policy")
    ascan_id = zap.ascan.scan(target, recurse=True)
    while int(zap.ascan.status(ascan_id)) < 100:
        print(f"  - Active Scan 진행중: {zap.ascan.status(ascan_id)}%")
        time.sleep(5)

    alerts = [alert for alert in zap.core.alerts(baseurl=target) if alert.get("risk") != "Informational"]

    os.makedirs("reports", exist_ok=True)
    json_path = os.path.join("reports", f"{clean_target}_zap_report.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(alerts, f, indent=2, ensure_ascii=False)

    return alerts