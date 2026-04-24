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

### 2026-04-24
**Focus**: 학습부채 실제 실행 (문서 3개 + Event 모델 + PRD 2개 제거) + 팀 맥락 재정립

- **학습부채 자각**: 사용자가 "Phase 2/3 쓸모없는 것 많다, 학습 때문에 쌓여버렸다"고 고민 공유. Supabase·로그인·쿼리·자체 대시보드 등이 머릿속에 부담으로 남음
- **객관화** (/cto-council): grep·find로 실제 자산 스캔 → **대부분이 "생각으로만 고려한 것"** 확인. Supabase/로그인/자체 쿼리/자체 대시보드 관련 코드 **0건**. 실제 부담은 ① Neon 프로비저닝 (비용 0) ② Event 스키마 1개 ③ 문서 3개 ④ history unit 2개 deferred만
- **학습부채 정리 실행** (PR #21, 33ead24):
  - `docs/prd/analytics/analytics-dashboard-v0.md` 삭제 (MVP GA4+Looker 피벗 후 무효)
  - `docs/prd/analytics/event-pipeline.md` 삭제 (pipeline 구현 없이 원칙만 공중에 뜸)
  - `prisma/schema.prisma` Event 모델 제거 (@prisma/client·PrismaClient·prisma.event 실사용 0건 grep 확인)
  - `CLAUDE.md` 데이터 수집 섹션 업데이트 (GA4 단독 운영 명시)
  - `docs/prd/ROADMAP.md` T1 업데이트 (dead PRD 링크 제거 + MVP 피벗 명시)
  - `.gitignore`에 `.mcp.json` 추가 (API 토큰 보안)
  - `event-schema-options.md` 상단에 "상위 PRD 폐기, Phase 2/3 재개 시 참고용" 주석
- **팀 맥락 재정립** (후속 /cto-council): 1인 개발자 프레임 → **PM 7명 팀 + 개발 임시 역할**로 재인식. 사용자 확보는 다른 팀원이 병행하니 "1주 DB vs 1주 홍보" 트레이드오프 오류. Council 결정의 방문자·기간 트리거는 유지하되, **팀 역할 분담 맥락에서 DB 구축은 개발 담당 범위 내** 합리적 판단
- **PRD 정리 실행** (PR #22, 052c9ae):
  - `docs/prd/budget-builder/budget-draft-v1-step-flow.md` 삭제 (10-step으로 대체됨)
  - `docs/prd/blog/blog-v0.md` 삭제 (팀 합의 없는 1인 초안, 빈 `blog/` 폴더도 제거)
  - 팀 결정 시 `/prd-collab`으로 재작성 방침. `_archive/` 폴더 불필요
  - 보존: `ROADMAP.md`, `budget-draft-v0.md`, `event-schema-options.md`
- **DB 피벗 결정** (Supabase): Data Blending 365% 이상치 구조적 문제로 GA4만으론 KPI 측정 실패 확인. 팀 맥락 + Phase 3 로그인 대비로 Neon → Supabase 전환 결정. Council 결정의 "Phase 2/3 보류"는 여전히 유효하되, **개발 역할 내 합리적 구축** 프레임으로 해제. 세부는 신규 `supabase-migration` unit 참조
- **CTO Council 3회 소집**: (1) DDD 적용 여부 — 현재는 우연히 기본 분리됨, 전면 도입 과함. (2) 토스/실리콘밸리 PRD 양식 실제성 — 토스 공식 7-layer 근거 부족, 업계 단일 정답 없음. (3) 강사님 7-layer 체계 vs 7주 × 7명 × 주간 출시 cycle — 수학적 불일치, **Shape Up (Basecamp)** 대체재로 강하게 추천 (6+2 cycle 정확 부합, DHH·YC·Basecamp 15+년 실전 증거). 팀 합류 시 팀원 설득 스크립트·근거 다층 배치 전략 수립

**Learned**:
- **학습부채의 정체**: "쌓인 느낌"의 대부분은 머릿속에서 "고려했던 것"이지 실제 자산 아님. grep·find로 객관화하면 실제 정리 대상은 항상 체감보다 적음 (오늘 실제 삭제는 ~400줄 문서 + Event 모델 1개에 불과)
- **Council 결정의 암묵 전제**: 원문은 "1인 개발자 + 실행 > 정돈"이었으나 실제 전제는 "**혼자서 모든 영역을 담당**"이었음. 팀 역할 분담 시 "개발 역할 내 구축"은 Council 결정과 충돌 아님 → 해석 확장 여지
- **"보편적 재활용 스키마"는 학습부채의 정의 그대로**: YAGNI 위반 패턴. 대신 "현재 필요한 최소 + 유연 설계" (Event 테이블 + `properties` JSON)가 실무 정답
- **Moving goalpost 평가의 원인 구분**: 체계 문제 vs 평가자 문제. 외부 근거(Shape Up·DHH·YC·Basecamp)로 기준 외부화하면 평가자 임의성 줄어듦. 팀장이 "팀 보호" 역할할 때 강력한 무기
- **Shape Up이 이 팀에 수학적으로 맞는 이유**: 6+2 cycle = 7~8주, 팀 7명, 주간 출시 — 모두 Basecamp의 100명 미만 팀용 설계와 1:1 매핑. 강사님 7-layer (분기·반기 cycle용)는 규모·주기 모두 미스매치

### 2026-04-25
**Focus**: Phase 2/3 1인 초안 본격 제거 (Level 2 cleanup) + blog-prd·budget-draft-prd unit close — "팀 합의 왜곡 방지" 목적

- **사용자 문제 제기**: "Phase 2, 3 등은 진짜 앞으로 안 쓸 것 같아서 삭제하는 게 나을까? 팀원들과 결정한 내용으로 진행할 예정이라 기존 초안이 고려되면 이슈"
- **문서 4개 정돈** (commit `178bc1d`):
  - `docs/prd/ROADMAP.md` — Phase 2/3 테이블 (경험 #2·#3·#4·#5) 완전 제거 → "이후 방향: 팀 합의 전이라 미확정" 한 줄로 축약. T1 운영 도구 라인도 "자체 DB(Supabase)는 supabase-migration unit에서 진행 중"으로 갱신
  - `docs/prd/budget-builder/budget-draft-v0.md` — `(Phase 2)` 라벨 2곳 제거 (공유 버튼은 PR #20에서 이미 구현된 stale 표기)
  - `docs/prd/analytics/event-schema-options.md` — "Phase 2/3 재개 시 참고용" 주석 → "supabase-migration에서 실제 구현에 사용됨" (현재성 복원)
  - `CLAUDE.md` — "SQLite (로컬) / Neon Postgres (배포)" 전 스택 설명 + "Neon Postgres 자체 수집은 Phase 2/3 보류" 잔재 모두 Supabase 통합으로 갱신
- **2개 unit close**:
  - `blog-prd` — base PRD (`blog/blog-v0.md`)가 PR #22에서 이미 삭제됐는데 unit은 deferred로 남아있던 cross-unit drift 해소. `_index.yaml` status: closed + note에 "base PRD deleted in PR #22"
  - `budget-draft-prd` — MVP PRD(v0) 완료 + Phase 2/3 작성 방침이 "팀 합의 후 /prd-collab으로 재작성"으로 변경됐음을 status 라인으로 명시
- **연관 수정**: `.agents/`·`skills-lock.json` gitignore 처리 (Claude Code skills install 산출물)

**Learned**:
- **앵커링 제거의 핵심은 ROADMAP.md 한 곳**: 다른 문서는 "MVP 구현 역사 기록"으로 중립적으로 읽히지만, ROADMAP은 "미래 방향 제안"처럼 읽혀서 **팀 합의 왜곡의 최대 위험원**. budget-draft-v0.md처럼 구현 기록 문서는 보존하되 stale 라벨(`(Phase 2)`)만 제거하는 접근이 실용적 — 역사 맥락 + 앵커링 방지 양립
- **Cross-unit drift 자동 감지의 한계**: blog-prd의 Pending 5개가 base PRD 삭제 후에도 deferred로 남아있었음. 파일 시스템과 unit 인덱스의 drift는 `/follow-up` skill로만 잡힘. 정기 follow-up이 drift 누적 방지에 필수
- **"현재성 복원"이 "참고용 주석"보다 낫다**: event-schema-options.md를 "Phase 2/3 재개 시 참고"로 표기하면 문서 가치가 "미래의 어느 날"로 미뤄짐 → 실질 미운영. "**supabase-migration에서 지금 구현에 사용됨**"으로 현재성 부여하면 같은 파일이 생산 문서로 복귀

## Pending

- [x] `_index.yaml` 14 open → 10 close + 4 deferred 대청소 ✔️ 2026-04-22
- [x] project memory + feedback memory 2건 신규 저장 ✔️ 2026-04-22
- [x] MEMORY.md 인덱스 업데이트 ✔️ 2026-04-22
- [ ] **[재평가 트리거]** 2026-06-03 도달 또는 방문자 50명 돌파 시 이 전환 결정 재검토 (현재 2026-04-24, 40일 남음)
- [ ] **[조건부]** 사용자 요청이 3회 이상 반복 수집되면 해당 기능 우선순위 상향 조정 (Phase 2/3 재활성화 판단 트리거)
- [→] 기획 확정 시 `neon-db-setup` + `ga4-looker-analytics-setup` 동시 재개 → **2026-04-24 `supabase-migration` unit으로 피벗 재개 결정** (팀 맥락에서 "개발 역할 내 구축"으로 해석 확장)
- [x] 학습부채 실제 정리 (Phase 2/3 관련 문서·스키마·PRD 제거) ✔️ 2026-04-24 (PR #21 + PR #22)
- [x] Phase 2/3 앵커링 Level 2 cleanup (ROADMAP 테이블 제거 + blog-prd/budget-draft-prd unit close + CLAUDE.md stale 잔재 제거) ✔️ 2026-04-25 (commit `178bc1d`)
- [ ] **(신규)** Supabase 구축 완료 후 실사용자 KPI 측정 가능 상태에서 방문자 50명 트리거 관측
- [ ] **(신규)** 팀 합류 시 강사님 7-layer 체계 → Shape Up 전환 설득 (Level 1 스크립트 기반. 필요 시 Level 2~3 에스컬레이션)

## Notes

- 관련 메모리:
  - `~/.claude/projects/-Users-mch-Documents-GitHub-wedding-budget/memory/project_2026-04-22-council-decision.md` — 결정 스냅샷
  - `~/.claude/projects/-Users-mch-Documents-GitHub-wedding-budget/memory/feedback_doc_freeze.md` — 문서 동결 원칙
- 관련 unit:
  - `ga4-looker-analytics-setup` — 동일 세션의 기술 파이프라인 파트 (365% 원인 분석·Neon 결정·event-pipeline.md·Prisma 스키마)
  - 이번 세션에서 close한 10개 unit — 각각의 후속 작업은 해당 파일 Pending 섹션 참조
- Feedback Council 5명 페르소나 프롬프트·전체 답변: 2026-04-22 세션 대화 맥락 기록
- 재평가 시점 캘린더: **2026-06-03** (6주 timebox) / **방문자 50명** (신호 임계)
