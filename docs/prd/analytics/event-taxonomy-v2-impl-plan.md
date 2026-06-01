# 이벤트 Taxonomy v2 구현 계획 (Implementation Plan)

> **For agentic workers:** 태스크 단위 실행. 각 태스크 = `구현 → 검증(build/lint/스크립트/런타임) → 커밋`. 체크박스(`- [ ]`)로 추적.

**Goal:** v2 설계(`event-taxonomy-v2.md`) 이벤트·속성 계측 + **만족도 설문을 '저장&공유' 클릭 팝업(예/아니요)으로 전환**.

> **⚠️ 실행 순서(2026-06-01 갱신)**: 흐름 간섭 방지를 위해 **① 만족도 설문 UI 먼저**(Phase 3) → ② 결과 인터랙션 계측(Phase 2) → ④ 온보딩. (Phase 1 session은 완료·미커밋.)
> **추가 반영분(설계 §3-7 등)**: R2-a `result_section_viewed`(투자/세이브 섹션 노출 — `tab-comprehensive`에 IntersectionObserver) · `result_scroll_depth` 마일스톤 **80 추가**(R1) · `result_exited`에 **탭별 dwell**(`dwell_comprehensive_sec`·`dwell_itemized_sec`·`dwell_care_sec`).

**Architecture:** ① 전 이벤트에 `session_id`(30분 회전)+`event_seq` → ② 결과 이벤트에 `persona`(=`result.vars.persona`, **prop 불필요**) 부착 + 인터랙션 계측 → ③ 만족도 설문을 종합탭 하단 카드 → '저장&공유' 게이트 팝업으로 이동 → ④ 온보딩 노출 + `result_viewed` 총액.

**Tech Stack:** Next.js 16 · React 19 · TS · Prisma/Supabase. **테스트 프레임워크 없음** → 검증 = `bun run build`(tsc) + `bun run lint` + 1회성 스크립트(순수 로직) + 런타임 스모크.

**persona 출처:** 결과 컴포넌트(`result-view.tsx`, `tab-itemized.tsx`)는 어디서나 **`result.vars.persona`** 사용(별도 prop 전달 X). `page.tsx` 이벤트는 page의 `persona` state.

**스키마:** `Event.sessionId` 기존(nullable) → **마이그레이션 불필요.** 나머지 속성은 `properties` JSON.

---

## File Structure

| 파일 | 변경 | 역할 |
|---|---|---|
| `src/lib/session.ts` | **생성** | session id(30분) + event_seq (순수 코어+래퍼) |
| `src/lib/gtag.ts` | 수정 | 전 이벤트에 session_id·event_seq 부착 |
| `src/app/api/events/route.ts` | 수정 | session_id 수신·저장 |
| `src/components/result/result-view.tsx` | 수정 | 결과 계측 + 설문 게이트 배선 |
| `src/components/result/tabs/tab-itemized.tsx` | 수정 | `itemized_category_expanded` |
| `src/components/result/satisfaction-modal.tsx` | **생성** | 만족도 팝업(예/아니요) |
| `src/components/result/tabs/tab-comprehensive.tsx` | 수정 | FeedbackCard 제거 |
| `src/components/result/feedback-card.tsx` | **삭제** | 이모지 카드 폐기 |
| `src/app/budget-draft/page.tsx` | 수정 | step_viewed · total_budget · reset persona |

---

## Phase 1 — session_id + event_seq 인프라

### Task 1.1: `src/lib/session.ts` 생성

- [ ] **Step 1: 구현**

```ts
const SESSION_KEY = 'budgetroad_session';
const TIMEOUT_MS = 30 * 60 * 1000;

export type SessionRecord = { id: string; ts: number; seq: number };

// 순수 코어 — I/O 없음(검증 용이).
export function rotateSession(
  stored: SessionRecord | null,
  now: number,
  newId: string,
): SessionRecord {
  if (!stored || now - stored.ts > TIMEOUT_MS) return { id: newId, ts: now, seq: 0 };
  return { id: stored.id, ts: now, seq: stored.seq + 1 };
}

// 브라우저 래퍼.
export function nextSessionContext(): { session_id: string; event_seq: number } {
  if (typeof window === 'undefined') return { session_id: '', event_seq: 0 };
  let stored: SessionRecord | null = null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) stored = JSON.parse(raw) as SessionRecord;
  } catch { /* ignore */ }
  const next = rotateSession(stored, Date.now(), crypto.randomUUID());
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  return { session_id: next.id, event_seq: next.seq };
}
```

- [ ] **Step 2: 순수 코어 검증 스크립트** (`.claude/temp/scripts/verify-session.mjs`)

```js
const TIMEOUT_MS = 30 * 60 * 1000;
function rotateSession(stored, now, newId) {
  if (!stored || now - stored.ts > TIMEOUT_MS) return { id: newId, ts: now, seq: 0 };
  return { id: stored.id, ts: now, seq: stored.seq + 1 };
}
const t0 = 1_000_000;
const a = rotateSession(null, t0, 'A');
const b = rotateSession(a, t0 + 1000, 'B');
const c = rotateSession(b, t0 + TIMEOUT_MS + 1, 'C');
const d = rotateSession(b, t0 + TIMEOUT_MS, 'D');
console.assert(a.id === 'A' && a.seq === 0, 'first seq0');
console.assert(b.id === 'A' && b.seq === 1, 'same session seq+1');
console.assert(c.id === 'C' && c.seq === 0, 'rotate after 30min');
console.assert(d.id === 'A' && d.seq === 2, 'boundary = same');
console.log('OK: rotateSession 경계 검증 통과');
```

- [ ] **Step 3: 실행** — `node .claude/temp/scripts/verify-session.mjs` → `OK ...` 출력
- [ ] **Step 4: 스크립트 삭제 + 커밋**

```bash
rm .claude/temp/scripts/verify-session.mjs
git add src/lib/session.ts && git commit -m "feat(analytics): session id(30분 회전)+event_seq 유틸"
```

### Task 1.2: `gtag.ts` 부착

- [ ] **Step 1:** `import { nextSessionContext } from './session';` 추가. `const visitorId = getVisitorId();` 아래 `const { session_id, event_seq } = nextSessionContext();`. gtag 호출에 `session_id, event_seq` 추가. fetch body를 `{ visitor_id: visitorId, session_id, event_name: eventName, properties: { ...params, event_seq } }`로.
- [ ] **Step 2:** `bun run build && bun run lint`
- [ ] **Step 3:** `git commit -m "feat(analytics): 전 이벤트에 session_id·event_seq 부착"`

### Task 1.3: API 라우트

- [ ] **Step 1:** `route.ts`에서 `session_id` 구조분해 + `prisma.event.create`의 `data`에 `sessionId: session_id ?? null` 추가.
- [ ] **Step 2:** `bun run build` + 런타임: `/api/events` POST에 `session_id`·`properties.event_seq` 확인. (MCP: Supabase `events` 최근 행 `session_id` not null)
- [ ] **Step 3:** `git commit -m "feat(analytics): /api/events session_id 저장"`

---

## Phase 2 — 결과 인터랙션 계측 (persona = `result.vars.persona`)

> result-view.tsx에 import 추가: `import { trackEvent } from '@/lib/gtag';`, `import { TOGGLES_META } from '@/lib/budget-engine';`, `import { useRef } from 'react'`(기존 import에 useRef 합치기). 모든 발화의 persona = `result.vars.persona`.

### Task 2.1: `result_tab_viewed`

- [ ] **Step 1:** `const [activeTab, setActiveTab]` 아래에:
```ts
  const viewedTabs = useRef<Set<TabId>>(new Set<TabId>());
  function selectTab(tab: TabId) {
    const isFirst = !viewedTabs.current.has(tab);
    viewedTabs.current.add(tab);
    setActiveTab(tab);
    trackEvent('result_tab_viewed', { tab, is_first_view: isFirst ? 1 : 0, persona: result.vars.persona });
  }
```
초기 탭 발화 effect:
```ts
  useEffect(() => {
    viewedTabs.current.add('comprehensive');
    trackEvent('result_tab_viewed', { tab: 'comprehensive', is_first_view: 1, persona: result.vars.persona });
  }, []);
```
탭 버튼 `onClick={() => setActiveTab(tab)}` → `onClick={() => selectTab(tab)}`.
- [ ] **Step 2:** build+lint, 런타임(진입 1회 + 전환/재방문 is_first_view 확인)
- [ ] **Step 3:** `git commit -m "feat(analytics): result_tab_viewed"`

### Task 2.2: `care_option_toggled` + `care_bulk_toggled`

- [ ] **Step 1:** `setToggle`에 발화 추가:
```ts
  function setToggle(id: ToggleId, on: boolean) {
    setToggles((prev) => ({ ...prev, [id]: on }));
    const meta = TOGGLES_META.find((t) => t.id === id);
    trackEvent('care_option_toggled', { option_id: id, category: meta?.group ?? '', on: on ? 1 : 0, persona: result.vars.persona });
  }
```
`setAllToggles`에 추가: `trackEvent('care_bulk_toggled', { action: on ? 'all_on' : 'all_off', persona: result.vars.persona });`
- [ ] **Step 2:** build+lint, 런타임(토글/전체 버튼; print-root no-op 미발화 확인)
- [ ] **Step 3:** `git commit -m "feat(analytics): care_option_toggled + care_bulk_toggled"`

### Task 2.3: `itemized_category_expanded`

- [ ] **Step 1:** `tab-itemized.tsx`에 `import { trackEvent } from '@/lib/gtag';`. `toggleExpanded`를 willExpand 계산 + 발화로 교체:
```ts
  function toggleExpanded(cat: ResultCategory) {
    const willExpand = !expanded.has(cat);
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
    trackEvent('itemized_category_expanded', { category: cat, expanded: willExpand ? 1 : 0, persona: result.vars.persona });
  }
```
(persona는 `result.vars.persona` — TabItemized가 받는 `result`에 있음. prop 불필요)
- [ ] **Step 2:** build+lint, 런타임(카테고리 펼침/접기)
- [ ] **Step 3:** `git commit -m "feat(analytics): itemized_category_expanded"`

### Task 2.4: `result_scroll_depth`

- [ ] **Step 1:** result-view.tsx에:
```ts
  const scrollFired = useRef<Record<TabId, Set<number>>>({ comprehensive: new Set(), itemized: new Set(), care: new Set() });
  useEffect(() => {
    const MILESTONES = [25, 50, 75, 100];
    function onScroll() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable <= 0 ? 100 : Math.round((window.scrollY / scrollable) * 100);
      const fired = scrollFired.current[activeTab];
      for (const m of MILESTONES) if (pct >= m && !fired.has(m)) { fired.add(m); trackEvent('result_scroll_depth', { tab: activeTab, depth_pct: m, persona: result.vars.persona }); }
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [activeTab]);
```
- [ ] **Step 2:** build+lint, 런타임(탭별 25/50/75/100 1회씩, 재스크롤 중복 X)
- [ ] **Step 3:** `git commit -m "feat(analytics): result_scroll_depth"`

### Task 2.5: `result_exited`

- [ ] **Step 1:** result-view.tsx에:
```ts
  const enteredAt = useRef<number>(0);
  const activeTabRef = useRef<TabId>('comprehensive');
  const exitFired = useRef(false);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  useEffect(() => {
    enteredAt.current = Date.now();
    function fireExit() {
      if (exitFired.current) return;
      exitFired.current = true;
      trackEvent('result_exited', { time_on_result_sec: Math.round((Date.now() - enteredAt.current) / 1000), last_tab: activeTabRef.current, persona: result.vars.persona });
    }
    function onVis() { if (document.visibilityState === 'hidden') fireExit(); }
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pagehide', fireExit);
    return () => { document.removeEventListener('visibilitychange', onVis); window.removeEventListener('pagehide', fireExit); };
  }, []);
```
- [ ] **Step 2:** build+lint, 런타임(탭 전환 후 탭 숨김 → result_exited 1회)
- [ ] **Step 3:** `git commit -m "feat(analytics): result_exited"`

### Task 2.6: `result_reset_clicked` persona (page.tsx)

- [ ] **Step 1:** `trackEvent('result_reset_clicked');` → `trackEvent('result_reset_clicked', persona ? { persona } : undefined);`
- [ ] **Step 2:** build+lint
- [ ] **Step 3:** `git commit -m "feat(analytics): result_reset_clicked persona"`

---

## Phase 3 — 만족도 설문 팝업 전환 (기능 + `satisfaction_answered`)

### Task 3.1: `satisfaction-modal.tsx` 생성

- [ ] **Step 1: 구현** — `src/components/result/satisfaction-modal.tsx`

```tsx
'use client';

import { trackEvent } from '@/lib/gtag';

type Props = {
  persona: string;
  totalBudget: number;
  onDone: () => void; // 답/닫기 모두 → 저장 모달로 진행 (세션 1회 처리는 부모)
};

export function SatisfactionModal({ persona, totalBudget, onDone }: Props) {
  function answer(matched: 'yes' | 'no') {
    trackEvent('satisfaction_answered', { matched, persona, total_budget: totalBudget });
    onDone();
  }
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onDone}>
      <div className="w-full rounded-t-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <p className="pb-1 text-lg font-semibold leading-snug text-[#171717]">
            이 결과가 내가 원하는 결혼 스타일과<br />잘 맞는다고 느끼셨나요?
          </p>
          <button
            type="button"
            onClick={onDone}
            aria-label="닫기"
            className="shrink-0 rounded-full px-2 py-1 text-xl leading-none text-[#A1A1A1]"
          >
            ✕
          </button>
        </div>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => answer('no')}
            className="flex-1 rounded-xl border border-[#E5E5E5] bg-white py-3 text-sm font-semibold text-[#525252] active:scale-[0.99]"
          >
            아니요
          </button>
          <button
            type="button"
            onClick={() => answer('yes')}
            className="flex-1 rounded-xl bg-[#373737] py-3 text-sm font-bold text-white active:scale-[0.99]"
          >
            예
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2:** `bun run build && bun run lint`
- [ ] **Step 3:** `git add src/components/result/satisfaction-modal.tsx && git commit -m "feat(result): 만족도 설문 팝업(예/아니요) 컴포넌트"`

### Task 3.2: 기존 FeedbackCard 제거 + 파일 삭제

- [ ] **Step 1:** `tab-comprehensive.tsx`에서 import(line 5 `import { FeedbackCard } ...`) 삭제 + 렌더 블록(`{!forExport && (<FeedbackCard context={{...}} />)}`) 삭제.
- [ ] **Step 2:** `git rm src/components/result/feedback-card.tsx`
- [ ] **Step 3:** `bun run build && bun run lint` (FeedbackCard 참조 0 확인)
- [ ] **Step 4:** `git add -A && git commit -m "refactor(result): 종합탭 만족도 카드 제거(팝업으로 이동)"`

### Task 3.3: ResultView 배선 (저장&공유 → 설문 게이트 → 저장 모달)

- [ ] **Step 1:** result-view.tsx import에 `import { SatisfactionModal } from './satisfaction-modal';`. 상태/세션-1회 + 핸들러:
```ts
  const SURVEY_KEY = 'budgetroad_satisfaction_done';
  const [surveyOpen, setSurveyOpen] = useState(false);
  function surveyDone(): boolean {
    try { return sessionStorage.getItem(SURVEY_KEY) === '1'; } catch { return false; }
  }
  function markSurveyDone() { try { sessionStorage.setItem(SURVEY_KEY, '1'); } catch {} }
  function handleShareClick() {
    trackEvent('share_panel_opened', { persona: result.vars.persona });
    if (surveyDone()) setShareOpen(true);
    else setSurveyOpen(true);
  }
  function finishSurvey() { // 답/닫기 공통 → 저장 모달로
    markSurveyDone();
    setSurveyOpen(false);
    setShareOpen(true);
  }
```
`handleShareAction` 첫 줄에: `trackEvent('share_action_clicked', { method: action, persona: result.vars.persona });`
- [ ] **Step 2:** ResultFooter 배선 교체 + 설문 모달 렌더 추가:
```tsx
      <ResultFooter result={result} onShareClick={handleShareClick} />
      {surveyOpen && (
        <SatisfactionModal
          persona={result.vars.persona}
          totalBudget={result.budget.total}
          onDone={finishSurvey}
        />
      )}
```
- [ ] **Step 3:** `bun run build && bun run lint` + 런타임:
  - 첫 '저장&공유' → 설문 팝업(예/아니요/닫기). 예/아니요 → `satisfaction_answered{matched}` + 저장 모달. 닫기 → 발화 없이 저장 모달.
  - 두 번째 '저장&공유' → 설문 없이 바로 저장 모달.
  - 모달 버튼 클릭 → `share_action_clicked{method}`.
- [ ] **Step 4:** `git commit -m "feat(result): 저장&공유 시 만족도 설문 게이트 + share 이벤트 계측"`

---

## Phase 4 — 온보딩 + 총액

### Task 4.1: `onboarding_step_viewed` (page.tsx)

- [ ] **Step 1:** 디코드 effect **뒤에** (fromSharedRef 세팅 후) effect 추가:
```ts
  useEffect(() => {
    if (fromSharedRef.current) return;
    if (step < TOTAL_STEPS) trackEvent('onboarding_step_viewed', { step: step + 1, question_id: STEPS[step].id });
  }, [step]);
```
- [ ] **Step 2:** build+lint, 런타임(질문 노출마다 발화 / 공유 진입 시 X)
- [ ] **Step 3:** `git commit -m "feat(analytics): onboarding_step_viewed"`

### Task 4.2: `result_viewed` total_budget (page.tsx)

- [ ] **Step 1:** `import { diagnose } from '@/lib/budget-engine';` 추가. `buildResultPayload` payload에 `total_budget: diagnose(answers).budget.total` 추가.
- [ ] **Step 2:** build+lint, 런타임(result_viewed에 total_budget)
- [ ] **Step 3:** `git commit -m "feat(analytics): result_viewed total_budget"`

---

## 최종 검증

- [ ] `bun run build && bun run lint` 통과
- [ ] dev 전체 플로우 완주 → Supabase `events`(`is_dev=true`)에 신규 이벤트가 `session_id`·`event_seq`·`persona`와 함께 적재. 만족도 흐름(저장&공유→팝업→저장모달) 확인.
- [ ] 한 session_id 내 `event_seq` 단조 증가 확인.

## Self-Review (스펙 대조)

- 세션/event_seq(§1) → P1 ✅ / persona(§2) → result.vars.persona, 결과 이벤트 ✅ / 코호트(§2-1) → share_action_clicked 유무 SQL(코드 무관) ✅
- 카탈로그(§4): step_viewed(4.1)·tab_viewed(2.1)·care(2.2)·itemized(2.3)·scroll(2.4)·exit(2.5)·share_panel_opened+share_action_clicked(3.3)·satisfaction_answered(3.1/3.3)·reset(2.6)·result_viewed total_budget(4.2) ✅
- 만족도 변경(§4 노트): 카드 제거(3.2) + 팝업(3.1) + 게이트 배선(3.3) ✅
- 범위 밖: SQL/Looker 구성(코드 계측까지만).
