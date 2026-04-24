# 이벤트 스키마 설계 기록

> 작성일: 2026-04-17
> 상태: **결정됨 — 옵션 A (플랫 JSON 단일 테이블)**
> 상위 PRD: [analytics-dashboard-v0.md](./analytics-dashboard-v0.md)

## 결정 요약

| 항목 | 선택 |
|------|------|
| 스키마 구조 | **옵션 A (플랫 JSON 단일 테이블)** |
| 세션 정의 (D1) | 클라이언트 sessionStorage UUID |
| 이벤트 중복 제거 (D2) | 무시 (MVP) |
| 집계 전략 (D3) | 실시간 쿼리 + 캐시 (1~5분) |
| 보존 기간 (D4) | 영구 (Free tier 한도까지) |
| 개인정보 (D5) | IP 미저장, UA 선택적 |
| GA 병행 (D6) | `Promise.allSettled`로 독립 처리 |

**변경 가능성**: 규모 확장 시 옵션 C(하이브리드)로 점진 전환 고려. 팀 리뷰는 사후 가능.

## 선택 배경

운영 분석 대시보드의 16개 KPI(팀 결정, PRD 반영)를 효율적으로 계산할 수 있는 **이벤트 수집 스키마**를 3안 비교 후 선택했다.

## 우리가 추적할 이벤트 목록

대시보드 16개 KPI 역산 → 필요한 이벤트:

| 카테고리 | 이벤트명 | 주요 속성 | 대응 KPI |
|---------|---------|----------|----------|
| 진입 | `page_entered` | page, is_returning | #1, #2, #4, #15 |
| 입력 | `input_started` | time_to_start_sec | #1, #2, #13 |
| 스텝 이동 | `step_advanced` | step_from, step_to | #9 |
| 스텝 뒤로 | `step_back_clicked` | step_from, step_to | #9 |
| 스텝 이탈 | `step_exited` | step, duration_sec | #9, #10 |
| 결과 조회 | `result_viewed` | total_amount, selections | #2, #3, #5, #7, #14, #16 |
| 스크롤 | `scroll_tracked` | page, depth_pct | #11 |
| 공유 | `share_result` | method | #7, #8 |
| 저장 | `save_clicked` | — | #7 (향후) |
| 페이지 이탈 | `page_exited` | page, duration_sec | #10 |

---

## 설계 옵션

### 옵션 A. 플랫 JSON 단일 테이블 ⭐ 권장

```prisma
model Event {
  id          BigInt   @id @default(autoincrement())
  visitorId   String   @map("visitor_id")  @db.VarChar(64)
  sessionId   String?  @map("session_id")  @db.VarChar(64)
  eventName   String   @map("event_name")  @db.VarChar(64)
  properties  Json?
  isDev       Boolean  @default(false) @map("is_dev")
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz

  @@index([createdAt(sort: Desc)], map: "idx_event_created_at")
  @@index([visitorId, createdAt(sort: Desc)], map: "idx_event_visitor_created_at")
  @@index([eventName, createdAt(sort: Desc)], map: "idx_event_name_created_at")
  @@map("events")
}
```

> **2026-04-22 구현 착수 시 반영된 조정 3가지**:
> 1. `timestamp` 제거, `createdAt` 하나로 통합 — 둘 다 서버 `now()`라 의미 중복
> 2. `@map`으로 DB 컬럼명 snake_case 매핑 — SQL 쿼리·Looker Studio 가독성 확보
> 3. `isDev` 플래그 추가 — GA4의 `?debug_mode=1` 패턴과 병행하여 개발·테스트 이벤트를 운영 데이터와 격리. 모든 평시 쿼리는 `WHERE is_dev = false` 기본 필터

**장점**
- 새 이벤트 추가 시 마이그레이션 불필요 → 실험 속도 빠름
- 스키마 단순, 이해 쉬움
- Postgres JSONB로 `properties->>'total_amount'` 쿼리 가능
- MVP 규모(일 수천 건)에서 성능 충분

**단점**
- properties 타입 검증이 애플리케이션 레이어 (TS 타입으로 보완)
- 집계 쿼리가 JSONB path 사용 → 약간의 가독성 손실

---

### 옵션 B. 이벤트 타입별 정규화 테이블

```prisma
model PageView {
  id         BigInt   @id @default(autoincrement())
  timestamp  DateTime @default(now()) @db.Timestamptz
  visitorId  String
  page       String
  isReturning Boolean
}

model StepAdvance {
  id        BigInt   @id @default(autoincrement())
  timestamp DateTime @default(now()) @db.Timestamptz
  visitorId String
  stepFrom  Int
  stepTo    Int
}

model ResultViewed {
  id           BigInt   @id @default(autoincrement())
  timestamp    DateTime @default(now()) @db.Timestamptz
  visitorId    String
  totalAmount  Int
  selections   Json
}

// ... 나머지 이벤트 타입 테이블
```

**장점**
- 타입 안전, 스키마 명확
- 집계 쿼리가 단순 (JSONB path 불필요)

**단점**
- 이벤트 추가마다 Prisma 마이그레이션 → 실험 속도 느림
- 테이블 7~10개로 증가
- 세션 추적 시 UNION/JOIN 쿼리 필요 → 복잡도 증가

---

### 옵션 C. 하이브리드 (공통 필드 구조화 + JSON properties)

```prisma
model Event {
  id          BigInt   @id @default(autoincrement())
  timestamp   DateTime @default(now()) @db.Timestamptz
  visitorId   String   @db.VarChar(64)
  sessionId   String?  @db.VarChar(64)
  eventName   String   @db.VarChar(64)
  // 자주 쓰는 공통 구조화 필드
  pageUrl     String?  @db.VarChar(255)
  isReturning Boolean?
  durationSec Int?
  // 이벤트별 고유 데이터
  properties  Json?

  @@index([timestamp(sort: Desc)])
  @@index([visitorId, timestamp(sort: Desc)])
  @@index([eventName, timestamp(sort: Desc)])
  @@map("events")
}
```

**장점**
- 자주 쓰는 필드는 구조화 → 인덱싱·쿼리 빠름
- 이벤트별 고유 속성은 JSON → 유연성 유지
- A와 B의 중간 지점

**단점**
- "공통 필드"와 "properties"의 경계 판단 필요 (설계 디스커션 유발)
- 공통 필드에 들어가지 않은 속성이 나중에 자주 쓰이면 마이그레이션 필요

---

## 옵션 비교 요약

| 기준 | A (플랫 JSON) | B (정규화) | C (하이브리드) |
|-----|-------------|----------|--------------|
| 새 이벤트 추가 속도 | 🟢 즉시 | 🔴 마이그레이션 필요 | 🟡 대부분 즉시 |
| 타입 안전 | 🟡 앱 레이어 | 🟢 DB 레이어 | 🟡 혼합 |
| 쿼리 단순성 | 🟡 JSONB path | 🟢 straightforward | 🟡 혼합 |
| 확장성 | 🟢 높음 | 🔴 낮음 | 🟢 높음 |
| MVP 적합성 | 🟢 매우 좋음 | 🔴 오버엔지니어링 | 🟡 괜찮음 |

**추천**: 옵션 A (플랫 JSON)
**이유**: MVP 단계에서 이벤트 구조가 자주 변할 가능성, 트래픽 낮음, 집계 쿼리 복잡도 감당 가능.
규모가 커지면 옵션 C로 점진 전환 가능 (공통 필드를 별도 컬럼으로 승격).

---

## 추가 결정 포인트 6개

팀 논의 시 짚고 넘어가야 할 항목들.

### D1. 세션(Session) 정의
- **안1**: 클라이언트에서 sessionStorage UUID 생성 → 탭 닫히면 끝
- **안2**: 서버 레벨에서 visitor_id + inactive timeout (예: 30분) → "세션" 재구성
- **추천**: 안1 (MVP 단순). 필요 시 서버 집계로 안2 흉내 가능.

### D2. 이벤트 중복 제거 (멱등성)
- 클라이언트 재시도 시 같은 이벤트가 2번 기록될 위험
- **안1**: 무시 (MVP, 영향 미미)
- **안2**: `clientEventId` UUID 필드 추가 + UNIQUE 인덱스
- **추천**: 안1 시작 → 문제 관찰되면 안2

### D3. 집계 전략
- **안1 (실시간)**: 대시보드 요청 시마다 raw events 쿼리로 계산
- **안2 (배치)**: 크론으로 daily_metrics 테이블 미리 계산
- **추천**: 안1 — 우리 트래픽 규모에서 raw 쿼리 충분, 캐시(1분~5분)로 보강

### D4. 데이터 보존 기간
- **안1**: 영구 보관 (Neon Free tier: 0.5 GB → 수개월 충분)
- **안2**: 90일 이후 월별 집계만 유지
- **추천**: 안1 — 용량 도달 전까지 영구, 모니터링 후 재검토

### D5. 개인정보 (PII)
- visitor_id는 UUID → PII 아님 ✓
- IP 저장 여부: **저장하지 않음** (GA에서도 익명화)
- User-Agent: 기기/브라우저 분포 파악 위해 저장 가능 (민감도 낮음) — 필요 시 추가

### D6. GA와 병행 동기화
- **trackEvent() 호출 시**:
  - GA 전송 + 자체 API 전송 (Promise.allSettled로 독립 처리)
  - 둘 중 하나 실패해도 다른 쪽은 계속 동작
- 자체 API 실패 시 큐잉/재시도: **MVP에서는 생략** (실패는 로그만)

---

## 다음 단계

1. ✅ 스키마 선택 완료 (옵션 A)
2. `prisma/schema.prisma`에 Event 모델 추가 + 첫 마이그레이션
3. `POST /api/events` 구현
4. `trackEvent()` 확장 (GA + 자체 API 병행)
5. `/admin/dashboard` 페이지 + recharts 차트 16개
6. 환경변수 기반 비밀번호 인증
