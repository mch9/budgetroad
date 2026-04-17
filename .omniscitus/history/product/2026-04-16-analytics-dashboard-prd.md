# 운영 분석 대시보드 PRD

## Summary
운영자가 핵심 퍼널 지표를 자체 대시보드에서 확인할 수 있도록 One-Pager PRD 작성. /prd-onepager 스킬을 새로 만들어 첫 실행.
2026-04-17 세션에서 ROADMAP에 "운영/도구 레이어" 섹션 신설하여 대시보드 PRD를 상위 구조에 편입, 이벤트 스키마 3안 비교 문서 작성 후 옵션 A(플랫 JSON) 확정, 팀 스키마 메모리 오해 정정.

## Context
- **Background**: GA4만으로는 원하는 형태의 지표 확인이 어려움. 자체 DB에 이벤트를 쌓고 대시보드로 시각화하고 싶다는 요구
- **Requirements**: 전환 지표 3개, 리텐션 3개, 공유 의도 2개, 행동 패턴 4개, 효율 2개, 분포 2개 = 총 16개 핵심 지표
- **Decisions**: 처음부터 자체 대시보드 UI로 구축 (스프레드시트는 필요 시 유동적 활용); /prd-collab 12단계 대신 /prd-onepager 5질문으로 가볍게 기획; Neon Postgres + Prisma로 이벤트 테이블 추가
- **Constraints**: DB 스키마는 팀원과 함께 진행 예정 (Prisma 스키마 단독 정의 금지)

## Timeline

### 2026-04-16
**Focus**: /prd-onepager 스킬 생성 + 대시보드 PRD 작성
- 실리콘밸리 One-Pager PRD 관행 조사 (Amazon, Stripe, Google, Lenny Rachitsky, Shreyas Doshi)
- /prd-onepager 스킬 생성: 5질문 구조 (목적/요구사항/성공지표/기술방향/제외범위)
- 성공 지표(Success Metrics) 섹션 추가 — 실리콘밸리 사례에서 빠진 핵심 섹션 보완
- /prd-onepager analytics-dashboard 실행하여 PRD 작성
- 기술 방향 변경: 스프레드시트 우선 → 자체 대시보드 UI 우선으로 전환
- 스프레드시트는 상황에 따라 유동적 활용으로 결정 로그에 기록

**Learned**: /prd-collab과 /prd-onepager의 용도 구분이 명확해짐 — UX 설계가 필요한 사용자 대면 기능은 /prd-collab, 내부 도구/기술 기능은 /prd-onepager

### 2026-04-17
**Focus**: PRD 상위 구조 재정리 + 이벤트 스키마 결정 + 팀 협업 규칙 정정
- /follow-up으로 대시보드 PRD 관련 pending 5개 상태 검증(전부 미착수 확인)
- 사용자 질문: "Dashboard PRD를 /prd-onepager로 가볍게 간 게 맞나? /prd-collab 수준 접근이 필요한 건 아니었나?"
- 분석 결과: `/prd-onepager` 선택 자체는 적절(내부 도구는 UX 워크플로우 과함)하나, ROADMAP이 "사용자 경험만" 다뤄 Dashboard가 고아 상태로 떠 있던 게 문제
- ROADMAP.md 확장: "## 운영/도구 레이어" 섹션 신설 + T1(운영 분석 대시보드) 등록, "제품 구조 = 경험 레이어 + 운영/도구 레이어" 명시
- docs/prd/analytics/event-schema-options.md 신규 생성: 이벤트 3안(A 플랫 JSON / B 정규화 / C 하이브리드) 트레이드오프 비교 + 결정 포인트 6개(D1~D6)
- 메모리 오해 정정: 기존 "Team Schema Planning — Prisma 스키마는 팀원과 함께"가 실제로는 "KPI/지표를 팀과 결정"의 전달 착오였음을 사용자가 정정 → KPI는 이미 팀 합의 완료, 스키마는 기술 결정 영역
- 옵션 A(플랫 JSON 단일 테이블) 채택 + D1~D6 추천안 확정 → event-schema-options.md "결정 요약" 섹션으로 재작성
- memory/project_team_schema.md 리라이팅: `analytics-kpi-team-decided`로 개명 + MEMORY.md 인덱스 갱신

**Learned**: One-Pager PRD가 "과하게 가벼운지" 걱정될 때 문제는 PRD 깊이 자체가 아니라 **상위 구조(ROADMAP)에서의 포지셔닝**일 수 있음 — 고아 문서는 공유되지 않고, 상위 구조에 묶인 one-pager는 기획 레이어에 잘 녹아듦.

## Pending
- [x] DB 스키마 설계 — 옵션 A 잠정 채택 ✔️ 2026-04-17
- [ ] `prisma/schema.prisma`에 Event 모델 추가 + 첫 마이그레이션
- [ ] 이벤트 수집 API 구현 (POST /api/events)
- [ ] 기존 trackEvent()에 자체 API 호출 추가 (Promise.allSettled로 GA 병행)
- [ ] /admin/dashboard 페이지 + recharts 시각화 (16개 KPI)
- [ ] 환경변수 기반 관리자 인증

## Notes
- PRD 파일: docs/prd/analytics/analytics-dashboard-v0.md
- 스키마 결정 문서: docs/prd/analytics/event-schema-options.md
- ROADMAP: docs/prd/ROADMAP.md ("운영/도구 레이어" 섹션)
- 스킬 파일: .claude/skills/prd-onepager/SKILL.md
- 기존 visitor_id (localStorage) 재활용하여 DB 이벤트에도 포함 예정
- 관련 메모리: `analytics-kpi-team-decided` (KPI는 팀 결정 완료, 구현은 단독 OK)
