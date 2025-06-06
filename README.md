# OSIGEN - OSINT 기반 웹 보안 취약점 자동 탐지 시스템

<p align="center">
  <strong>🚧 현재 개발 중인 졸업 프로젝트입니다. 기능 및 코드 구조는 지속적으로 변경될 수 있습니다. 🚧</strong>
</p>

## 개요

**OSIGEN**은 OSINT(Open Source Intelligence) 기반으로 웹 도메인 및 하위 도메인을 수집한 후, 자동화된 보안 도구(ZAP 등)를 활용하여 보안 취약점을 탐지하고, 탐지 결과를 AI로 요약하여 대시보드 형태로 시각화해주는 솔루션입니다.  
이 프로젝트는 대학 졸업작품으로 기획되었으며, 정보 수집과 보안 분석, 사용자 편의를 고려한 전체 분석 파이프라인 구축을 목표로 합니다.

## 주요 기능 (진행 중)

- [x] 사용자가 분석할 도메인 및 분석 유형(빠른/통합)을 선택
- [x] 입력된 도메인 유효성 검사
- [x] 통합 분석 시 OSINT 기반 크롤링(서브도메인 수집)
- [x] 보안 스캔 도구 연동 (현재는 ZAP API 중심)
- [x] 분석 결과 MongoDB 저장
- [x] React + Tailwind 기반 사용자 웹 인터페이스 구축
- [ ] AI 요약 기능 (Gemini API 연동 예정)
- [ ] 분석 진행 단계별 UI 표시 (진행중 / 완료 / 실패)
- [ ] 관리자 페이지 로그 표시
- [ ] 분석 유형별 결과 페이지
- [ ] PDF 보고서 저장 기능

## 기술 스택

- **Backend:** FastAPI, MongoDB
- **Frontend:** React.js, Tailwind CSS
- **Security Tools:** OWASP ZAP (API 사용), OSINT 기반 크롤러 자체 구현
- **AI:** Gemini API (예정)

## 프로젝트 구조
```bash
📁 backend/
├── main.py
├── services/
│ ├── crawler/ # OSINT 기반 크롤링 모듈들
│ ├── zap_project # 보안 도구 연동
├── routes/
└── database/
📁 frontend/
├── src/
└── public/
```

## 주의사항

> ⚠️ 본 프로젝트는 아직 개발 중인 **미완성 버전**입니다. 코드 일부에는 테스트용 로직이 포함되어 있으며, 구조와 파일 이름, 경로는 향후 변경될 수 있습니다. 기능별 모듈화 및 예외 처리는 점차 개선 중입니다.

## 개발자

- **팀명:** OSIGEN (OSINT & Generative AI for Web Security)
- **참여 인원:** 2인 팀 프로젝트
- **진행 기간:** 2025년 3월 ~ 6월 (졸업작품용)
- **수행 역할:** 백엔드+프론트엔드, DB, 서브도메인 크롤러, AI API 구현

---

