# Wedding Action Board 이벤트 명세 & 지표 매핑

> **목적**: 예산안·체크리스트(Action Board) OKR([[체크리스트+예산안 OKR 지표.md]])을 측정하기 위한 이벤트를 "정확히 언제 발사되는지" 팀 전체가 보고 합의하기 위한 명세. 구현 후 Google Data Studio 지표 구축의 기준 문서.
> **작성 기준**: 2026-06-05 / 코드 검증 완료 (manage 컴포넌트·훅 직접 확인)
> **전송 구조**: 기존과 동일 — `trackEvent()` 하나가 GA4 + Supabase `events` 테이블로 이중 전송. 모든 이벤트에 `visitor_id`·`session_id`·`event_seq` 자동 부착.

---

## 1. 흐름 변경 (Phase 1 — 랜딩·온보딩)

| # | 변경 | 내용 |
|---|---|---|
| 1 | 시작하기 = 항상 질문부터 | 재방문자도 `시작하기` → `/budget-draft` 질문 시작 (기존 `/manage` 리다이렉트 제거). 시작 시 진행 답변만 초기화, 저장된 플랜(MANAGE_SESSION)은 보존 |
| 2 | 자동복원 정리 | `/budget-draft`의 "이전 결과로 자동 점프"(manage_session 경로) 제거 → 질문만 표시. 이전 결과는 `이어보기 → /manage`로 접근 |
| 3 | 유령 Q3 제거 | `onboarding_step_viewed`가 "질문 화면이 실제로 보일 때만" 발사되게 조건 수정 |
| 4 | 이어보기 이벤트 신설 | `continue_clicked` — "이전 준비 내역 이어보기" 링크 클릭 시 |

---

## 2. 이벤트 명세 (Phase 2 — Action Board) — 정확한 트리거

### 2.1 진입·탐색 (페이지 레벨)

| 이벤트 | 속성 | **정확히 언제** |
|---|---|---|
| `manage_entered` | `source`(result/continue/direct), `has_session` | `/manage` 페이지가 열리는 즉시 (도착 1회). `source`=진입 출처(결과CTA/이어보기/직접) — 진입률과 재진입 분리에 필수 |
| `checklist_tab_viewed` | — | 상단 탭바에서 **체크리스트 탭**을 누를 때 |
| `budget_tab_viewed` | — | 상단 탭바에서 **예산 탭**을 누를 때 |
| `manage_exited` | `action_count` | `/manage`를 떠날 때(다른 화면 이동·탭 닫기) |

### 2.2 체크리스트 탭

| 이벤트 | 속성 | **정확히 언제 (어떤 요소)** |
|---|---|---|
| `checklist_item_toggled` | `checked`, `item_id` | **일반 모드의 네모(▢) 체크박스**를 눌러 완료/해제할 때. ⚠️ 편집 모드의 동그란(○) 체크박스는 "삭제 선택"용이라 추적 안 함 |
| `checklist_item_added` | `group` | 그룹 안 `+ 항목 추가` → 이름 입력 → **`추가` 버튼**(확정 시점) |
| `checklist_item_removed` | `kind`(user/preset) | **편집 모드** → 항목 선택 → **`선택 삭제`** 누를 때 |

### 2.3 예산(비용) 탭

| 이벤트 | 속성 | **정확히 언제 (어떤 요소)** |
|---|---|---|
| `budget_edit_started` | `item_id` | 항목 카드의 **`탭해서 입력`(실제 금액)** 을 눌러 입력칸이 열릴 때 |
| `budget_item_edited` | `item_id`, `has_value` | 입력칸에 금액 넣고 **확정**(Enter/blur)할 때. **금액 비우기(삭제)도 발사**(`has_value:false`) |
| `budget_item_added` | `category` | `+ 지출 추가하기` → 모달 입력 → **`추가`**(확정 시점) |
| `budget_item_removed` | `item_id` | 항목 카드 우상단 **휴지통 아이콘** |

### 2.4 핵심 구분 (혼동 방지)
- **체크 완료** = 네모 체크박스(일반 모드). 그룹 펼치기(드롭다운)·편집 동그라미와 다름.
- **비용**은 3동작 분리: 입력칸 *열기*(`budget_edit_started`) / 금액 *확정*(`budget_item_edited`) / *새 항목 추가*(`budget_item_added`).

---

## 3. OKR ↔ 이벤트 ↔ 지표 산출 (모두 날짜별 집계)

| OKR 지표 | 산출식 (이벤트 기반) |
|---|---|
| 액션보드 진입률 | `manage_entered`[source=result] ÷ `result_viewed` (같은 세션, **결과→액션보드 전환만**) |
| 첫 행동 전환율 | (`checklist_item_toggled`[checked=true] 또는 `budget_item_edited`[has_value=true]) 1회+ 세션수 ÷ `manage_entered`[source=result] 세션수 |
| 체크리스트 항목별 완료율 | `checklist_item_toggled`[checked=true] DISTINCT visitor ÷ 진입 visitor (item_id별) |
| 체크 → 비용 전환율 | 체크 완료 visitor 중 이후 `budget_item_edited` 발생 비율 |
| 업데이트(조작) 횟수 분포 | 세션별 모든 액션 이벤트 합산 → 0 / 1–2 / 3+ 버킷 |
| 비용 입력 중 이탈(혼란) | `budget_edit_started` 있고 `budget_item_edited`(has_value) 없이 `manage_exited` |
| 이탈률(깊이별) | `manage_exited`를 `action_count` 버킷(0/1-2/3+)으로 |
| 루프 | 새 세션(visitor의 첫 세션 이후)에 `checklist_item_toggled`[checked] **또는** `budget_item_edited/added` 1개+ (둘 중 **하나만** 해도 인정). 루프 0회=그런 세션 0개 |
| 재진입 후 행동 재개율 | 재방문 세션 중 액션 1회+ 세션 ÷ 재방문 세션 (is_returning + 액션 이벤트) |
| Retention d7/d30 | visitor_id 기준 재방문, 액션 깊이별 비교 |

---

## 4. Google Data Studio 규칙 (⚠️ 필수)

1. **단일 데이터 소스**: Data Studio에는 **`events` 테이블 하나만** 데이터 소스로 연결하고, 모든 Action Board 차트를 그 하나에서 만든다. 지표마다 소스를 쪼개지 않는다.
2. **무조건 날짜별 집계**: 모든 쿼리/지표는 **`created_at`(KST) 날짜 단위로 버킷**해야 한다. 전체 평균/누적이 아니라 날짜별로 나와야 날짜 필터가 동작하고, 쿼리를 다시 안 짜도 된다. (기존 `queries.ts`의 `(created_at AT TIME ZONE 'Asia/Seoul')::date` 패턴 준수)

---

## 5. 지표 정의 확정 (측정 일관성용)

**추적 여부:** 그룹 펼치기/접기·예산 카테고리 필터·드래그/전체복원/공유 = ❌ 안 함 / 금액 비우기(clear)도 "수정"으로 간주 = ✅ (`budget_item_edited` + `has_value:false`)

**측정 정의 (A~E):**
- **A. "업데이트(상호작용) 1회"** = 확정 액션 6종(체크토글·체크추가·체크삭제·비용확정·비용추가·비용삭제). `budget_edit_started`는 제외(혼란-이탈 전용).
- **B. "비용 기록/수정"** = `budget_item_edited`(has_value=true) ∪ `budget_item_added`.
- **C. 이탈률 버킷** = 0회 / 1–2회 / 3회+.
- **D. 루프** = 새 세션(visitor의 첫 세션 이후)에서 **체크 완료 또는 비용 입력/수정 중 1개 이상**(둘 중 하나만 해도 인정). 루프 0회 = 그런 세션 0개. ('새 세션'=visitor의 첫 session_id 이후의 session_id)
- **E. 진입률** = `manage_entered`[source=result] ÷ `result_viewed` (같은 세션, 결과→액션보드 전환만). **이어보기(`source=continue`) 직행은 진입률이 아니라 재진입/재방문/루프 통로**(체크리스트 직행 버튼이 없어 추가된 경로).

---

## 6. 구현 위치 (개발 참고)
- 액션 이벤트(체크 토글·추가·삭제, 비용 확정·추가·삭제)는 **공통 훅**에 심음 → `useChecklistState`(`toggle`/`addUserItem`/`removeUserItem`/`hideItem`), `useBudgetTrackingState`(`setActualAmount`/`addCustomItem`/`removeItem`). 어떤 버튼이든 일관 발사.
- 시점성 이벤트는 **컴포넌트**: `budget_edit_started`(BudgetItemCard `startEdit`), `manage_entered`/`*_tab_viewed`/`manage_exited`(manage/page.tsx).

## 7. 리스크 & 검증
- `budget_edit_started`만 편집모드 시작/확정 구분 필요(BudgetItemCard) — 나머지는 훅에 추가만이라 안전.
- 검증: vitest + 빌드 + 라이브 재확인(실제 클릭 → Supabase `events` 조회).
- 동화님 `/manage` 데이터 로직은 안 건드림(이벤트 추가만). 새 브랜치 작업 → Draft PR(머지는 직접).
