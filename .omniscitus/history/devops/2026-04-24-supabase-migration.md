# Supabase 마이그레이션 (Neon → Supabase) + MCP 연결

**Participants**: mincheol.kim, claude

## Summary
2026-04-24 세션에서 KPI 측정용 DB를 Neon Postgres에서 Supabase로 피벗. 팀 맥락 (PM 7명, Phase 3 로그인·저장 기능 예정)에서 Auth 내장 + 풀스택 플랫폼 효용이 전환 비용 대비 크다고 판단. Supabase MCP 서버를 Claude Code에 등록하여 AI agent가 DB에 직접 접근(schema·migration·쿼리) 가능하게 구성. 실제 Event 테이블 생성·`/api/events` route·Looker 연동은 다음 세션에서 MCP 재시작 후 진행.

## Context

- **Background**:
  - 2026-04-22 Council 결정으로 Phase 2/3 DB 구축 보류 상태였음
  - 2026-04-24 세션 중 Looker Data Blending 365% 이상치가 **구조적 문제** (cardinality 미스매치 + GA4 sampling) 로 최종 확인되어 **GA4만으론 KPI 측정 불가능** 판단
  - 팀 맥락 재정립 (1인 개발자 → PM 7명 팀의 개발 담당 임시 역할) → "개발 역할 내 합리적 구축"으로 보류 해제 (`market-entry-pivot` 2026-04-24 append 참조)
- **Requirements**:
  - Data Blending 이슈 회피: 자체 DB 단일 소스로 Looker 직접 쿼리
  - 13개 KPI 중 GA4로 측정 불가한 항목 해결 (특히 "한 사용자당 결과 생성 개수" = user-level aggregation)
  - 주간 출시 cycle에 맞게 구축 시간 최소화 (반나절 목표, 1주 이상 금지)
  - `navigator.share` 실패 환경(Windows Chrome 등)도 커버하는 공유 복사 플로우에 이벤트 기록 포함
- **Decisions**:
  - **Supabase 선택 (Neon 대신)**: 팀 Phase 3 로그인/저장 도입 가능성 높음 → Auth 내장으로 미래 개발 시간 3~5h 절감. 전환 비용은 **지금이 최저** (Neon에 실사용 코드 0건 상태)
  - **Neon 프로비저닝 자체는 유지**: 무료 플랜 비용 0, 재프로비저닝 오버헤드가 유지 비용보다 큼. 활용만 Supabase로 이전
  - **GA4 병행 유지**: 14개월 retention 보험. `trackEvent`에서 GA4 + Supabase 병렬 fire-and-forget 호출
  - **"보편적 재활용" 의도 경계**: YAGNI 회피. Event 테이블 1개 + `properties` JSON (최소 유연 설계)이 실무 정답으로 확정
  - **MCP 방식 도입**: AI agent가 DB 직접 접근 (schema·migration·쿼리 자동화). 사용자 수작업 (connection string 복붙·Vercel 환경변수 등) 대폭 축소
  - **Supabase project 스펙**: `MajangGG` org, Seoul 리전, `budgetroad` project, Free tier (500MB DB / 2 projects)
- **Constraints**:
  - Doc-Freeze 유효 (~2026-06-03): history unit 추가는 "정돈" 범위 내 OK (새 PRD·블루프린트·메타 도구 아님)
  - Supabase 무료 플랜 500MB DB 한도 (이벤트 ~100만 건까지 여유, 현재 규모에 충분)
  - MCP 설정은 세션 시작 시 로드 → 인증 후 Claude Code 재시작 필수
  - Supabase UI 최근 변경: Database Settings 직접 connection string 노출 → 상단 `Connect` 버튼 팝업 (Framework / Direct / ORM / MCP 4탭) 구조

## Timeline

### 2026-04-24
**Focus**: Neon→Supabase 피벗 결정 + Supabase project 생성 + MCP server 등록 + Agent Skills 설치 + 인증 준비

- **CTO Council 검토**: Neon vs Supabase 비교 (Auth·Realtime·Storage 내장 여부, 무료 플랜 한도, 전환 비용). 결론 — 1인 개발자 프레임에선 Neon 유지가 합리적이었으나 **팀 맥락에선 Supabase가 총 비용 관점 유리** (Phase 3 로그인 도입 시 3~5h 절감)
- **Supabase 프로젝트 생성** (사용자 액션): `MajangGG` org → `budgetroad` project (main/production branch) → Free tier → Northeast Asia (Seoul) 리전 → DB password 별도 보관
- **Supabase 연결 UI 혼란**: 기존에 제공했던 `Connection pooling` 탭 위치가 UI 변경으로 사라짐 → 상단 `Connect` 버튼 팝업 (Framework/Direct/ORM/MCP) 기반으로 안내 수정. MCP 탭 발견 → 즉시 피벗
- **MCP 서버 등록**:
  ```
  claude mcp add --scope project --transport http supabase \
    "https://mcp.supabase.com/mcp?project_ref=tmtplfxydnhahjlqfjnp\
     &features=docs,account,database,debugging,functions,development,branching,storage"
  ```
  → `.mcp.json` 프로젝트 루트에 생성 (`.gitignore:37` 포함 확인 완료)
- **Agent Skills 설치** (`npx skills add supabase/agent-skills`): `Postgres Best Practices` + `Supabase` 두 스킬 선택 → Claude Code 에이전트 선택 (Universal 12개 자동 + Additional은 Claude Code만) → `.claude/skills/supabase/`, `.claude/skills/supabase-postgres-best-practices/` 배포. `.agents/` 디렉토리 + `skills-lock.json` 생성됨 (아직 untracked)
- **인증 준비** (사용자 진행 예정): 일반 터미널 (IDE 확장 아님)에서 `claude` → `/mcp` → `supabase` 선택 → Authenticate → OAuth 브라우저 플로우 → 승인
- **다음 세션 작업 목록 확정** (MCP 활성 후):
  1. Prisma schema Event 모델 복원 (삭제 전과 동일 스펙: visitor_id·session_id·event_name·properties JSON·is_dev·created_at + 3개 인덱스)
  2. Supabase에 events 테이블 migrate
  3. `/api/events/route.ts` POST 엔드포인트
  4. `src/lib/gtag.ts` `trackEvent` 확장 (GA4 + Supabase 병렬 fire-and-forget)
  5. Vercel 환경변수 추가: `DATABASE_URL` + `DATABASE_URL_UNPOOLED` (Production + Preview + Development)
  6. Looker Studio Supabase PostgreSQL connector 연결 + KPI 퍼널 리포트 1개

**Learned**:
- **Supabase MCP의 효용**: connection string 수동 복붙·Vercel 환경변수 수동 추가·각 SQL 결과 전달 등 반복 작업 생략. AI agent가 schema·migration·쿼리까지 직접 처리 → 1주 작업이 반나절로 단축 가능
- **`.mcp.json` + `.gitignore` 사전 정비의 가치**: PR #20 학습부채 정리에서 `.mcp.json` 제외 라인 추가해둔 것이 오늘 MCP 도입 시 "보안 걱정 없이 바로 추가" 가능하게 함. 정리 작업이 다음 작업의 속도를 높이는 선순환
- **Supabase UI 변경 대응**: 공식 문서·가이드가 구 UI 기준이면 현장에서 혼란 → 최신 UI 탐색 후 즉시 피벗이 실용적. "MCP 탭이 있네, 그럼 MCP로 가자"가 Connection String 탭 붙잡는 것보다 10배 효율
- **Agent Skills의 지정 설치**: Universal 12개 (always included) + Additional은 자기 도구만 선택. Claude Code만 체크하면 다른 AI 도구(Augment·Cursor·Codex 등)용 디렉토리 안 만들어져 깔끔

## Pending

- [x] **(다음 세션, MCP 활성 후)** Prisma schema Event 모델 복원 + events 테이블 migrate ✔️ 2026-04-24 (MCP `apply_migration` 경로로 `bun run db migrate dev` 대체. 스키마·인덱스 3개 `list_tables` + `pg_indexes`로 검증 완료. RLS는 서버사이드 전용이라 disabled 유지 — 클라이언트 직접 쿼리 도입 시 재검토)
- [x] `src/app/api/events/route.ts` POST 엔드포인트 구현 ✔️ 2026-04-24 (Prisma client singleton `src/lib/db.ts` + isDev flag + fire-and-forget 500 swallow). curl 테스트 id:1 row 생성 확인
- [x] `src/lib/gtag.ts` `trackEvent` 확장 ✔️ 2026-04-24 (GA4 유지 + `fetch('/api/events', { keepalive: true })` 병렬 호출, `.catch(() => {})`로 실패 무시)
- [x] Vercel 환경변수 Supabase `DATABASE_URL` + `DIRECT_URL` 추가 ✔️ 2026-04-25 (Production + Preview. Development는 팀원 합류 시 보강. 중간에 Neon Marketplace 통합의 자동 재주입으로 3번 덮어써진 뒤 통합 제거로 해결)
- [x] 프로덕션 배포 후 실제 이벤트 수집 확인 ✔️ 2026-04-25 (curl → `https://budgetroad.vercel.app/api/events` 200 OK, Supabase events id:8 `is_dev: false` 확인 후 정리 삭제)
- [x] **Neon 프로비저닝 처분** ✔️ 2026-04-25 (조건부 pending 조기 해소. Vercel Marketplace 통합이 DATABASE_URL을 Neon URL로 자동 재주입하는 것이 원인으로 확인 → 통합 제거 시 Neon DB 자동 삭제됨. 실 데이터 0건이라 손실 없음. market-entry-pivot 2026-04-22 Council 결정의 "Neon 유지"는 간섭 비용이 드러나면서 조정됨)
- [x] **(검토 필요)** `.agents/`, `skills-lock.json` → `.gitignore` 추가 ✔️ 2026-04-24 (commit `f5f8f78`)
- [ ] Looker Studio → PostgreSQL connector → Supabase 연결 → KPI 퍼널 리포트 1개 (전환율 Scorecard 3개)
- [ ] GA4 Data Blending 이슈 우회 확인 — Looker가 Supabase 단일 소스 쿼리로 Scorecard 정확도 나오는지 검증

## Notes

- **Supabase project_ref**: `tmtplfxydnhahjlqfjnp` (MajangGG org, Seoul 리전, Free tier)
- **MCP URL**: `https://mcp.supabase.com/mcp?project_ref=tmtplfxydnhahjlqfjnp&features=docs,account,database,debugging,functions,development,branching,storage`
- **Agent Skills 경로**: `.claude/skills/supabase/`, `.claude/skills/supabase-postgres-best-practices/`
- **관련 unit**:
  - `devops/2026-04-17-neon-db-setup` — **superseded by this unit** (Neon 프로비저닝 유지, 활용은 Supabase로 이전)
  - `devops/2026-04-19-ga4-looker-analytics-setup` — Data Blending 365% 이상치 원인 분석 출발점. Supabase 연결로 구조적 해결 예정
  - `product/2026-04-22-market-entry-pivot` — 이번 DB 구축을 "개발 역할 내 합리적 구축"으로 허용한 팀 맥락 재정립의 맥락
  - `web/2026-04-23-budget-draft-figma-redesign` — Windows Chrome 공유 모달 도입 시 GA4 `share_result` 이벤트 수집 로직. Supabase 병렬 호출 추가 대상
- **관련 메모리**:
  - `feedback_stacked_pr_base_fix` — PR #20 복구 과정에서 체계화된 stacked PR 3함정
  - `project_2026-04-22-council-decision` — 재평가 트리거 명시 (여전히 유효)
- **Event 모델 스펙** (복원 예정, PR #21 삭제본과 동일):
  ```prisma
  model Event {
    id         BigInt   @id @default(autoincrement())
    visitorId  String   @map("visitor_id") @db.VarChar(64)
    sessionId  String?  @map("session_id") @db.VarChar(64)
    eventName  String   @map("event_name") @db.VarChar(64)
    properties Json?
    isDev      Boolean  @default(false) @map("is_dev")
    createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz
    @@index([createdAt(sort: Desc)])
    @@index([visitorId, createdAt(sort: Desc)])
    @@index([eventName, createdAt(sort: Desc)])
    @@map("events")
  }
  ```
