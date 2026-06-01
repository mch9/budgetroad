# 버짓로드 이벤트 Taxonomy v2 — 지표 → 이벤트 설계 (팀 공유)

> **목적**: 팀이 보려는 지표(KPI·관찰지표·실험)를 **어떤 이벤트·속성을 심으면 측정되는지**로 1:1 번역한 설계서. 배포 전 이벤트 계측의 기준선.
> **작성 기준일**: 2026-06-01 / 결과 페이지 UI·온보딩 14문항·현재 계측을 코드로 검증함.
> **연관 문서**
> - 현재 구현 현황(v1): `docs/prd/analytics/event-taxonomy-implemented.md`
> - 스키마 결정(옵션 A 플랫 JSON): `docs/prd/analytics/event-schema-options.md`
> - ⚠️ 본 문서의 **세션 정의(30분 비활동)**는 위 스키마 문서의 D1(sessionStorage=탭 단위)을 **갱신**함.

---

## 0. 30초 요약 (TL;DR)

- 팀이 보려는 지표 대부분은 **"결과 페이지에서 뭘 만지는가"**(탭/토글/스크롤/공유)에 관한 것.
- 결과 페이지 UI(탭 3개 · 추가금 케어 토글 · 저장/공유/상담 버튼)는 **코드에 전부 이미 있음**. 그런데 **클릭·스크롤 이벤트가 하나도 안 심겨 있음**(현재 추적되는 건 `다시하기`뿐).
- 지표 분모가 전부 **"세션 수"** → **`session_id`(30분 비활동 기준) 도입이 1번 선결 조건.**
- **페르소나 5종을 세그먼트 축**으로: 결과 단계 모든 이벤트에 `persona`를 붙여 결과 유형별로 모든 지표를 쪼개 본다.
- 신설/확장할 이벤트 **12종** + 모든 이벤트 공통으로 `session_id` 부착.

---

## 1. 분석 단위 — visitor vs session (필독)

| 단위 | 뜻 | 식별자 | 예시 |
|---|---|---|---|
| **visitor(방문자)** | 사람/브라우저 한 명. 영구 | `visitor_id` (localStorage, 이미 있음) | 월·금 방문 = **visitor 1** |
| **session(세션/방문)** | 한 번 앉아서 쓴 단위 | `session_id` (**신규**) | 월·금 방문 = **session 2** |

- **세션 정의 = 마지막 활동에서 30분 이상 비활동 시 종료** (새 행동 = 새 세션). GA4 기본과 동일.
- 구현: `localStorage`에 `{ session_id, last_activity_ts }` 저장 → 이벤트 발생마다 `now - last_activity_ts > 30분`이면 `session_id` 새로 발급(`crypto.randomUUID()`), 아니면 재사용. 매 이벤트마다 `last_activity_ts = now` 갱신.
- **두 ID를 모든 이벤트에 함께 부착** → 지표별로 분모를 골라 쓴다.
  - 세션 단위: `COUNT(DISTINCT session_id)`
  - visitor 단위(재진입·유저당 누적): `COUNT(DISTINCT visitor_id)`

### "어디서 이탈하는가"는 session_id가 생기면 자동 도출
세션마다 **마지막 이벤트 = 이탈 지점**이다. 30분 비활동으로 세션이 닫히면, 그 세션의 마지막 이벤트가 사용자가 멈춘 곳.

### 결과 이벤트는 신규/공유 페이지 모두 발화 — 분모 스코핑 주의

결과 인터랙션 이벤트(탭·스크롤·토글·체류·공유)는 **신규 완주 결과와 공유 링크 결과 양쪽에서** 발화한다(같은 `ResultView` 컴포넌트). 단 **진입 이벤트가 달라** 세션을 구분할 수 있다:
- **신규 완주** → `result_viewed` 발화
- **공유 진입(`?r=`)** → `shared_result_viewed` 발화 (이 경우 `result_viewed`는 **미발화** — 로딩·결과확정 단계를 건너뜀)

→ **퍼널/OKR 지표(R1~R4 등)는 `result_viewed` 세션으로 스코핑**(신규 완주자), **공유 인게이지먼트 지표는 `shared_result_viewed` 세션으로 스코핑**. 둘은 한 세션에 동시 발생하지 않아 `session_id`로 깔끔히 분리된다. ⚠️ 분자도 같은 스코프로 계산해야 공유 세션 인터랙션이 퍼널 분자에 새지 않는다.
- 온보딩 중 이탈 → 마지막 `onboarding_step_viewed{step}` = 이탈 질문
- 결과에서 이탈 → `result_exited{last_tab, time_on_result_sec}` = 결과 이탈 맥락

---

## 2. 세그먼트 축 — 페르소나 5종

모든 **결과 단계 이벤트**에 `persona`를 붙여, 모든 지표를 결과 유형별로 분해한다.

`전통격식` · `표준실용` · `경험연출` · `본질미니멀` · `탐색미결정`
(2축 점수 `axis_a`·`axis_b`로 분류 — `src/lib/onboarding-v6.ts`)

- 예: "전통격식형은 추가금 케어 탭에 몇 %나 진입하나? 저장률은? 어디서 이탈하나?" → 결과 이벤트에 `persona`가 있으면 전부 `GROUP BY persona`로 나온다.
- ⚠️ **온보딩 단계 이벤트엔 persona 없음**: 페르소나는 14문항 완료 후 분류되므로, 중간 이탈자는 페르소나가 없다. **온보딩 이탈 분석은 페르소나가 아니라 질문/선택지 기준**으로만 가능.
- (확장) 지역·예산대 세그먼트가 필요해지면 동일 방식으로 속성 추가 가능. `result_viewed`에 `total_budget`을 넣으면 `session_id` 조인으로도 분해 가능.

### 2-1. 두 번째 세그먼트 축 — 결과 기반 코호트 (저장/공유한 사람 vs 안 한 사람)

페르소나가 **이벤트에 저장된 속성**(`GROUP BY persona`)이라면, "저장한 사람"은 **세션 단위로 사후 계산하는 코호트**다. **새 이벤트 불필요** — `share_action_clicked` 발생 여부로 세션에 깃발만 단다. (로그인 없는 현재 "저장"은 PDF/이미지 다운로드·링크 공유를 누른 것)

- **저장 코호트** = `share_action_clicked{method: pdf·image}`가 있는 세션
- **공유 코호트** = `share_action_clicked{method: link}`가 있는 세션
- **미전환** = `result_viewed`는 있으나 위 이벤트가 없는 세션

이걸로 **"저장/공유한 사람의 특징"**(원안 목표)을 본다 — 저장 세션 vs 미저장 세션의 **체류시간(`result_exited`)·토글 횟수(`care_option_toggled` COUNT)·탭/스크롤 도달률** 비교.
- 예: "저장자는 평균 토글 3.2회 vs 미저장 0.7회", "저장자의 종합설계서 100% 스크롤 비율 2배".
- **페르소나 × 코호트 2D**도 가능: "경험연출형 중 저장한 사람의 행동" 등. (단 코호트 라벨은 결과 도달 세션에만 의미 — `result_viewed` 기준)

---

## 3. 지표 → 이벤트 매핑

각 지표가 **무슨 행동을 보려는지** + **분모/분자 단위** + **필요 이벤트** + **페르소나 분해 가능 여부**.

### 3-1. 핵심 전환 (KPI)

| 지표 (목표) | 정의 (분자 / 분모) | 단위 | 필요 이벤트 | persona |
|---|---|---|---|---|
| 결과 도달률 ≥60% | `result_viewed` / `service_entered` | 세션 | 둘 다 보유 (+session_id) | △ 도달자만 |
| 저장률 ≥30% | `share_action_clicked`(저장계열) / `service_entered` | 세션·visitor | 🔴 신설 | ✅ |
| 답변 재수정률 ≥30% | `care_option_toggled` 발생 세션 / `service_entered` | 세션 | 🔴 `care_option_toggled`(신설) | ✅ |
| 시나리오 재생성률 ≥30% | `result_reset_clicked` / `service_entered` | 세션 | ✅ 보유 (persona 추가) | ✅ |

> 📝 **"답변 재수정률" = 추가금 케어 토글을 사용(클릭)한 세션의 비율** (팀 확인 2026-06-01). 온보딩 답변 변경이 아니라 **결과 페이지의 추가금 케어 토글 클릭** → `care_option_toggled`로 측정(세션 내 토글 ≥1회 = 사용). 결과 단계 이벤트라 **페르소나 분해 가능**. 어떤 옵션을 켜고/끄는지·몇 번 조정하는지는 `option_id`·`on`·COUNT로 함께 분석(§3-4 실험과 연결).
>
> 📝 **결과 유형별로 볼 때 분모 주의**: `care_option_toggled`엔 `persona`가 있어 **분자는 유형별로 쪼개짐**. 그러나 분모 `service_entered`(랜딩 진입)는 **페르소나가 없음**(진입 시점엔 미분류). 따라서 **"전통격식형의 토글 사용률"은 분모를 `result_viewed`(결과 도달=페르소나 존재)로** 계산: `care_option_toggled` 전통격식 세션 ÷ `result_viewed` 전통격식 세션, `GROUP BY persona`. 전체 KPI 30% 목표는 ÷`service_entered` 그대로 유지(헤드라인 숫자).
> 📝 "저장률"은 명칭상 "유저당 1회 이상"(visitor)이나 정의는 세션 분모. **세션·visitor 둘 다 산출** 권장.

### 3-2. 관찰지표 — Leading (결과 탐색 깊이)

| 지표 | 무엇을 보나 | 정의 | 필요 이벤트 | persona |
|---|---|---|---|---|
| 추가 비용 구조 조회율 | 추가금 케어 탭을 여는가 | `tab_viewed{care}` / `result_viewed` | 🔴 `result_tab_viewed` | ✅ |
| **결과 유형별 케어 조회율** | (구 "취향유지/예산방어") **페르소나별** 케어 진입율 | 위와 동일, `GROUP BY persona` | 🔴 `result_tab_viewed` | ✅ 핵심 |
| 항목별 내역 탐색률 | 항목별 탭을 여는가 | `tab_viewed{itemized}` / `result_viewed` | 🔴 `result_tab_viewed` | ✅ |
| 결과 페이지 체류시간 | 얼마나 머무는가 | `time_on_result_sec` 평균 | 🔴 `result_exited` | ✅ |
| **탭별 체류시간** | 어느 탭에 오래 머무나 | `dwell_*_sec`(종합·항목·케어) 평균 | 🔴 `result_exited`(탭별 dwell) | ✅ |
| 탭별 스크롤 탐색률 (영역 확인률) | 각 탭에서 **어디까지 봤나** | `scroll_depth{tab, ≥X%}` / `result_viewed` | 🔴 `result_scroll_depth` | ✅ |

### 3-3. 관찰지표 — Structural (조정 → 확정)

| 지표 | 정의 | 필요 이벤트 | persona |
|---|---|---|---|
| 저장/공유 전환율 (수단별) | `share_action_clicked{method}` / `result_viewed`<br>method = pdf · image · link(결과 공유하기) · expert | 🔴 `share_action_clicked` | ✅ |
| **공유 결과 재진입 후 수정** | 공유 링크(`?r=`)로 같은 결과에 진입한 세션 중 추가금 케어 토글로 수정한 비율 | `shared_result_viewed` + `care_option_toggled` (같은 `session_id`) | ✅ |

> 📝 **측정 가능 확인 ✅**: 공유 진입 세션(`shared_result_viewed`, 기존 이벤트) 중 `care_option_toggled`(신설)가 같은 `session_id`에 있는 비율. 결과 화면은 신규/공유 동일 컴포넌트라 공유 결과에서도 토글 이벤트가 동일 발화. 단 공유 링크는 **본인/공유받은 친구 누구나** 열 수 있어(로그인 없어 구분 불가) "공유 결과를 본 사람이 수정하는 비율"로 해석. 엄격한 '본인 재방문'은 로그인+저장 도입 후 `user_id`로 가능.

### 3-4. Execution (실험 / A·B 검증)

조정 행동의 인과 사슬. 전부 `session_id`로 세션 내 이벤트 시퀀스를 묶어 분석.

| 실험 가설 | 보는 것 | 이벤트 조합 | persona |
|---|---|---|---|
| 케어 탭 진입 → 옵션 조정하는가 | 진입자 중 조정 비율 | `tab_viewed{care}` → `care_option_toggled` | ✅ |
| 조정 → 예산 변동을 확인하는가 | 조정 후 같은 세션에서 **종합/항목별 탭으로 이동 = 확인** (정의 확정) | `care_option_toggled` → `result_tab_viewed`(종합·항목) | ✅ |
| 조정 → 저장/공유로 이어지나 | 조정 세션 vs 미조정 세션 전환율 비교 | `care_option_toggled` ↔ `share_action_clicked` | ✅ |
| 조정 **깊이**(0 / 1 / 2회+)별 전환·이탈 | 버킷별 **저장/공유 전환율 + 이탈률** 비교 | `care_option_toggled` 횟수 + `share_action_clicked` + `result_exited` | ✅ |
| 저장/공유 → 재진입하는가 | **저장 후 재오픈률**(pdf·image) · **공유 후 재진입률**(link) 각각 | `share_action_clicked{method}` + 재방문(다른 session, 같은 visitor) | ✅ |

> 마지막 행이 **visitor 단위**의 대표 사례: 재진입은 "같은 사람이 다른 세션으로 다시 옴"이라 visitor로만 잴 수 있다.
>
> 📝 **원안 Key 지표 8개 전수 커버** (이 표의 '보는 것'은 실험별 요약이라 줄 수가 적어 보일 뿐): 케어 탭 진입률→`result_tab_viewed{care}` · 추가 옵션 조정률→`care_option_toggled` · 예산 변동 확인률→`care_option_toggled`→`result_tab_viewed`(종합·항목 탭 이동=확인, 정의 확정) · 저장/공유 전환율→`share_action_clicked` · 옵션 조정 횟수→`care_option_toggled` COUNT · 이탈률→`result_exited` · 저장 후 재오픈률→`share_action_clicked{pdf,image}`+재방문 · 공유 후 재진입률→`share_action_clicked{link}`+재방문.

### 3-5. 온보딩 14문항 이탈 (요청 반영)

14문항: `Q1 Q2 Q3 Q4 Q7 Q8 T2 T5 T7 M1 M2 M3 M4 M5` (`src/lib/onboarding-v6.ts`)

| 지표 | 정의 | 필요 이벤트 | persona |
|---|---|---|---|
| 질문별 이탈률 | 세션별 `MAX(step)` 분포 — 어느 질문이 마지막이었나 | 🔴 `onboarding_step_viewed` | ❌ (분류 전) |
| 단계 전진율 | step N+1 도달 세션 / step N 도달 세션 | 🔴 `onboarding_step_viewed` | ❌ |

> 현재 "다음"(전진)은 추적 안 됨. `onboarding_step_viewed`(질문 노출 시 발화)만 있으면 **마지막 노출 질문 = 이탈 지점**으로 전 구간 이탈 퍼널이 나온다. (별도 `step_advanced`는 선택)
>
> **이탈 퍼널 예시**: step별 도달 세션이 `Q1 1000 → Q2 920 → Q3 905 → Q4 880 → Q7 760 → … → M5 610`이면, **가장 많이 빠지는 구간**(예: Q4→Q7 −120)이 최대 이탈 지점. **질문별 이탈률 = 1 − (다음 질문 도달 세션 ÷ 현재 질문 도달 세션)**. 세션별 `MAX(step)`로 "어디까지 갔나"를, 그 분포로 "어디서 많이 빠지나"를 본다. (뒤로 갔다 떠나도 MAX는 안 줄어 furthest-reached 기준으로 견고)

### 3-6. 페르소나별 결과 페이지 행동 흐름(Path) 추적 ★

> **"전통격식형은 결과 페이지에서 이탈까지 어떤 순서로 행동하나?"** — 이 분석이 본 설계의 핵심 목적.

별도 이벤트가 아니라 **이미 설계된 속성 조합으로 도출**된다:

| 무엇으로 | 역할 |
|---|---|
| `session_id` | 한 방문의 이벤트를 하나의 흐름으로 묶음 |
| `event_seq` (보조: `created_at`) | 흐름을 **시간순 정렬** |
| `persona` (결과 이벤트마다 부착) | **결과 유형 5종별로 분해** |
| `result_exited` (또는 흐름의 마지막 이벤트) | **이탈 지점·체류시간** |

**예시 — 한 세션의 행동 흐름**
`result_viewed → tab_viewed(care) → care_option_toggled ×2 → tab_viewed(itemized) → scroll_depth(itemized,100) → result_exited(45s, last_tab=itemized)`

**SQL 패턴** (세션별 경로 배열 → 페르소나별 집계)
```sql
SELECT persona,
       array_agg(event_name ORDER BY (properties->>'event_seq')::int) AS flow,
       count(*) AS action_count
FROM events
WHERE is_dev = false
  AND event_name LIKE 'result%' OR event_name IN ('care_option_toggled','share_action_clicked',...)
GROUP BY session_id, persona;
```
→ 페르소나별 **가장 흔한 경로 / 이탈 직전 마지막 행동 / 평균 행동 수 / 케어탭→저장 도달 비율**을 분해 분석.

> ⚠️ 온보딩 흐름은 페르소나로 못 나눔(§2). 본 path 분석은 **결과 페이지 진입 이후**(persona 확정 후) 구간에만 적용.

### 3-7. 전략 OKR (Strategy OKR) — 결정로그 ↔ 실행 OKR 사이 ★

> 누락됐던 중간 레이어: 결정로그(지표 세트) → **전략 OKR(R1~R4)** → 실행 OKR(§3-4).

**Objective**: 웨딩 유형(4분류)+비용 구조 이해 → 트레이드오프 조정 → '실행 가능한 계획' **자산화(저장/공유)** 행동 흐름 최적화·검증.
**Key(분석 테마)**: K1 유형분류→Result Viewed 도달·안정성 · K2 Result Viewed→옵션 상세/세이브포인트 탐색→재생성 · K3 재생성 시 항목별 변경 비중(트레이드오프) · K4 재생성→저장/공유→재진입 루프.

**R(측정 목표) → 이벤트** (모두 result 단계 → persona 분해 가능):

| R | 목표(임계) | 정의 (분자 / 분모=`result_viewed`) | 이벤트 |
|---|---|---|---|
| **R1** | 종합설계서 **80%+ 탐색** | comprehensive 스크롤 ≥80% 세션 | `result_scroll_depth{tab:comprehensive, depth_pct≥80}` |
| **R2-a** | 투자/세이브 포인트 영역 탐색 **≥50%** | 해당 섹션 노출 세션 | `result_section_viewed{section:'invest_save'}` (IntersectionObserver, 확정) |
| **R2-b** | **15초+ 체류 ≥40%** | `time_on_result_sec`≥15 세션 | `result_exited` |
| **R3-a** | 케어 토글 사용 **≥30%** | `care_option_toggled` 세션 | `care_option_toggled` |
| **R3-b** | 토글→다시하기 **≥30%** | (분모=**토글 세션**) `result_reset_clicked` 발생 | `care_option_toggled`↔`result_reset_clicked` |
| **R4** | 저장/공유 완료 **≥60%** | `share_action_clicked{method ∈ pdf·image·link}` 세션 (expert 제외) | `share_action_clicked` |

> **R2-a 영역** = 종합설계서의 "여기에 더 투자하는 게 좋아요 / 여기서 줄여도 괜찮아요"(투자·세이브 포인트). 정확한 추적은 섹션 화면진입(IntersectionObserver) 권장.

---

## 4. 신설 / 확장 이벤트 카탈로그

### 공통 속성 (모든 이벤트 자동 부착)
`visitor_id`(기존) · **`session_id`(신규, 30분 비활동)** · `is_dev`(서버) · `created_at`(서버) · **`event_seq`(신규, 행동 흐름 정렬용)**

> **`event_seq`** = 세션마다 0부터 1씩 증가하는 정수(클라이언트 부착). 행동 흐름(path) 분석의 **정렬 키**. fire-and-forget 전송이라 서버 `created_at`만으론 동시각 이벤트 순서가 흔들릴 수 있어 보강. 컬럼 추가 없이 `properties`에 넣으면 마이그레이션 불필요(옵션 A 장점).

### 이벤트 목록

| # | 이벤트 | 상태 | 발생 시점 | 핵심 속성 |
|---|---|---|---|---|
| 1 | `service_entered` | ✅ 기존 | 랜딩 진입 | `is_returning` |
| 2 | `cta_clicked` | ✅ 기존 | 랜딩 CTA 클릭 | — |
| 3 | `budget_draft_entered` | ✅ 기존 | 온보딩 진입 | — |
| 4 | `onboarding_step_viewed` | 🔴 신설 | **질문 노출 시마다** | `step`, `question_id` |
| 5 | `onboarding_question_answered` | ✅ 기존 | 선택지 클릭 | `question_id`, `choice_id` |
| 6 | `back_clicked` | ✅ 기존 | 이전 버튼 | `from_step` |
| 7 | `input_started` | ✅ 기존 | 첫 선택 | `time_to_start_sec` |
| 8 | `result_viewed` | 🟡 확장 | 결과 렌더 | 기존(persona·2축·14답변·time_in_steps_sec) **+ `total_budget`** |
| 9 | `result_tab_viewed` | 🔴 신설 | 탭 활성화 | `tab`(comprehensive/itemized/care), `is_first_view`, **`persona`** |
| 10 | `itemized_category_expanded` | 🔴 신설 | 항목별 내역 카테고리 드롭다운 클릭 | `category`(예식장/스드메/예물·예단/혼수/신혼여행), `expanded`(bool), **`persona`** |
| 11 | `care_option_toggled` | 🔴 신설 | 추가금 케어 토글 | `option_id`, `category`, `on`, **`persona`** |
| 12 | `care_bulk_toggled` | 🔴 신설 | 전체 켜기/끄기 | `action`(all_on/all_off), **`persona`** |
| 13 | `result_scroll_depth` | 🔴 신설 | 탭별 스크롤 도달 | `tab`, `depth_pct`(25/50/**80**/100 — R1=80% 기준), **`persona`** |
| 14 | `result_exited` | 🔴 신설 | 결과 이탈(visibilitychange/pagehide) | `time_on_result_sec`, `last_tab`, 탭별 **`dwell_comprehensive_sec`·`dwell_itemized_sec`·`dwell_care_sec`**, **`persona`** |
| 15 | `share_panel_opened` | 🔴 신설 | 저장&공유 버튼(푸터) 클릭 = 모달 열기(**의향**) | **`persona`** |
| 16 | `share_action_clicked` | 🔴 신설 | 모달 내 PDF/이미지/링크/상담 클릭 = **최종 전환** | `method`(pdf/image/link/expert), **`persona`** |
| 17 | `result_reset_clicked` | 🟡 확장 | 다시하기 | **+ `persona`** |
| 18 | `shared_result_viewed` | ✅ 기존 | 공유 링크 진입 | — |
| 19 | `satisfaction_answered` | 🔴 교체 | 저장&공유 시 뜨는 만족도 팝업 응답(예/아니요) | `matched`(yes/no), `persona`, `total_budget` |
| 20 | `result_section_viewed` | 🔴 신설 | 종합설계서 투자/세이브 포인트 섹션 화면 진입(IntersectionObserver) | `section`(invest_save), **`persona`** (R2-a) |

> **method 매핑(현재 UI 기준)**: PDF로 내려받기 → `pdf` / 이미지로 저장하기 → `image` / 결과 공유하기(링크) → `link` / 전문가 상담 신청하기 → `expert`.
> **저장/공유 흐름(만족도 설문 게이트 포함)**: `share_panel_opened`(푸터 '저장&공유' 클릭 = 저장 흐름 진입, **의향**) → (세션 첫 진입이면) **만족도 팝업** → `satisfaction_answered{matched}`(예/아니요 답 시. 닫기는 발화 없음) → 저장 모달 → `share_action_clicked`(모달 4개 버튼 = **최종 전환**). **전환율 분자 = `share_action_clicked`.** 설문은 **비강제**(닫기도 저장 모달로 진행), **세션 1회**.
> **만족도 설문 변경(2026-06-01)**: 기존 종합 설계서 하단 **이모지 5단 카드**(`feedback_rated`/`feedback_submitted` + 자유텍스트) **폐기** → 위 팝업으로 이동. 질문 "이 결과가 내가 원하는 결혼 스타일과 잘 맞는다고 느끼셨나요?" · **예/아니요 이진** · 닫기 O · 자유텍스트 X. → 만족도는 이제 **저장 의향자 표본**(전체 결과조회자 아님).
> **전문가 상담**: 현재 `'곧 만나요!'` 토스트만 뜨는 더미. **클릭률만** 의향 신호로 수집(다음 사이클 논의용).
> **항목별 내역 드롭다운**: 5개 카테고리 각각의 펼침 버튼(`tab-itemized.tsx:99`). `category`로 **어느 항목의 상세 내역을 가장 많이 열어보는지** 분석. PDF/이미지 캡처용 `forceExpand` 자동 전개는 사용자 행동이 아니므로 **제외**(실제 onClick에만 발화).

---

## 5. UI ↔ 이벤트 매핑 (코드 위치)

| UI 요소 | 컴포넌트 | 붙일 이벤트 |
|---|---|---|
| 결과 탭 3개 | `result-view.tsx` (`activeTab`) | `result_tab_viewed` |
| 추가금 케어 토글 23종 | `tabs/tab-care.tsx` (`setToggle`) | `care_option_toggled` |
| 전체 켜기/끄기 | `tabs/tab-care.tsx` (`setAllToggles`) | `care_bulk_toggled` |
| 항목별 내역 카테고리 드롭다운 5개 | `tabs/tab-itemized.tsx:99-101` (`toggleExpanded`) | `itemized_category_expanded` |
| 결과 콘텐츠 스크롤 | `result-view.tsx` (스크롤 영역) | `result_scroll_depth` |
| 저장&공유 버튼(푸터, 모달 열기) | `result-view.tsx` (`onShareClick`) | `share_panel_opened` |
| 모달 내 PDF/이미지/링크/상담 | `result-view.tsx` (`handleShareAction`) | `share_action_clicked` |
| 온보딩 step 전환 | `app/budget-draft/page.tsx` (`step` state) | `onboarding_step_viewed` |
| 세션 ID | `src/lib/gtag.ts` (+ 신규 `src/lib/session.ts`) | 전 이벤트 공통 |

---

## 6. 구현 순서 제안 (작은 단위)

1. **`session_id` 도입** — `src/lib/session.ts`(30분 비활동) + `gtag.ts`에서 전 이벤트 부착. (모든 세션 지표의 선결)
2. **결과 페이지 계측** — 탭/토글/아코디언/스크롤/이탈/공유 + 모든 결과 이벤트에 `persona` 부착, `result_viewed`에 `total_budget`.
3. **온보딩 이탈 계측** — `onboarding_step_viewed`.
4. **Looker/SQL** — 세션 단위 퍼널 + 페르소나 분해 쿼리.

---

## 7. 다음 사이클 / 미해결

- 전문가 상담 실제 기능(현재 더미) — 클릭률 데이터로 우선순위 판단.
- 지역·예산대 세그먼트 확장 여부.
- 이벤트 속성 검증(Zod)·스키마 버전 필드 — 변경 대비.
- Supabase 전송 실패 조용히 무시(`.catch(()=>{})`) → 실패 로깅(데이터 신뢰도).
- **로그인 도입(다음 사이클) 대비 — 지금 해둘 것**: ① `visitor_id`를 어떤 동작에도 리셋 금지(로그인 전 익명 활동 ↔ 계정 잇는 다리). ② 이벤트에 `user_id`(nullable, 로그인 후 부착) 슬롯 예약 — 옵션 A라 스키마 변경 불필요, 이름만 합의. ③ 로그인 시 `visitor_id ↔ user_id`를 잇는 `login`(identify) 이벤트 1개. ④ 세션은 로그인과 무관하게 30분 규칙 유지(로그인했다고 새 세션 X). ⑤ `properties`에 이메일·이름 등 PII 저장 금지(`user_id` UUID만). → 재방문·리텐션을 이후 **user_id 기준(기기 넘어 정확)**으로 재계산 가능.

---

## 8. 데이터 볼륨·비용 추정 (2주 · 유입 10,000 · 저장 6,000 가정)

### 이벤트 볼륨
| 세그먼트 | 인원 | 1인 평균 이벤트 | 합계 |
|---|---|---|---|
| 저장 완료(완주+결과 탐색) | 6,000 | ~55 | 330,000 |
| 결과 도달·미저장 | 2,500 | ~38 | 95,000 |
| 온보딩 중 이탈 | 1,000 | ~14 | 14,000 |
| 랜딩 이탈 | 500 | ~2 | 1,000 |
| **계** | 10,000 | | **≈ 44만 건** (일 ~3.1만) |

> 볼륨 최대 비중: `onboarding_step_viewed`(14/인) + `result_scroll_depth`(~8/인) ≈ 전체의 40%.

### Supabase (events 테이블)
- 행당 ~300–400 B (데이터 + tuple 오버헤드 + 인덱스 3개) → 44만 × 350B ≈ **~130–180 MB / 2주**.
- Free tier DB **500 MB** → 이번 2주 버스트는 **들어감 ($0)**.
- ⚠️ **누적**: 이 속도 지속 시 약 **1.5개월에 500 MB 도달** → 이후 **Pro $25/월**(8GB). egress·compute는 이 볼륨에선 무시 가능.

### Vercel (`/api/events` 함수)
- 이벤트 1건 = 함수 호출 1회 → ~44만 호출/2주. 호출 수·Active CPU(가벼운 insert)·메모리 모두 Hobby/Pro **포함 범위 → 사실상 $0**.
- Vercel Web Analytics는 **페이지뷰만** 집계(커스텀 `trackEvent`는 Vercel로 안 감) → 본 이벤트와 비용 무관.

### GA4
- 무료(월 1천만 이벤트) → **$0**.

### 결론
- **이번 2주 시나리오: 사실상 $0** (전부 무료 한도 내).
- 유일한 실질 비용 트리거 = **Supabase DB 누적**. 지속 트래픽이면 500MB 초과 시 **$25/월**.
- 절감 레버: ① `is_dev` 행 주기 삭제 ② 오래된 raw 이벤트 아카이브(집계만 보존) ③ `result_scroll_depth` 마일스톤 축소로 스크롤 이벤트 감축.

---

## 9. 대시보드 구축 — **나중에** (이벤트 배포·수집 후) · 참조 가이드

> 대시보드(지표·도표·퍼널)는 **이벤트가 배포되어 실데이터가 쌓인 뒤** 구축한다. Looker/GA4 차트는 실데이터로 만들고 검증해야 하므로(과거 학습), 지금은 "무엇을·무엇으로·무엇을 참조해" 만들지만 정리한다.

### 무엇을 만드나 (대시보드 목표 구성)
1. **핵심 퍼널**: Entered → Result Viewed → Intent(저장/공유) → Revisited (세션 단위)
2. **전략 OKR 스코어카드**: R1(종합 80%↑) · R2(영역 탐색·15초↑) · R3(토글·다시하기) · R4(저장/공유 60%↑)
3. **세그먼트 분해**: persona 5종(축1) × 저장/공유 코호트(축2), 교차 가능
4. **행동 흐름(Path)**: 결과 페이지 이벤트 시퀀스(§3-6)

### 데이터 소스
- **Supabase `events`**(주력): 전환율·퍼널·path·세그먼트 → 단일 SQL 직접 쿼리 (옵션 A 단일 테이블)
- **GA4**(보조): 페이지·트래픽 native
- **스코핑**: 퍼널/OKR = `result_viewed` 세션 / 공유 인게이지먼트 = `shared_result_viewed` 세션 (§1 규칙)

### 빌드 시 참조 문서
- **본 문서**(`event-taxonomy-v2.md`) — 지표→이벤트→SQL 패턴·스코핑·OKR (1차 출처)
- `.omniscitus/history/devops/2026-04-24-supabase-migration.md` — **KPI Funnel Rates 단일 SQL + 다중 스코어카드 패턴**, Data Blending 구조적 회피, COUNT DISTINCT
- `.omniscitus/history/devops/2026-04-19-ga4-looker-analytics-setup.md` — Looker UX 함정(차원→조건→값, Duration 자동 AVERAGE, "행 너무 많음"), GA4 커스텀 측정기준 등록
- `docs/prd/analytics/event-schema-options.md` — 스키마 결정(옵션 A)

### 재사용 패턴 (함정 회피)
- **단일 SQL + 단일 row + 다중 스코어카드** → 차트 간 숫자 불일치 0 (자체 DB가 GA4 Data Blending 대비 우월)
- **`COUNT(DISTINCT session_id)`**(세션 지표) / `COUNT(DISTINCT visitor_id)`(재방문)
- **GA4 Data Blending 금지** → Supabase 단일 소스 직접 쿼리
- **`event_seq` 정렬**로 path 재구성, **persona는 `GROUP BY` 한 줄**
