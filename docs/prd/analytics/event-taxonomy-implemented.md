# 버짓로드 이벤트 Taxonomy — 현재 구현 현황 (팀 공유)

> **목적**: 지금 실제로 코드에 심어져 동작 중인 분석 이벤트가 무엇인지, 각 이벤트에 어떤 속성이 왜 붙는지, 어디로 전송·저장되는지를 팀 전체가 같은 그림으로 이해한다.
> **이 문서로 하려는 것**: 이걸 기준선으로 **빠진 속성·이벤트(세션 ID, 언어 ID, 공유/저장 액션 등)** 를 파악하고, taxonomy v2를 설계·합의한다.
>
> - 설계 의도(권위 출처): `docs/prd/analytics/event-schema-options.md` (옵션 A — 플랫 JSON 단일 테이블)
> - 구현 진입점: `src/lib/gtag.ts` `trackEvent()`
> - 작성 기준일: 2026-06-01 / 코드 기준 검증 완료.

---

## 0. 30초 요약 (TL;DR)

- `trackEvent(name, params)` 한 함수가 **두 곳으로 동시 전송**: ① **GA4**(gtag), ② **Supabase `events` 테이블**(`POST /api/events`).
- 현재 **이벤트 11개**가 심어져 있고, 핵심 퍼널 5단계를 대체로 커버한다.
- **모든 이벤트에 자동으로 붙는 건 `visitor_id` 하나** (+ 저장 시 `is_dev`, `created_at`).
- ⚠️ **비어 있는 것**: 세션 ID(컬럼은 있는데 항상 NULL), 언어 ID, **공유·저장·다운로드 액션 이벤트**(= Intent 단계 측정 공백), `result_viewed`에 **총 예산액 없음**.

---

## 1. 어떻게 동작하나 (전송 아키텍처)

```
컴포넌트에서 trackEvent('result_viewed', {persona, ...})
        │
        ├─▶ ① GA4         gtag('event', name, {...params, visitor_id})   ← 실시간 대시보드
        │                  (NEXT_PUBLIC_GA_ID 있을 때만 로드)
        │
        └─▶ ② Supabase    POST /api/events {visitor_id, event_name, properties}
                           → Prisma로 events 테이블 insert (keepalive:true)   ← 원천 데이터·SQL 분석
```

- **③ Vercel Analytics**(`<Analytics/>`, layout.tsx)도 켜져 있지만 **자동 페이지뷰 + Web Vitals만** 수집한다. `trackEvent` 커스텀 이벤트는 **Vercel로 안 간다.**
- 두 경로는 병렬·독립이라 한쪽이 실패해도 다른 쪽은 전송된다. 단 **Supabase 전송 실패는 조용히 무시**된다(`.catch(()=>{})` — 실패 원인 로깅 없음).

### 모든 이벤트에 자동으로 붙는 공통 속성

| 속성 | 값 | 어디서 | 비고 |
|---|---|---|---|
| `visitor_id` | UUID | 클라이언트·서버 양쪽 | localStorage `budgetroad_visitor_id`에 영구 저장. 최초 방문 시 `crypto.randomUUID()` 생성, 재방문 시 동일 ID |
| `is_dev` | true/false | 서버(API) | `NODE_ENV !== 'production'` — 개발 데이터 필터용 |
| `created_at` | timestamp | 서버(DB) | insert 시각 |
| `is_returning` | yes/no | `service_entered`만 | TrackPageEnter가 붙임. 재방문 여부 |

> 💡 즉 "세션", "언어", "유입경로", "기기"는 **어떤 이벤트에도 자동으로 안 붙는다.**

---

## 2. Supabase `events` 테이블 스키마

`prisma/schema.prisma`의 `model Event` (플랫 JSON 단일 테이블 = 설계 옵션 A):

| 컬럼 | 타입 | 의미 |
|---|---|---|
| `id` | BigInt PK | 자동 증가 |
| `visitor_id` | VarChar(64) | 클라이언트 UUID (방문자 식별) |
| `session_id` | VarChar(64) **nullable** | ⚠️ **컬럼만 있고 항상 NULL** — 코드에서 안 채움 |
| `event_name` | VarChar(64) | 이벤트 이름 (`result_viewed` 등) |
| `properties` | Json? | 이벤트별 고유 속성 (아래 카탈로그의 속성들) |
| `is_dev` | Boolean | 개발/프로덕션 구분 |
| `created_at` | Timestamptz | 발생(저장) 시각 |

- 인덱스: `created_at` desc / `[visitor_id, created_at]` / `[event_name, created_at]` → 시계열·방문자별·이벤트별 쿼리 최적화. **`session_id`는 인덱스 없음(미사용).**
- API(`/api/events`)는 `visitor_id`·`event_name` 필수, `properties` 선택. `session_id`는 요청에서 받지도 않는다.

---

## 3. 현재 심어진 이벤트 11개 (카탈로그)

핵심 퍼널 **Entered → Input Started → Result Viewed → Intent Created → Revisited** 순으로 정리. 모든 이벤트는 위의 공통 속성(`visitor_id` 등)을 함께 갖는다.

### 🟦 Entered (진입)

| 이벤트 | 발생 시점 | 속성 | 파일 |
|---|---|---|---|
| `service_entered` | 랜딩(`/`) 진입 시 | `is_returning` (yes/no): 재방문자 식별 → 리텐션 | page.tsx:77 |
| `cta_clicked` | 랜딩의 "예산 추정 시작하기" 클릭 | (없음) | cta-link.tsx:13 |
| `budget_draft_entered` | 온보딩 페이지(`/budget-draft`) 진입 | (없음) | budget-draft:50 |

### 🟩 Input Started (입력)

| 이벤트 | 발생 시점 | 속성 (왜) | 파일 |
|---|---|---|---|
| `input_started` | **첫 선택**을 한 순간(세션당 1회) | `time_to_start_sec`: 진입→첫 입력까지 초 → 시작 마찰 측정 | budget-draft:112 |
| `onboarding_question_answered` | 14문항 중 아무 선택지나 클릭할 때마다 | `question_id` (Q1·Q2·Q3·Q4·Q7·Q8·T2·T5·T7·M1~M5): 어떤 질문 / `choice_id` (A~D): 어떤 선택 → 답변 분포·쏠림 분석 | budget-draft:118 |
| `back_clicked` | "이전" 버튼 클릭 | `from_step` (1~14): 어느 단계에서 되돌아갔나 → 재고/이탈 지점 | budget-draft:163 |

> ⚠️ **"다음"(전진) 클릭은 추적 안 됨.** 전진 시퀀스는 `onboarding_question_answered`로 간접 추정만 가능. (설계 문서의 `step_advanced`는 미구현)

### 🟨 Result Viewed (결과)

| 이벤트 | 발생 시점 | 속성 (왜) | 파일 |
|---|---|---|---|
| `result_viewed` | 로딩 끝나고 결과 화면 렌더 | 아래 ▼ | budget-draft:158 |

`result_viewed`의 속성 (`buildResultPayload`, budget-draft:124-139):
- `persona` (전통격식/표준실용/경험연출/본질미니멀/탐색미결정) — 핵심 세그먼트
- `axis_a`, `axis_b` — 2축 점수(분류 근거)
- `time_in_steps_sec` — 첫 입력→결과까지 총 소요(완주 속도)
- `q1, q2, q3, q4, q7, q8, t2, t5, t7, m1, m2, m3, m4, m5` — **14개 답변 전체**(소문자 key로 펼침)

> ⚠️ **`result_viewed`에 "계산된 총 예산액"이 없다.** 총액(`total_budget`)은 아래 피드백 이벤트에만 들어간다 → "결과를 본 사람들에게 얼마가 보였나"를 result_viewed만으로는 못 본다.

### 🟧 Intent Created (저장/공유 — 전환)

| 이벤트 | 발생 시점 | 속성 (왜) | 파일 |
|---|---|---|---|
| `feedback_rated` | 결과 하단 만족도 이모지(1~5) 클릭 | `rating`(1~5) + `persona`·`region`·`season`·`total_budget`(결과 맥락) → 유형/지역/가격대별 만족도 | feedback-card:66 |
| `feedback_submitted` | 의견 텍스트 입력 후 "보내기" (**댓글이 비어있지 않을 때만**) | `rating`·`comment`(최대 500자) + `persona`·`region`·`season`·`total_budget` → 정성 피드백 | feedback-card:72 |

> 🔴 **여기가 가장 큰 공백.** 퍼널의 Intent 단계 KPI는 "저장/공유율"인데, **실제 저장·공유·다운로드 버튼(PDF/이미지/결과 공유하기)은 어떤 이벤트도 발생시키지 않는다.** 현재 Intent 단계는 *만족도 피드백*으로만 측정된다. (설계 문서의 `share_result`는 미구현)

### 🟪 Revisited (재방문)

| 이벤트 | 발생 시점 | 속성 | 파일 |
|---|---|---|---|
| `shared_result_viewed` | 공유 링크(`?r=`)로 결과에 바로 진입 | (없음) | budget-draft:63 |
| `result_reset_clicked` | 결과 화면에서 "다시하기" | (없음) | budget-draft:170 |

> `shared_result_viewed`는 **링크를 받은 사람(뷰어)** 쪽만 잡는다. **링크를 만든 사람(공유자)** 의 공유 행동은 안 잡힌다(위 Intent 공백과 연결). 또 누구의 링크인지 구분할 속성도 없다.

---

## 4. 핵심 퍼널 ↔ 이벤트 매핑 (측정 공백 한눈에)

| 퍼널 단계 (KPI) | 측정 이벤트 | 상태 |
|---|---|---|
| Entered | service_entered, cta_clicked, budget_draft_entered | ✅ |
| Input Started | input_started, onboarding_question_answered, back_clicked | ✅ (전진 단계 추적은 약함) |
| Result Viewed | result_viewed | ✅ (총액 속성 없음) |
| **Intent Created (저장/공유)** | feedback_rated/submitted만 | 🔴 **저장·공유·다운로드 액션 미추적** |
| Revisited | shared_result_viewed, result_reset_clicked | 🟡 뷰어만, 세션 추적 불가 |

---

## 5. 빈틈 — v2에서 보강할 후보 (우선순위)

> 이 문서의 핵심 산출물. 새 taxonomy 설계 시 이 표를 출발점으로.

### 🔴 P0 — 측정 자체가 막히는 공백
| 항목 | 현재 상태 | 왜 필요 | 권장 |
|---|---|---|---|
| **세션 ID** | `session_id` 컬럼 존재하나 **항상 NULL** | 한 사람의 한 번 방문을 묶어야 퍼널·이탈을 정확히 본다 | `sessionStorage` UUID 생성 → 모든 `trackEvent`에 `session_id` 부착 |
| **저장/공유/다운로드 액션** | **이벤트 없음** | Intent Created(핵심 KPI)를 직접 못 잰다 | `result_view.tsx` `handleShareAction`에 `share_clicked`/`download_clicked`(method: link/pdf/image) 추가 |
| **`result_viewed` 총액** | 속성에 총 예산 없음 | "결과로 얼마가 보였나"가 분석의 기준값 | `result_viewed`에 `total_budget` 추가 |

### 🟡 P1 — 분석 폭을 넓히는 속성
| 항목 | 현재 | 권장 |
|---|---|---|
| **언어/로케일 ID** | `ko` 고정, 이벤트에 미포함 | 다국어 대비 `navigator.language` 캡처 → `language` 속성 |
| **전진 단계(step_advanced)** | back_clicked만 있음 | "다음" 클릭도 추적해 단계 이동 시퀀스 확보 |
| **유입 경로** | 없음 | `document.referrer` + `utm_*` 첫 진입 시 1회 |
| **공유자 구분** | 없음 | `shared_result_viewed`에 공유 출처/링크 식별 속성 |

### 🟢 P2 — 운영 품질
- **기기/뷰포트**(모바일·데스크톱 분포), **전송 실패 로깅**(현재 무시), **이벤트 스키마 버전**(`properties` 무버전 → 변경 시 쿼리 깨짐 대비), **Vercel 커스텀 이벤트 미활용**.

### 설계 문서엔 있으나 아직 미구현인 이벤트
`event-schema-options.md`에 명세는 있지만 코드엔 없는 것: `share_result`, `scroll_tracked`, `step_exited`, `page_exited`, `step_advanced`. v2에서 살릴지 결정 필요.

---

## 6. 회의 안건 체크리스트
- [ ] **세션 ID 도입**: sessionStorage UUID → 모든 이벤트 부착 (컬럼은 이미 있음)
- [ ] **공유/저장/다운로드 액션 이벤트 신설** (Intent KPI 측정)
- [ ] `result_viewed`에 `total_budget` 추가
- [ ] 언어 ID 부착 정책 (지금 넣을지, 다국어 시점에 넣을지)
- [ ] 전진 단계 추적(step_advanced) 도입 여부
- [ ] 미구현 설계 이벤트(scroll/exit 등) 살릴지 정리
- [ ] 이벤트 속성 검증(Zod) + 스키마 버전 필드 도입 여부

---

## 부록: 파일 지도
| 역할 | 파일 |
|---|---|
| 전송 함수(이중 전송) | `src/lib/gtag.ts` |
| Supabase 수집 API | `src/app/api/events/route.ts` |
| 저장 스키마 | `prisma/schema.prisma` (`model Event`) |
| 방문자 ID | `src/lib/visitor.ts` |
| 페이지 진입 추적 | `src/components/common/TrackPageEnter.tsx` |
| 온보딩·결과 이벤트 | `src/app/budget-draft/page.tsx` |
| 피드백 이벤트 | `src/components/result/feedback-card.tsx` |
| CTA | `src/app/cta-link.tsx` |
| GA4·Vercel 로드 | `src/app/layout.tsx` |
| 설계 의도(권위) | `docs/prd/analytics/event-schema-options.md` |
