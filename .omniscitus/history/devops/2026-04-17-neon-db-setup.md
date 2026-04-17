# Neon Postgres 프로비저닝 및 Prisma 연결

## Summary
Vercel Marketplace를 통해 Neon Postgres(Singapore 리전)를 프로비저닝하고, Prisma 스키마를 SQLite에서 Postgres로 전환. `dotenv-cli` + `bun run db` 래퍼 스크립트로 `.env.local` 자동 로드되는 Prisma CLI 환경 구축.

## Context
- **Background**: Analytics Dashboard 구현을 위해 첫 실제 DB 필요. MVP는 정적 데이터 + localStorage로만 동작했으나, 이벤트 수집/집계가 들어가면서 Postgres 필수화
- **Requirements**: Vercel과 네이티브 연동, Preview 배포 격리(Neon branching), Prisma 호환, 한국 사용자 레이턴시 최적화
- **Decisions**: Neon Free 플랜 + Singapore(ap-southeast-1) — Seoul 리전 미제공이라 Tokyo/Singapore 중 Singapore 선택; Custom Prefix를 `DATABASE`로 지정하여 `DATABASE_URL`/`DATABASE_URL_UNPOOLED` 관례 준수(Prisma 기본값); Neon branching은 Preview+Production 모두 활성화
- **Constraints**: `vercel env pull`이 `.env.local`을 통째로 덮어써서 기존 로컬 전용 변수(`NEXT_PUBLIC_GA_ID`, `FIGMA_ACCESS_TOKEN`) 손실 위험. GA ID는 Production env pull로 복구, FIGMA 토큰은 사용자가 재제공

## Timeline

### 2026-04-17
**Focus**: Neon 프로비저닝 + Prisma Postgres 전환 + dotenv 자동 로드 스크립트
- Vercel Dashboard → Storage → Marketplace에서 Neon 통합 설치
- Install Integration 설정: `budgetroad` 프로젝트 선택, Environments 3개(Dev/Preview/Prod) + Branching(Preview/Production) 체크, Custom Prefix `DATABASE` 지정
- Neon DB `neon-cyclamen-house`(Neon ID `little-haze-72141476`) 생성 완료 → Vercel env에 18개 변수 자동 주입(`DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `DATABASE_PGHOST` 등)
- `vercel env pull .env.local --yes` 실행 → `.env.local` 갱신(주의: 기존 Production-only `NEXT_PUBLIC_GA_ID` 및 로컬 전용 `FIGMA_ACCESS_TOKEN` 사라짐)
- `NEXT_PUBLIC_GA_ID` 복구: `vercel env pull --environment=production /tmp/vercel-prod.env`로 값 회수 후 `.env.local`에 append + Development env에도 추가하여 재발 방지
- `FIGMA_ACCESS_TOKEN` 사용자 재제공 받아 append
- `prisma/schema.prisma`: `provider = "sqlite"` → `"postgresql"`, `url = env("DATABASE_URL")` + `directUrl = env("DATABASE_URL_UNPOOLED")` (Neon pooled/unpooled 구분)
- `dotenv-cli` devDep 설치 후 `package.json`에 `"db": "dotenv -e .env.local -- prisma"` 스크립트 추가 → `bun run db validate|migrate|studio` 일원화
- 연결 검증: `bun run db migrate status` → "Datasource db: PostgreSQL database neondb at ep-morning-star-a1grygk7.ap-southeast-1.aws.neon.tech" 확인

**Learned**: Bun의 `--env-file=.env.local`은 bun 프로세스 자체에만 적용되고 서브프로세스(prisma CLI)로 전파되지 않음 — Prisma CLI용으론 `dotenv-cli` wrapper가 필수. `vercel env pull`은 **덮어쓰기(destructive)**이며 환경별(Development/Production) 변수는 합집합이 아님 — 복수 환경에 공통 값은 양쪽 모두에 명시적으로 등록해야 pull에서 유실 안 됨.

## Pending
- [ ] `prisma/schema.prisma`에 Event 모델 추가 (옵션 A: 플랫 JSON 단일 테이블)
- [ ] `bun run db migrate dev --name init_events` — 첫 마이그레이션 생성 및 Neon 적용
- [x] `bun run db generate`로 Prisma Client 생성 확인 ✔️ 2026-04-18 (node_modules/.prisma/client 생성물 확인)
- [ ] `bun run db studio`로 GUI 접속 테스트

## Notes
- Neon 통합명: `neon-cyclamen-house` (Neon ID: little-haze-72141476)
- 리전: AWS ap-southeast-1 (Singapore)
- 플랜: Free
- Vercel env 자동 주입 변수: 18개(DATABASE_URL, DATABASE_URL_UNPOOLED + PG* 보조 변수)
- Prisma CLI 래퍼: `bun run db <cmd>` (`dotenv-cli` 기반)
- 상위 PRD: docs/prd/analytics/analytics-dashboard-v0.md
- 스키마 결정: docs/prd/analytics/event-schema-options.md (옵션 A 채택)
