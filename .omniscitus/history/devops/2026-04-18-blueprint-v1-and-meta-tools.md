# Blueprint v1 마이그레이션 + find-context skill + follow-up 리뷰

**Participants**: claude, mincheol.kim

## Summary
omniscitus blueprint 포맷을 v0 list → v1 map으로 전면 마이그레이션(8개 파일 86 entries),
현재 대화 주제 관련 과거 의사결정/교훈을 찾아주는 `/find-context` 신규 skill 작성,
`/follow-up`으로 10개 open unit의 pending 26개 상태 검증.

## Context
- **Background**: 사용자가 blueprint 계열 skill 용도를 학습하는 과정에서 `/blueprint-sync` 실행 → PostToolUse 훅이 `_claude.yaml`을 v1 포맷으로 덮어쓰면서 기존 24개 엔트리가 전부 사라짐. 포맷 비호환으로 인한 데이터 손실 발견
- **Requirements**:
  - 모든 blueprint 파일을 훅과 호환되는 v1 map 포맷으로 통일 (향후 재발 방지)
  - 현재 대화 주제 관련 과거 의사결정(why)과 교훈(lessons learned)을 history/prd에서 자동으로 추려주는 skill 신설
  - 오래된 open unit의 pending을 정기 검증
- **Decisions**:
  - **Option B(근본 복구)** 선택 — 단일 파일 복구(A)는 다른 blueprint에서 재발 가능성 있어 8개 전부 v1로 일괄 전환
  - v1 포맷: `version: 1`, `updated: {ISO}`, `files:` 하위 quoted path key → `{status, source, created, change_count, purpose, change_log}` 중첩 구조
  - `/find-context` 위치: `.claude/skills/find-context/` (프로젝트 로컬)
  - `/find-context` 범위: `.omniscitus/history/` + `docs/prd/` + `_weekly/` 3곳. 인덱스/파일명 기반 후보 스캔(최대 5개) → 상세 Read → **원문 인용 필수**, why/lessons로 분류 안 되는 일반 설명은 버림
  - `/follow-up` 범위: status=open 10개만 리뷰 (closed 2개 스킵). 코드 검증 가능한 것만 done으로 체크, GA/텔레그램/Pencil 같은 외부 시스템 확인은 ❓로 표기
- **Constraints**:
  - `.env.local`의 `FIGMA_ACCESS_TOKEN`에서 prefix `f` 누락 발견(`igd_...` 저장됨 → 원래 `figd_...`). 사용자 명시적 허락 없이 `.env.local` 편집 보류 — 세션 내에선 Python으로 런타임에 `f` 붙여 우회
  - blueprint v0 → v1 전환 중 이미 `_claude.yaml`은 훅 덮어쓰기로 24 entries 손실 — 메모리상 재구성하여 25개(기존 24 + find-context 1)로 v1에 직접 작성

## Timeline

### 2026-04-18
**Focus**: Blueprint 포맷 마이그레이션 + find-context skill 신설 + 10개 open unit 후속작업 점검
- `/blueprint-sync` 1차 실행: `.claude/` 24파일, `design/` 2파일(home.pen/design-dna.pen), `.github/` 1파일 추가 — v0 flat list 포맷으로 기록
- `_claude.yaml`을 훅이 v1 map 포맷으로 재작성하며 24 entries 손실 발견 → 원인 진단 (v0/v1 포맷 비호환으로 훅이 기존 내용 파싱 실패 → 새 파일로 덮어씀)
- `/find-context` skill 설계·작성: Phase 1 주제 포착 → Phase 2 인덱스 스캔(후보 최대 5) → Phase 3 상세 Read + why/lessons 추출 → Phase 4 원문 인용 리포트. 파일 수정 금지, 사용자 해석 유보
- Blueprint 8파일을 v1 map 포맷으로 일괄 재작성:
  - `_root` (12), `_claude` (25 — 24 복원 + find-context), `_github` (1), `design` (4), `docs` (6), `prisma` (1), `public` (13), `src` (24)
  - 총 86 entries, 디스크 git ls-files(85 active) + `src/app/favicon.ico` deleted 1 = 정확히 일치
- `/follow-up` 실행: 10개 open unit의 pending 26개 검증 → 코드로 done 확인된 2개 체크박스 업데이트
  - `step-flow-rebuild`: "모바일 결과 페이지 2컬럼→1컬럼" ✔ (page.tsx:595 `flex-col sm:flex-row` 확인)
  - `neon-db-setup`: "`bun run db generate`로 Prisma Client 생성 확인" ✔ (node_modules/.prisma/client 존재)
- Figma API 탐색 중 토큰 이슈 발견: `.env.local` 저장된 값이 `igd_-GQa...`(prefix `f` 누락) → 런타임에 Python이 `f` 붙여 우회

**Learned**:
- Blueprint v0(list: `- path: X`)과 v1(map: `"X":`)의 차이는 identity 기준: list는 순서, map은 path key. 훅이 "replace by key"로 안전하게 동작하려면 map 구조가 필수. list 파일이 남아있으면 훅이 파싱 실패 시 **파일 통째로 덮어씀**(데이터 손실)
- YAML map 키에 `.`, `/` 같은 특수문자 있으면 **따옴표 필수** — 훅이 일관되게 quoted key 강제하는 이유
- 단일 파일 응급 복구보다 **전체 포맷 통일**이 장기적으로 안전 — 같은 패턴 버그가 여러 파일에 숨어있을 때
- Figma 토큰 `figd_` prefix가 복붙 중 `f` 한 글자 날아가면 Figma API는 "Invalid token"만 반환(원인 추적 어려움). 저장 전 길이(44자)/prefix 검증 필요
- `/follow-up`은 코드로 검증 가능한 항목과 외부 시스템(GA/캐시/SaaS) 항목을 분리해야 정확 — 후자는 ❓로 남기고 사용자에게 위임

## Pending
- [ ] `.env.local`의 `FIGMA_ACCESS_TOKEN` 앞에 `f` 복원 (사용자 명시적 확인 필요)
- [ ] `/find-context` 실사용으로 검증 — 신규 작업 시 과거 맥락 잘 불러오는지 확인

## Notes
- Blueprint v1 포맷 구조: `version: 1` + `updated: {ISO}` + `files:` 하위 quoted path key → `{status, source, created, change_count, purpose, change_log}`
- `/find-context` 핵심 규칙: 원문 인용 필수, 출처 `{path} § {section}` 형식, why/lessons로 분류 안 되는 내용 제외, Read 최대 5개
- `/follow-up` 권장 next step: analytics 파이프라인(Event 모델 추가 → 마이그레이션 → `/api/events` → `trackEvent` 병행 → `/admin/dashboard`)이 `neon-db-setup` + `analytics-dashboard-prd` + `visitor-tracking` 3개 unit의 공통 의존성
- 배포 커밋: `1b1f0c7` (docs: blueprint v1 migration + find-context skill + accumulated meta)
