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

### 2026-04-19
**Focus**: MVP 구현 경로를 **자체 DB·자체 대시보드 → GA4 + Looker Studio 경량 경로로 피벗**
- `/follow-up` 리뷰에서 기존 5개 pending(Event 모델/API/trackEvent 병행/admin 대시보드/인증)이 입문자 단독 구현 부담 + MVP scope 과다임을 확인
- 사용자의 "이렇게 할 일이 많은 게 설계 잘못이냐" 불안 표출 → 레스토랑 비유(수집/저장/표시 3단계 + 인증 = 5 부품)로 구조 설명 후 **대안 A(GA+Sheets), B(GA4+Looker), C(지금 PRD) 비교** → 대안 B 채택
- 16개 KPI vs GA4+Looker 가능성 매핑 → **14~15개 GA4로 관측 가능, 2개(저장 의존)는 Phase 2/3 연계, 1~2개(코호트)는 BigQuery SQL 경로로 대응** 판정
- 파이프라인 실제 구축은 **별도 devops unit(`ga4-looker-analytics-setup`)으로 분리** — 본 PRD는 "제품 결정"으로 유지, 실제 operational 작업은 그쪽에서 추적
- 본 PRD의 기존 pending(Event 모델/API/admin 페이지/인증)은 **Phase 2(공유 링크)·Phase 3(저장·마이페이지) 진입 시 자연 합류**하도록 보류. 없애지는 않음

**Learned**:
- **"자체 DB = 자유" vs "매니지드 = 락인" 이분법이 잘못**. GA4는 BigQuery export(무료)와 Data API로 완전 탈출 가능 → 선택 기준은 **지금 이 기능에 그 인프라가 필요한가**로 좁혀야 함
- One-Pager PRD가 "너무 가벼웠나" 대신 **"타이밍이 아직 아니었다"**가 맞는 진단일 수 있음. PRD는 유효하되, MVP 단계에선 경량 경로로 대체하고 사용자 기능 합류 시점에 활성화
- 자체 DB 구현의 실제 수확 시점은 **사용자가 "본인 예산을 저장·조회"를 요구하는 순간(Phase 2/3)**. 분석용만으론 지금 구현 정당화 어려움 — `/admin/dashboard` 없어도 GA4+Looker가 동일한 경험 제공

## Pending
- [x] DB 스키마 설계 — 옵션 A 잠정 채택 ✔️ 2026-04-17
- [~] `prisma/schema.prisma`에 Event 모델 추가 + 첫 마이그레이션 — **Phase 2/3 시점으로 보류** (2026-04-19 피벗)
- [~] 이벤트 수집 API 구현 (POST /api/events) — **보류**
- [~] 기존 trackEvent()에 자체 API 호출 추가 (Promise.allSettled로 GA 병행) — **보류**
- [~] /admin/dashboard 페이지 + recharts 시각화 (16개 KPI) — **보류** (GA4+Looker Studio가 해당 역할 대행)
- [~] 환경변수 기반 관리자 인증 — **보류**
- [ ] (MVP 운영) BigQuery export 활성화 — 데이터 장기 보존 위해 지금 켜야 함 (ga4-looker-analytics-setup unit에 중복 기재)

## Notes
- PRD 파일: docs/prd/analytics/analytics-dashboard-v0.md
- 스키마 결정 문서: docs/prd/analytics/event-schema-options.md
- ROADMAP: docs/prd/ROADMAP.md ("운영/도구 레이어" 섹션)
- 스킬 파일: .claude/skills/prd-onepager/SKILL.md
- 기존 visitor_id (localStorage) 재활용하여 DB 이벤트에도 포함 예정
- 관련 메모리: `analytics-kpi-team-decided` (KPI는 팀 결정 완료, 구현은 단독 OK)
- 관련 unit: `ga4-looker-analytics-setup` (2026-04-19 피벗으로 신설 — MVP 구현 경로)
