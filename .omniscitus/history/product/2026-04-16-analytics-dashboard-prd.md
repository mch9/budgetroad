# 운영 분석 대시보드 PRD

## Summary
운영자가 핵심 퍼널 지표를 자체 대시보드에서 확인할 수 있도록 One-Pager PRD 작성. /prd-onepager 스킬을 새로 만들어 첫 실행.

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

## Pending
- [ ] DB 스키마 설계 (이벤트 테이블 — 팀원과 함께)
- [ ] 이벤트 수집 API 구현
- [ ] 기존 trackEvent()에 자체 API 호출 추가
- [ ] /admin/dashboard 페이지 + recharts 시각화
- [ ] 환경변수 기반 관리자 인증

## Notes
- PRD 파일: docs/prd/analytics/analytics-dashboard-v0.md
- 스킬 파일: .claude/skills/prd-onepager/SKILL.md
- 기존 visitor_id (localStorage) 재활용하여 DB 이벤트에도 포함 예정
