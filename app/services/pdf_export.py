import pdfkit
from jinja2 import Environment, FileSystemLoader
import os
import html
import re
from copy import deepcopy

TEMPLATE_DIR = "templates"  # report_template.html이 있는 폴더

# 👉 PDF 생성 전에만 적용할 HTML 전처리 함수
def sanitize_html(text):
    if not isinstance(text, str):
        return text
    text = html.escape(text)
    text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    return text

def generate_pdf_report(data, output_path):
    # ✅ 원본은 그대로 두고 복사해서 사용
    sanitized_data = deepcopy(data)

    # ✅ 상세 취약점 필드 HTML 전처리
    for d in sanitized_data.get("details", []):
        d["description"] = sanitize_html(d.get("description", ""))
        d["evidence"] = sanitize_html(d.get("evidence", ""))
        d["solution_guidelines"] = [sanitize_html(g) for g in d.get("solution_guidelines", [])]
        d["examples"] = {k: sanitize_html(v) for k, v in d.get("examples", {}).items()}

    # ✅ AI 요약도 전처리
    if "ai_summary" in sanitized_data:
        if "summary" in sanitized_data["ai_summary"]:
            for item in sanitized_data["ai_summary"]["summary"]:
                item["description"] = sanitize_html(item.get("description", ""))
                item["why_important"] = sanitize_html(item.get("why_important", ""))
        if "prompt_examples" in sanitized_data["ai_summary"]:
            sanitized_data["ai_summary"]["prompt_examples"] = [
                sanitize_html(p) for p in sanitized_data["ai_summary"]["prompt_examples"]
            ]

    # ✅ 주요 취약점 요약 정보 (top 5) 포함
    zap_summary = data.get("zap_summary", {})
    top_vulns = zap_summary.get("top_vulns", [])
    sanitized_data["summary"] = {
        "top_vulns": top_vulns
    }

    # ✅ Jinja2 템플릿 로딩
    env = Environment(loader=FileSystemLoader("templates"))
    template = env.get_template("report_template.html")
    html_out = template.render(**sanitized_data)

    # ✅ wkhtmltopdf 경로 설정 (네 환경에 맞게 수정 필요!)
    path_wkhtmltopdf = r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe"
    config = pdfkit.configuration(wkhtmltopdf=path_wkhtmltopdf)

    # ✅ PDF 생성 옵션
    options = {
        "encoding": "UTF-8",
        "enable-local-file-access": None,
    }

    # ✅ PDF 최종 생성
    pdfkit.from_string(html_out, str(output_path), options=options, configuration=config)