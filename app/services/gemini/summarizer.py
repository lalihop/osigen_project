import json
import os
import re
from datetime import datetime
from typing import Optional, List, Dict

import google.generativeai as genai

# Gemini 설정 (환경 변수에서 API 키 로딩 권장)
genai.configure(api_key=os.getenv("GEMINI_API_KEY", "AIzaSyCzFOVfhtmhkITu103X6aotOF1pRWeaUFs"))
model = genai.GenerativeModel("gemini-2.0-flash")


def extract_json_from_codeblock(text: str) -> Optional[dict]:
    """
    AI 응답에서 JSON을 추출
    """
    pattern = re.compile(r"```(?:json)?\s*(\{.*?\})\s*```", re.DOTALL)
    match = pattern.search(text)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            print("[!] 코드블록 내부 JSON 파싱 실패")
            return None

    try:
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(text[start:end+1])
    except json.JSONDecodeError:
        print("[!] 일반 텍스트 JSON 파싱 실패")
    print("[!] JSON 추출 실패")
    return None


def preprocess_zap_data(zap_data: List[Dict]) -> List[Dict]:
    """
    ZAP 결과 중 위험도가 Medium 이상인 항목만 추출하고,
    Gemini가 요약에 필요한 필드만 남긴다.
    """
    return [
        {
            "name": item.get("name", ""),
            "risk": item.get("risk", ""),
            "description": item.get("description", ""),
            "cweid": item.get("cweid", "")
        }
        for item in zap_data
        if item.get("risk", "").lower() in ["high", "medium"]
    ]


def summarize_zap_report(zap_data: List[Dict], domain: str) -> dict:
    """
    전처리된 ZAP 데이터를 Gemini로 요약 요청
    """
    filtered_data = preprocess_zap_data(zap_data)
    if not filtered_data:
        raise ValueError("중요도 Medium 이상인 취약점이 없습니다.")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    prompt = f"""
        다음은 ZAP 도구로 스캔한 웹사이트의 취약점 목록입니다. 이 데이터를 바탕으로 아래의 두 가지를 JSON 형식과 한국어로 정리해 주세요:
        
        {json.dumps(filtered_data, ensure_ascii=False)}
        
        1. 중요 취약점 요약 (왜 중요한지 포함)
        "key_vulnerabilities": [
            {{
            "name": "취약점 이름",
            "risk": "위험도",
            "why_important": "이 취약점이 중요한 이유",
            "description": "취약점 설명"
            }}
        ]

        2. Gemini에게 물어볼 수 있는 프롬프트 예시
        "prompt_examples": [
            "이 웹사이트에서 발견된 보안 취약점 중 가장 위험한 항목은 무엇인가요?",
            "CWE-79에 해당하는 취약점의 실전 공격 시나리오를 설명해주세요."
        ]

        ※ JSON은 반드시 순수 JSON 텍스트로 반환해주세요. 코드블록(백틱)은 포함하지 마세요.
    """

    try:
        response = model.generate_content(prompt)
        raw_text = response.text
    except Exception as e:
        raise RuntimeError(f"[!] Gemini 응답 오류: {e}")

    json_data = extract_json_from_codeblock(raw_text)
    if json_data is None:
        raise ValueError("[!] AI 응답에서 JSON 추출 실패\n" + raw_text)

    return {
        "summary": json_data,
        "timestamp": timestamp,
        "domain": domain
    }
