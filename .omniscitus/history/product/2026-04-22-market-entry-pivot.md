# 검증 → 시장 진입 모드 전환 + 체계 대청소

**Participants**: mincheol.kim, claude

## Summary
2주간의 기획·개발·분석·디자인 병행 학습(검증 모드)에서 **실제 사용자 확보 중심의 시장 진입 모드**로 전환 공식 선언. CTO Council + Feedback Council 두 번 소집 후 14 open unit 대청소(10 close / 4 deferred), 문서 동결 원칙 수립, project·feedback 메모리 2건 신규 저장. "체계화보다 실행"이 다음 2~3주의 기본 원칙으로 확정됨.

## Context

- **Background**:
  - 지난 2주 Claude Code로 Next.js + Prisma + shadcn 풀스택 + GA4 + Looker + Claude Design 시스템까지 구축 완료 (MVP 수준)
  - 사용자 자각: "기획도 개발도 미숙한 상태에서 병행 학습은 성공했다. 이제 실제 제품 모드로 전환 필요"
  - 오늘 세션 중 Looker Data Blending 365% 이상치 디버깅 과정에서 "투명성·디버깅 비용"이 체감되면서 체계 과잉 신호 포착
- **Requirements**:
  - 누적 pending 37개를 실행 가능한 것만 남기고 정리
  - "문서:코드 1.5:1" 역전 구조 진단·완화
  - 다음 2~3주 작업 원칙 명시적 수립
  - Phase 2/3 기능 개발 우선순위 및 재개 조건 합의
- **Decisions**:
  - **새 체계·문서·메타 도구 추가 금지** (2~3주 timebox, 재평가: 2026-06-03 또는 방문자 50명)
  - **실사용자 10~20명 확보가 최우선** (홍보 채널은 인스타그램, 개발 파트 별도 집중)
  - **Phase 2/3 기능 구현 보류** — 사용자 요청 맥락에서 재개
  - **14 open unit → 10 close + 4 deferred 대청소**
  - **재평가 시점 박기**: 2026-06-03 또는 방문자 50명 돌파
- **Constraints**:
  - 1인 개발자: 번아웃 리스크 상존, 유지 비용 민감
  - Doc-Freeze 원칙에 따라 허용되는 작업: 기존 문서 편집·병합·아카이빙만. 신규 PRD·블루프린트·스킬 추가 금지
  - 이 결정은 Neon Event 자체 수집 경로 결정(`ga4-looker-analytics-setup` 참조)과 함께 묶인 패키지 — 두 결정은 하나의 서사로 이해해야 함

## Timeline

### 2026-04-22
**Focus**: /follow-up → Looker 작업 → 365% 발견 → /cto-council → Neon 경로 결정 → /feedback-council → 전환 선언 + 대청소 → 메모리·Prisma 스키마 작성까지 단일 세션에 압축된 전환점

- `/omniscitus:follow-up` 전체 14 open unit 점검 → 4개 소급 체크, 3개 항목 폐기 반영(ga4-looker의 "삭제 3개" 결정을 og-image·analytics-dashboard·mobile-floating에 소급)
- Looker Studio #16 선택 분포 바차트 6개 구축 과정에서 **Data Blending 365% 이상치** 발견 → 원인 분석
- `/cto-council` 소집:
  - "자체 DB 서버에 올려야 하나?" 질문 → **Neon이 이미 프로비저닝 완료** 상기(2026-04-17 세션에서 Singapore 리전·DATABASE_URL 주입 완료)
  - Neon 경로 선택 (BigQuery 대비 인프라 재활용, Phase 2/3 자연 합류, 투명성)
  - `docs/prd/analytics/event-pipeline.md` 신규 원칙 문서 + `CLAUDE.md` 포인터 추가
  - 실제 구현은 "기획 확정 후"로 보류 합의
- `/feedback-council` 5명 관점 소집 (린 스타트업 전도사·PM·인디해커·미니멀리스트·예비 신부):
  - **3:1 합의: "체계화보다 시장 진입"** — 린·인디해커·미니멀리스트 3명이 신규 체계 도입 반대, PM 1명만 SSoT 통일 주장
  - 엔드유저(예비 신부) 관점: "결과 저장·수정 기능 없으면 친구 추천 어려움" — 회귀 기대감이 추천 가능성의 핵심
  - 블라인드스팟 5개: 한국 결혼 = 집단 의사결정 / Phase 1 완벽주의 함정 / 문서 유지비 / 회귀 기대감 / 번아웃
- 액션 #1+#2 실행:
  - **project memory 신규**: `project_2026-04-22-council-decision.md` — 전환 선언 스냅샷, 재평가 조건 명시
  - **feedback memory 신규**: `feedback_doc_freeze.md` — 새 체계 추가 금지 원칙, 허용·금지 행동 구분
  - **MEMORY.md 인덱스** 2건 추가
  - **`_index.yaml` 대청소**:
    - Close 10개: project-scaffold-setup, og-image-social-sharing, step-flow-rebuild, visitor-tracking, landing-page-redesign, mobile-floating-ctas-and-favicon, blueprint-v1-and-meta-tools, ci-lint-and-slack-fixes, analytics-dashboard-prd, claude-design-adoption
    - Deferred 4개 (open 유지, 재개 조건 명시): budget-draft-prd, blog-prd, neon-db-setup, ga4-looker-analytics-setup
- Prisma `Event` 모델 작성(migrate 보류) — 옵션 A 기반 조정 3가지 반영 (세부는 `ga4-looker-analytics-setup` 유닛 참조)
- BigQuery 학습 셋업 제안 → 사용자 판단으로 중단 (GA4 14개월 retention이 1차 보험 역할 수행 중, 만료 임박 시 재검토)

**Learned**:
- **"체계화가 실행을 대체하는 순간"의 구체적 모습** — pending 37개 + 문서:코드 1.5:1 + Council 5명 중 3명 경고는 체계 과잉의 객관 지표. 1인 개발자 맥락에서 번아웃 예고 신호
- **"체계 제거"가 아니라 "신규 추가 금지"가 실행 가능한 원칙** — 기존 41개 관리 문서를 지금 전부 삭제하면 혼란 증가. 신규 추가만 중단하면 자연 축소로 수렴
- **Council 메타 도구의 실전 가치 검증** — CTO Council(기술 불안 해소) + Feedback Council(다각도 검토) 조합이 1인 의사결정에서 명확한 분기점 역할. 특히 "사용자가 본인의 판단을 확인하려는 국면"에서 효과적
- **"보험용 투트랙" 세팅의 함정** — BigQuery 학습 셋업도 "보험용"으로 포장되면 유지 부담만 남음. 진짜 보험은 이미 가입 상태(GA4 retention)라면 2차 보험은 만료 임박 시점에 도입하는 게 효율적
- **한국 결혼 = 집단 의사결정 시스템** (린 지적) — "개인 전환율"(클릭→결과)보다 "공유 링크 생성 후 며칠 뒤 재방문"이 더 본질적 신호. KPI 설계 시 "개인 funnel" 외 "가족 대화 funnel" 트래킹 필요
- **회귀 기대감 = 추천 가능성의 핵심** (예비 신부 지적) — 결혼 예산은 매주 검색·다듬는 과정이라 "지속적 사고 동반자"가 되려면 저장·수정 기능이 필수. 1회성 장난감은 진지한 사용자에게 추천 불가

## Pending

- [x] `_index.yaml` 14 open → 10 close + 4 deferred 대청소 ✔️ 2026-04-22
- [x] project memory + feedback memory 2건 신규 저장 ✔️ 2026-04-22
- [x] MEMORY.md 인덱스 업데이트 ✔️ 2026-04-22
- [ ] **[재평가 트리거]** 2026-06-03 도달 또는 방문자 50명 돌파 시 이 전환 결정 재검토
- [ ] **[조건부]** 사용자 요청이 3회 이상 반복 수집되면 해당 기능 우선순위 상향 조정 (Phase 2/3 재활성화 판단 트리거)
- [ ] 기획 확정 시 `neon-db-setup` + `ga4-looker-analytics-setup` 두 유닛 동시 재개 (Event 모델 migrate + API 구현)

## Notes

- 관련 메모리:
  - `~/.claude/projects/-Users-mch-Documents-GitHub-wedding-budget/memory/project_2026-04-22-council-decision.md` — 결정 스냅샷
  - `~/.claude/projects/-Users-mch-Documents-GitHub-wedding-budget/memory/feedback_doc_freeze.md` — 문서 동결 원칙
- 관련 unit:
  - `ga4-looker-analytics-setup` — 동일 세션의 기술 파이프라인 파트 (365% 원인 분석·Neon 결정·event-pipeline.md·Prisma 스키마)
  - 이번 세션에서 close한 10개 unit — 각각의 후속 작업은 해당 파일 Pending 섹션 참조
- Feedback Council 5명 페르소나 프롬프트·전체 답변: 2026-04-22 세션 대화 맥락 기록
- 재평가 시점 캘린더: **2026-06-03** (6주 timebox) / **방문자 50명** (신호 임계)
