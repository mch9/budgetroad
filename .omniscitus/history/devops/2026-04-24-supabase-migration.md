# Supabase 마이그레이션 (Neon → Supabase) + MCP 연결

**Participants**: mincheol.kim, claude

## Summary
KPI 측정용 DB를 Neon Postgres에서 Supabase로 피벗. 팀 맥락(PM 7명) + Phase 3 로그인/저장 대비 + Data Blending 365% 이상치 구조적 해결이 동기. 2026-04-24 MCP 등록·인증 준비, 2026-04-25 Event 테이블 구축 + `/api/events` 파이프라인 + Vercel 프로덕션 배포 + Neon Marketplace 통합 제거까지 완료 (실 데이터 수신 개시). 남은 작업은 Looker Studio Supabase 직접 연결(Step C).

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
  - **(2026-04-25 추가) Prisma migrate 경로 확정**: baseline 등록(`migrate resolve --applied`) 후 향후 스키마 변경은 `bun run db migrate dev` 단일 경로. MCP는 조회·검증(`list_tables`, `execute_sql`) 전용
  - **(2026-04-25 추가) 진단 로깅 영구 유지**: `/api/events/route.ts`의 catch 블록에서 `err.meta` JSON serialize + `dbHost` 로깅을 revert하지 않음. 저비용 고가치 (이번 Neon-URL 미스 추적의 결정적 단서)
  - **(2026-04-25 추가) Neon 통합 제거로 Council 재해석**: market-entry-pivot Council의 "Neon 유지" 결정은 **유지 비용 0 vs 재프로비저닝 오버헤드** 축만 고려. Vercel Marketplace 통합의 auto-heal 간섭이라는 새 정보가 드러나면서 결정을 뒤집음. 과거 결정의 암묵 전제 재검토 패턴
- **Constraints**:
  - Doc-Freeze 유효 (~2026-06-03): history unit 추가는 "정돈" 범위 내 OK (새 PRD·블루프린트·메타 도구 아님)
  - Supabase 무료 플랜 500MB DB 한도 (이벤트 ~100만 건까지 여유, 현재 규모에 충분)
  - MCP 설정은 세션 시작 시 로드 → 인증 후 Claude Code 재시작 필수
  - Supabase UI 최근 변경: Database Settings 직접 connection string 노출 → 상단 `Connect` 버튼 팝업 (Framework / Direct / ORM / MCP 4탭) 구조
  - **(2026-04-25 발견) Sensitive env vars의 verification 비용**: Vercel의 Sensitive 변수는 UI ★★★★★, `vercel env ls` Encrypted, `vercel env pull` 빈 문자열로 내려옴. 실제 값 확인은 "Copy to Clipboard → 텍스트 에디터 붙여넣기" 경로만 가능. 이 제약 때문에 Neon URL 잘못 박혀있는 상태가 40+ 분간 조용히 유지됨
  - **(2026-04-25 발견) Vercel Marketplace 통합의 auto-heal**: 통합이 주입한 env var는 정적 주입이 아니라 **active 통합이 실시간 방어**하는 값. 같은 이름으로 user가 덮어쓰기 해도 통합의 다음 sync가 되돌림. 통합 제거가 유일 해결책. 제거 시 연결 리소스(Neon DB) 자동 삭제되므로 **빈 DB일 때만 안전한 전략**

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

### 2026-04-25
**Focus**: Event 파이프라인 전체 구축 + 프로덕션 배포 + 3중 실패 후 end-to-end 검증 (MCP apply → Prisma baseline → API route → gtag 확장 → Vercel env → Neon 통합 제거 → real flow 캡처)

- **Event 테이블 MCP 적용**: `mcp__supabase__apply_migration`으로 `events` + 3 indexes 생성 → `list_tables` + `pg_indexes`로 Prisma 스펙 1:1 매칭 검증. RLS disabled (서버사이드 API only)
- **Prisma baseline 등록**: `prisma/migrations/20260424000000_init_events/migration.sql` + `migration_lock.toml` 생성 → `bun run db migrate resolve --applied`로 `_prisma_migrations` 기록. schema.prisma `@@index`에 `map:` 명시해 MCP 생성 인덱스명과 동기화 (drift 방지)
- **코드 구축**:
  - `src/lib/db.ts` — Prisma client singleton (globalThis 캐시, Next.js hot-reload 시 connection 폭증 방지)
  - `src/app/api/events/route.ts` — POST 엔드포인트, `isDev: NODE_ENV !== 'production'` 자동 분기, 에러 swallow
  - `src/lib/gtag.ts` — `fetch('/api/events', { keepalive: true })` 병렬 추가. GA4 호출은 그대로 유지 (이중 트랙)
- **로컬 end-to-end 검증**: `bun dev` + curl → 200 OK + events id:1 row. 실제 브라우저 플로우 6 events (service_entered, cta_clicked, budget_draft_entered, input_started, result_viewed) 캡처 확인
- **프로덕션 배포 — 3중 실패 연쇄 후 성공**:
  1. Build 실패 `Module '@prisma/client' has no exported member 'PrismaClient'` → `package.json`에 `prisma generate` build/postinstall 훅 추가 (commit `f5f8f78`)
  2. Runtime 500 `Query Engine for "rhel-openssl-3.0.x" not found` → `schema.prisma binaryTargets = ["native", "rhel-openssl-3.0.x"]` (commit `15a6dde`)
  3. Runtime 500 `table public.events does not exist` (혼란스러운 에러 — 테이블은 MCP로 분명 존재). 진단 로그 추가(`err.meta` JSON + `dbHost`)해 재배포 → `dbHost: ep-morning-star-a1grygk7-pooler.ap-southeast-1.aws.neon.tech` **Neon URL이 Vercel DATABASE_URL에 박혀있음** 발견 (commit `3a34c09`)
- **원인 규명**: user가 Supabase URL을 Import .env로 넣었다고 했으나 Vercel에 저장된 값은 Neon URL. "Copy to Clipboard" 경로로 실제 값 확인 → 확정. **Neon Vercel Marketplace 통합이 user-owned DATABASE_URL을 주기적 sync로 재주입(auto-heal)** 하고 있었음
- **Neon 통합 제거**: Vercel → Integrations → Neon → Delete. 연결된 Neon DB 자동 삭제 (실 데이터 0건이라 손실 없음). 15개 `DATABASE_POSTGRES_*`/`DATABASE_PG*` 자동주입 env vars 일괄 정리. Supabase URL 재등록 → 이번엔 통합 간섭 없이 안정 저장
- **프로덕션 최종 검증**: 시크릿 창 방문 + 10-step 플로우 완주 → Supabase events 6 rows 전부 `is_dev: false` + 단일 UUID + `result_viewed`에 11개 파라미터 정확히 캡처 확인
- **unit Pending 4건 체크 완료** + `/wrap-up` 기록

**Learned**:
- **Prisma + Vercel 3중 함정의 연쇄**: (1) `prisma generate` 빌드 훅 부재로 타입 에러 → (2) bundled 바이너리 Debian 전용으로 RHEL 런타임 엔진 부재 → (3) env DATABASE_URL이 Marketplace 통합에 의해 Neon URL로 계속 되돌려짐. 각각 독립 이슈지만 연쇄될 때 원인 특정 어려움. **diagnostic logging(`err.meta` JSON + `dbHost`)을 선제 장착하면 1줄 추가로 결정적 단서**. 동일 스택 Phase 3 작업 시 바로 재활용 대상
- **Vercel Sensitive env vars의 verification 비용**: UI ★★★★★ + CLI Encrypted + pull은 빈 문자열. "저장했다" UI 응답만 믿으면 값 미스매치가 조용히 유지됨. 유일한 검증은 Copy to Clipboard → 텍스트 에디터 경로. 중요 env 변경 후엔 무조건 이 경로로 육안 확인 해야
- **Vercel Marketplace 통합의 소유권 모델**: 통합 주입 env var는 **active 통합이 실시간 방어**하는 값. 같은 이름 덮어쓰기는 통합이 승자. 이름 충돌 시 유일한 해결책은 통합 제거이며, 제거 시 연결 리소스까지 자동 삭제되는 marketplace 표준 동작 — 빈 DB 상태에서 안전
- **`is_returning` 플래그 순서 버그**: 시크릿 창에서도 `"yes"`로 찍힘. 원인은 `TrackPageEnter` 내부에서 `getVisitorId()`(`localStorage.setItem` 부작용 있음)가 `isReturningVisitor()`(localStorage 존재 체크)보다 먼저 호출 → "첫 방문자도 재방문으로 오판정". KPI #15 왜곡 가능성. 별도 과제
- **`budget_draft_entered` 중복 발화**: 프로덕션에서 2회 찍힘 (StrictMode 아님). Effect dep 배열 또는 페이지 진입 경로 이슈 의심. 별도 과제
- **Council 결정의 암묵 전제 재검토 패턴**: market-entry-pivot 2026-04-22 "Neon 유지" 결정이 오늘 뒤집힘. 틀려서가 아니라 **당시 보이지 않던 요인(auto-heal 간섭)**이 실전에서 표면화. 결정을 dogma로 취급하지 말고 새 정보 시 재평가하는 자세 — 실전 기록

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
