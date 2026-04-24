# 이벤트 수집 파이프라인 운영 원칙

> 작성일: 2026-04-22
> 상태: **활성 — Neon Postgres + GA 병행 수집**
> 관련 문서: [analytics-dashboard-v0.md](./analytics-dashboard-v0.md), [event-schema-options.md](./event-schema-options.md)

## 결정 요약

| 항목 | 선택 |
|------|------|
| 수집 대상 DB | **Neon Postgres** (Vercel Marketplace, Singapore) |
| 분석 도구 | Prisma Studio (raw) + Looker Studio (시각화 옵션) |
| GA4 관계 | **병행 수집** (GA4 중단 없음) |
| 쓰기 실패 처리 | Silent fail (재시도 안 함, GA4가 백업) |
| 인증 | MVP는 인증 없음 (Phase 2/3에서 사용자 계정과 연결) |
| 장기 확장 | 일 10만 건 돌파 시 BigQuery export 추가 (hybrid) |

## 왜 이 구조인가

### 2026-04-22 결정의 맥락

- **2026-04-19 피벗**: 자체 DB + 대시보드 경로를 **Phase 2/3 보류**, MVP는 GA4+Looker 경량 경로로 전환 (analytics-dashboard-prd 참조)
- **2026-04-22 재개 사유**: Looker Studio Data Blending에서 **365%라는 논리적으로 불가능한 전환율** 발생 → 원인이 GA 커넥터의 암묵적 차원 집계 한계로 추정 → **투명한 raw 데이터 접근**이 더 이상 "언젠가의 일"이 아니라 현재 디버깅의 전제조건이 됨
- **Neon은 이미 프로비저닝 완료** (2026-04-17): 인프라 부담 없음. Event 모델 추가 + `/api/events` 엔드포인트만 구현하면 즉시 가동

### 왜 BigQuery 대신 Neon인가

| 기준 | BigQuery | Neon (선택) |
|------|----------|-------------|
| 인프라 준비 상태 | GCP 프로젝트·결제 신규 셋업 필요 | **이미 완료** |
| Phase 2/3 기능과의 관계 | 분리 (분석 전용) | **통합** (User/Save 테이블과 같은 DB) |
| 디버깅 친화도 | SQL | **SQL + Prisma Studio GUI** |
| 과거 2주치 데이터 | 수출 불가 | GA4에만 존재 (감수) |
| MVP 규모 적합성 | 과함 (대형 서비스용) | **MVP 1~3년 여유** (0.5GB Free tier) |

### 왜 GA4를 중단 안 하나

- **과거 데이터 보존** — GA4에만 쌓여 있는 2주치 이벤트는 Neon에 소급 주입 불가
- **무료 백업 역할** — Neon 쓰기 실패 시 GA4가 누락 방지
- **Google 생태계 부수 효과** — Search Console, Ads 등과의 자동 연동 유지

## 파이프라인 아키텍처

```
[사용자 브라우저]
      │
      ├─→ [GA4]  (google-analytics.com/collect)
      │    └ 기존 경로, 변경 없음
      │
      └─→ [우리 API]  (POST /api/events)
           └─→ [Prisma] ─→ [Neon Postgres]
                              └ events 테이블에 raw 적재
```

### 두 경로는 독립적

`src/lib/gtag.ts`의 `trackEvent()` 내부에서 `Promise.allSettled`로 병렬 호출.
**한쪽이 실패해도 다른 쪽 진행.** 사용자 UI 블로킹 없음.

## 파일 위치 및 역할

| 경로 | 역할 |
|------|------|
| `prisma/schema.prisma` | `Event` 모델 정의 (옵션 A 플랫 JSON) |
| `src/lib/db.ts` | Prisma 클라이언트 싱글톤 |
| `src/app/api/events/route.ts` | POST 엔드포인트 (이벤트 수신 + DB 삽입) |
| `src/lib/gtag.ts` | `trackEvent()` 확장 — GA + 우리 API 병행 호출 |
| `src/lib/visitor.ts` | 기존 유지 — `visitor_id` 생성/조회 |

## 주의사항 (Claude 세션 공통)

### 이벤트 추가 시 체크리스트

새 이벤트 이름을 코드에 추가할 때:

- [ ] **snake_case 통일** — `input_started` ✅, `inputStarted` ❌
- [ ] **`event-schema-options.md` 이벤트 목록에 추가** — 단일 진실의 원천
- [ ] **GA4 파라미터 ↔ DB `properties` JSON 동일 구조** 유지 — 이벤트 이름/파라미터명 두 경로에서 동일하게
- [ ] **GA4 커스텀 측정기준 등록 여부 확인** (새 파라미터 추가 시)

### DB 설계 원칙

- **`properties` JSON은 최소 필드만** — 계산·복원 가능한 파생 값 금지 (total_amount는 OK, formatted_amount는 금지)
- **PII 금지** — 이름, 이메일, 전화번호, 주소 같은 개인정보는 `properties`에 포함하지 않음
- **`timestamp`는 서버 시각 기준** — 클라이언트 시계 신뢰 안 함 (`@default(now())` 활용)
- **`visitor_id` 필수, `session_id`는 옵셔널** — visitor는 localStorage 기반, session은 탭 단위 sessionStorage
- **IP 미저장** — Next.js Route Handler에서 `request.headers.get('x-forwarded-for')` 의도적으로 안 읽음

### API 구현 원칙

- **인증 없음 (MVP)** — `/api/events`는 public 엔드포인트. 악용 방지 위해 **rate limit** 고려 (Phase 2/3에서 Vercel Edge Middleware 또는 Upstash Redis)
- **쓰기 실패 silent** — DB 에러 발생 시 재시도하지 않고 조용히 `202 Accepted` 반환. 사용자 경험 우선. GA4가 독립 백업 역할
- **응답은 빠르게** — Route Handler에서 DB 쓰기 대기 없이 `return new Response(null, { status: 202 })` 후 백그라운드 처리 (fire-and-forget). Next.js의 `waitUntil` 패턴 활용
- **PoP 최적화** — Neon이 Singapore 리전이므로 Vercel 함수도 `ap-southeast-1` 인근 region에 배포 (기본 `iad1`이면 한국→미국→싱가포르 역류 발생)

### 개발/테스트 시 주의

- **로컬 dev에서도 같은 Neon DB 바라봄** — `.env.local`의 `DATABASE_URL`이 프로덕션 Neon과 동일. **테스트 이벤트가 프로덕션 데이터에 섞임**
- **대응 방안 1 (임시)** — 개발 시 `event_name`에 `_dev` suffix 추가 or `properties.is_dev: true` 플래그
- **대응 방안 2 (영구)** — Neon Branching으로 dev 브랜치 DB 생성, `.env.local`만 교체 (Phase 2/3에 정식 도입 권장)

### Phase 2/3 진입 시 합류 계획

- **User 테이블 추가** → `Event.visitor_id`를 `user_id`로 매핑 (로그인 시점 이전 이벤트를 계정에 귀속)
- **BudgetSave 테이블** → `Event.properties.budget_save_id` 로 시뮬레이션 결과 참조
- **BigQuery Hybrid 도입 시점** → Neon 저장 용량이 0.3GB 도달하거나 일 이벤트가 5만 건 돌파할 때

## 용량/비용 계획

- **이벤트 1건 예상 크기**: 300 bytes (params JSON + 인덱스 포함)
- **Neon Free 0.5GB 수용**: 약 167만 건
- **일 100건 (MVP 초기)**: 약 45년 여유
- **일 1,000건 (소규모 성장)**: 약 4.5년
- **일 10,000건 (본격 성장)**: 약 5개월 — 이 시점에 Launch 플랜($19/월, 10GB) 업그레이드

## 구현 순서 (초기 도입)

1. `prisma/schema.prisma`에 `Event` 모델 추가 ([event-schema-options.md 옵션 A](./event-schema-options.md#옵션-a-플랫-json-단일-테이블-권장) 참조)
2. `bun run db migrate dev --name init_events` → Neon에 테이블 생성
3. `src/lib/db.ts` — Prisma 클라이언트 싱글톤
4. `src/app/api/events/route.ts` — POST 엔드포인트
5. `src/lib/gtag.ts` 수정 — `trackEvent()` 내부에서 GA + 우리 API 병행 호출
6. Vercel 배포 → 실제 이벤트 쌓이는지 `bun run db studio`로 확인
7. Looker Studio에서 BigQuery 커넥터 대신 **Neon 직접 쿼리** 또는 **우리 API + Prisma Studio**로 대시보드 이행 (별도 작업)
