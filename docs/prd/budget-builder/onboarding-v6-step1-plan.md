# 온보딩 v6.0 — STEP 1(질문지 교체) 구현 계획

> 참조 spec: `docs/questionnaire design.md` (v6.0)
> 참조 알고리즘: `docs/Result Page Calculation Algorithm.md` (계산 v2)
> 참조 개발 핸드오프: `docs/Development handoff.md`
> 참조 디자인: Figma `tOL1XH8gOM6YmTyNiDvdjB` node `4:2` + 사용자 제공 CSS dump
> 작성일: 2026-05-27 · 작성자: claude (powel 협의)

## 1. 목표 (Scope)

`/budget-draft` 시뮬레이션 화면을 v6.0 온보딩 13문항 + 진입 라우팅 1화면으로 교체.
**이 계획은 STEP 1(질문/선택지)만 다룬다.** STEP 2(결과 페이지 — 3탭) / STEP 3(추가금 케어 토글)는 별도 후속 계획.

### 포함
- 진입 라우팅 1화면 + 온보딩 13문항(메인 6 + 태그 3 + Modifier 4) UI/흐름
- **2축 사분면 분류** 함수 (STAGE 1·2 알고리즘 그대로 구현) → 5유형 분류
- 응답 데이터 저장 (옵션 ID `'A'|'B'|'C'|'D'` 그대로)
- 임시 결과 화면 ("당신은 OO형입니다" + 한 줄 설명 + "다음 단계 준비 중" + 다시하기)
- Figma CSS 토큰 적용 (옵션 카드 72/76px, Q번호 prefix, "STEP 1 / 3" macro 라벨)
- 옵션 카드 개수 = 각 질문이 요구하는 만큼만

### 제외 (후속 계획에서 처리)
- 결과 페이지 3탭 (종합설계서 / 항목별내역 / 추가금케어) — STEP 2/3
- STAGE 3~8 알고리즘 (변수세팅·식장추천·예산계산·정합성진단·동적조언·출력) — STEP 2
- 추가금 토글 25개 + 실시간 재계산 — STEP 3
- 백엔드 API (GET /questions, POST /diagnose) 도입 — STEP 2 진입 시 검토
- 옛 결과 화면의 분해/공유 UI 복원 — STEP 2

### 확정 사항 (사용자 결정)
- **Q번호 prefix**: spec ID 그대로 노출 — `Q1.`, `Q2.`, `Q3.`, `Q4.`, `Q7.`, `Q8.`, `T2.`, `T5.`, `T7.`, `M1.`, `M2.`, `M3.`, `M5.` (계산 로직/JSON 응답/문서와 식별자 일관성 유지 목적)
- **M2 매핑** (STEP 2에서 사용. STEP 1에선 옵션 ID만 저장하되 변환 함수 시그니처는 미리 명시):
  - A. 50명 미만 → `guests = 30`
  - B. 50명 ~ 150명 → `guests = 100`
  - C. 150명 ~ 300명 → `guests = 225`
  - D. 300명 이상 → `guests = 350`

### 빈칸 (현재 spec에서도 미정 — placeholder)
- '아직 모르겠다' 진입 옵션 → 탐색미결정 분기 흐름: spec에 "탐색 미결정형 분기"만 명시되어 있고 분기 형태 미정 → **이번 단계에선 동일 흐름 진행, 분류 결과만 '탐색미결정'으로 산출**

## 2. 아키텍처 결정

### 결정 1: progress bar는 macro+micro 2단 라벨
- 좌측 라벨: `단계 STEP 1 / 3` (이번 작업 동안 고정. STEP 2/3은 후속에서 라벨 전환)
- 우측 라벨: `X% 완료` (`Math.round((step+1)/14*100)`)
- 진행률 바: **14개 동적 세그먼트** (진입 1 + 13문항) — STEP 1 내부 micro progress
- "3단계 STEP" 표기는 좌측 라벨의 `/ 3` 부분으로 사용자에게 노출됨
- Figma의 5세그먼트는 Q4 mock 한정 demo일 뿐, spec(13문항+진입)을 따른다

### 결정 2: 2축 사분면 분류 알고리즘 (계산 v2 STAGE 1·2 그대로)

```ts
type AxisScore = { a: number; b: number };
type PersonaType = '전통격식' | '표준실용' | '경험연출' | '본질미니멀' | '탐색미결정';

function scoreAxis(answers): AxisScore {
  let a = 0, b = 0;
  for (const qid of ['Q1','Q2','Q3','Q4','Q7','Q8']) {
    const opt = OPTIONS[qid][answers[qid]];
    a += opt.scoreA ?? 0;
    b += opt.scoreB ?? 0;
  }
  return { a, b };
}

function classifyPersona({a, b}: AxisScore): PersonaType {
  if (Math.abs(a) <= 1 && Math.abs(b) <= 1) return '탐색미결정';
  if (a >= 0 && b >= 0) return '전통격식';
  if (a < 0 && b >= 0) return '표준실용';
  if (a >= 0 && b < 0) return '경험연출';
  return '본질미니멀';
}
```

### 결정 3: 옵션 가중치 (Result Page Calculation Algorithm STAGE 1 표 그대로)

| 문항 | A (scoreA·scoreB) | B | C | D |
|---|---|---|---|---|
| Q1 | 0, +2 | 0, −2 | +1, +1 | −1, −2 |
| Q2 | 0, −2 | 0, +2 | — | — |
| Q3 | 0, +2 | 0, −2 | — | — |
| Q4 | −1, −1 | +1, +1 | −2, 0 | −2, 0 |
| Q7 | +1, +1 | +1, −1 | +2, +1 | −2, 0 |
| Q8 | +2, +1 | −1, 0 | +1, −1 | −2, 0 |

태그(T2/T5/T7), Modifier(M1/M2/M3/M5)는 분류에 영향 없음. STEP 2/3에서 보정/변수세팅용.

### 결정 4: `budget-data.ts`는 삭제하지 않음
- STEP 2(지역계수·예식장 단가)와 STEP 3에서 부분 재활용 예정
- 이번 PR에서는 `page.tsx`의 import만 끊는다
- v6.0 안정화 후 cleanup PR 별도

### 결정 5: 응답 저장 형식
- 모든 응답은 옵션 ID 그대로(`'A'|'B'|'C'|'D'`) 저장
- 진입 라우팅은 `'before'|'comparing'|'partial'|'mostly'|'unsure'`
- 숫자 변환(M1→예산값, M2→하객수, M5→지역키)은 STEP 2에서 별도 변환 함수
- sessionStorage 키: `budgetroad_onboarding_v6` → `{ step, answers, persona, axisScore }`

### 결정 6: GA4 이벤트
- 기존 이벤트 키 유지(`budget_draft_entered`, `input_started`, `result_viewed`)하되 payload는 새 필드로 갱신
- 신규 이벤트 `onboarding_question_answered { question_id, choice_id }` 추가
- `result_viewed` payload에 `persona`, `axisA`, `axisB`, `entry_stage`, 13개 응답, `time_in_steps_sec`

### 결정 7: 백엔드 도입 시점
- handoff에 GET /questions·POST /diagnose API와 PostgreSQL 스키마가 명세되어 있지만
- **STEP 1은 클라이언트만으로 충분** (질문지·분류 모두 정적/클라이언트)
- 백엔드 도입은 STEP 2 진입 시점에 결정 (calcContext + DB 시드 필요한 시점)

## 3. 파일 구조

### 신규
| 경로 | 책임 |
|---|---|
| `src/lib/onboarding-v6.ts` | 타입, 14스텝 질문/옵션 데이터, scoreAxis · classifyPersona |
| `src/components/onboarding/progress-bar.tsx` | macro STEP 라벨 + 동적 세그먼트 진행률 바 |
| `src/components/onboarding/question-card.tsx` | 선택/미선택/disabled 옵션 카드 |

### 수정
| 경로 | 변경 |
|---|---|
| `src/app/budget-draft/page.tsx` | 14스텝 흐름 + 임시 결과로 재작성. 기존 step 컴포넌트 전부 제거 |
| `src/lib/gtag.ts` | 신규 이벤트 키 추가 (`onboarding_question_answered`) |

### 보존 (이번 PR에서 건드리지 않음)
- `src/lib/budget-data.ts` — STEP 2/3에서 부분 재활용 예정
- `src/components/ui/*` — shadcn 컴포넌트 그대로
- `src/lib/share.ts` — STEP 2에서 결과 공유 복원 시 사용

## 4. 시각 사양 (Figma CSS 기반)

| 요소 | 사양 |
|---|---|
| 배경 | `#F9FAFB` |
| Header | 87px height, border-bottom 1px `#E5E7EB`, 로고 132×41px |
| 진행률 라벨 좌측 | `단계 STEP 1 / 3` 14px Pretendard Regular `#6A7282` |
| 진행률 라벨 우측 | `X% 완료` 14px Regular `#6A7282` text-right |
| 진행률 바 | 10px height, gap ≈ 7px, 활성 `#AAC7E1` / 비활성 `#E5E7EB`, border-radius full, **14 segment** |
| Q 번호 prefix | 14px Pretendard Regular `#6A7282` (예: "Q4.") |
| 질문 타이틀 | 30px Pretendard Bold `#373737`, line-height 36px |
| 질문 부제 | 16px Pretendard Regular `#6A7282`, line-height 24px (있을 때만) |
| 옵션 카드 (미선택) | 72px height, `bg-white border-2 border-[#E5E7EB] rounded-[14px]`, padding 20px, text 18px Medium `#364153` |
| 옵션 카드 (선택) | 76px height, `bg-[rgba(170,199,225,0.3)] border-2 border-[#AAC7E1] rounded-[14px]`, padding 20px, text 18px Medium `#101828` + 우측 32×32 원형 체크 (bg `#AAC7E1`, 흰 체크 SVG) |
| 옵션 카드 gap | 12px |
| 컨테이너 너비 | 데스크탑 max-w-[576px] 정중앙, 모바일 양옆 패딩 px-6 |
| Bottom nav | "이전"/"다음" 18px Bold `#373737` + 28×28 화살표 SVG |

## 5. 작업 단위 (Tasks)

각 Task는 commit 1개. PR 분할은 사용자 선택대로 옵션 B (PR-1: Task 1~3, PR-2: Task 4~12).

---

### Task 1: 데이터 모델 + 분류 함수

**파일**: `src/lib/onboarding-v6.ts` (신규)

- 타입 정의
  ```ts
  type PersonaType = '전통격식' | '표준실용' | '경험연출' | '본질미니멀' | '탐색미결정';
  type EntryStage = 'before' | 'comparing' | 'partial' | 'mostly' | 'unsure';
  type QuestionId = 'Q1'|'Q2'|'Q3'|'Q4'|'Q7'|'Q8'|'T2'|'T5'|'T7'|'M1'|'M2'|'M3'|'M5';
  type ChoiceId = 'A'|'B'|'C'|'D';
  type AxisScore = { a: number; b: number };

  type OnboardingAnswers = {
    entryStage: EntryStage | null;
  } & Partial<Record<QuestionId, ChoiceId>>;

  type Option = { id: ChoiceId; label: string; scoreA?: number; scoreB?: number };
  type EntryOption = { id: EntryStage; label: string };
  type QuestionMeta =
    | { id: 'entry'; type: 'entry'; title: string; options: EntryOption[] }
    | { id: QuestionId; type: 'main'|'tag'|'modifier'; title: string; subtitle?: string; options: Option[] };
  ```

- 14스텝 데이터 상수 `STEPS: QuestionMeta[]`
  - `entry`: 5개 옵션 (시작 전 / 비교 중 / 일부 계약 / 대부분 계약 / 아직 모르겠다)
  - Q1: 4개 (가중치 §2 결정 3 표 그대로)
  - Q2: 2개 (가중치)
  - Q3: 2개 (가중치)
  - Q4: 4개 (가중치)
  - Q7: 4개 (가중치)
  - Q8: 4개 (가중치)
  - T2: 3개 (점수 없음)
  - T5: 3개 (점수 없음)
  - T7: 4개 (점수 없음)
  - M1: 4개 (점수 없음) + subtitle "양가 지원을 포함해 예상되는 총액 기준으로 골라주세요."
  - M2: 4개 (점수 없음)
  - M3: 3개 (점수 없음)
  - M5: 4개 (점수 없음)
  - 모든 옵션 라벨은 `docs/questionnaire design.md` 그대로 복붙

- `scoreAxis(answers): AxisScore` 함수 — §2 결정 2 코드 그대로
- `classifyPersona(score): PersonaType` 함수 — §2 결정 2 코드 그대로
- `PERSONA_DESCRIPTIONS: Record<PersonaType, string>` 상수
  - 전통격식: "양가가 함께 신경 쓰는 격식 있는 결혼식을 지향합니다."
  - 표준실용: "하객 만족과 합리적 예산의 균형을 추구합니다."
  - 경험연출: "사진·영상·분위기로 오래 남는 결혼식을 원합니다."
  - 본질미니멀: "필수만 갖춘 간결한 결혼식을 선호합니다."
  - 탐색미결정: "아직 우선순위가 정해지지 않았어요. 차근차근 알아봐요."
- `EMPTY_ANSWERS: OnboardingAnswers` 상수 (모든 필드 null)

**커밋**: `feat: add onboarding v6 data model and axis-quadrant classifier`

---

### Task 2: ProgressBar 컴포넌트

**파일**: `src/components/onboarding/progress-bar.tsx` (신규)

- props: `currentStep: number` (0-based), `totalSteps: number`, `macroStep?: number` (default 1), `macroTotal?: number` (default 3)
- 마크업: §4 시각 사양 표 따름
- 데스크탑 max-w-[576px] 정중앙, 모바일은 부모 컨테이너에 따름
- `X% 완료` = `Math.round((currentStep+1)/totalSteps*100)`
- 좌측 라벨: `단계 STEP {macroStep} / {macroTotal}`

**커밋**: `feat: extract progress bar with macro+micro labels`

---

### Task 3: QuestionCard 컴포넌트

**파일**: `src/components/onboarding/question-card.tsx` (신규)

- props: `selected: boolean, label: string, desc?: string, disabled?: boolean, onClick: () => void`
- 마크업: §4 시각 사양 표 따름 (선택 시 76px, 미선택 72px)
- `desc` 있을 때만 라벨 아래에 14px subtitle 추가
- `disabled` 시 회색톤 (현재 코드의 disabled OptionCard 디자인 유지)
- 우측 체크 원형: 선택 시 #AAC7E1 32px + 흰색 체크 SVG, 미선택 시 빈 24px 원형 (border #D1D5DC)

**커밋**: `feat: extract question card component`

---

### Task 4: page.tsx 골격 재작성

**파일**: `src/app/budget-draft/page.tsx` (전면 수정)

- 기존 step 컴포넌트(`Step1`~`HoneymoonStep`, `ResultView`, `OptionCard`, `StepHeader`) 전부 제거
- 새 상태:
  ```ts
  const TOTAL_STEPS = 14; // 진입 1 + 13문항
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>(EMPTY_ANSWERS);
  const [persona, setPersona] = useState<PersonaType | null>(null);
  ```
- 헤더(기존 그대로) + ProgressBar + 메인 영역(질문 마운트는 다음 Task) + Bottom nav 골격
- 진입 시 옛 sessionStorage 키 `budgetroad_result` 삭제 (try/catch)
- 새 키 `budgetroad_onboarding_v6` 복원 로직 (step=14에 도달했다면 persona 재계산)
- `trackEvent('budget_draft_entered')` 마운트 시 발사 (기존 동작 유지)

**커밋**: `refactor: rewrite budget-draft page shell for onboarding v6`

---

### Task 5: 진입 라우팅 스텝 + 공통 렌더 함수

**파일**: `src/app/budget-draft/page.tsx`

- step=0일 때 `STEPS[0]` (entry) 마운트
- 공통 렌더 함수 `renderQuestion(meta, value, onSelect)` 정의 (다음 Task들에서 재사용)
- 진입 옵션 5개 렌더
- 선택 시 `setAnswers(prev => ({ ...prev, entryStage: id }))` + `onboarding_question_answered` 이벤트
- '아직 모르겠다' 선택 시 동일 흐름 (탐색미결정 분기는 placeholder)
- `trackFirstInput()` 호출

**커밋**: `feat: add entry routing step and shared question renderer`

---

### Task 6: 메인 유형 결정 6문항

**파일**: `src/app/budget-draft/page.tsx`

- step=1~6 매핑: Q1, Q2, Q3, Q4, Q7, Q8
- `STEPS[1]`~`STEPS[6]` 데이터를 `renderQuestion`으로 렌더
- 옵션 선택 시 `setAnswers(prev => ({ ...prev, [qid]: choiceId }))` + 이벤트 발사
- Q번호 prefix("Q1.", "Q2.", ...) 표시
- 부제는 없음 (이 6문항엔 subtitle 데이터 없음)

**커밋**: `feat: add main persona-classifying questions (Q1-Q4, Q7, Q8)`

---

### Task 7: 태그 3문항 + Modifier 4문항

**파일**: `src/app/budget-draft/page.tsx`

- step=7~9: T2, T5, T7
- step=10~13: M1, M2, M3, M5
- 동일한 `renderQuestion` 재사용
- M1 마운트 시 subtitle 노출

**커밋**: `feat: add tag and modifier questions (T2, T5, T7, M1-M3, M5)`

---

### Task 8: 임시 결과 화면 + 분류 실행

**파일**: `src/app/budget-draft/page.tsx`

- `next()`가 step=13(M5)에서 호출되면:
  - `score = scoreAxis(answers)`
  - `p = classifyPersona(score)`
  - `setPersona(p)`, step→14
  - `result_viewed` 이벤트 발사 (payload: persona, axisA, axisB, entry_stage, 13개 응답, time_in_steps_sec)
- step=14 화면:
  - 유형 이름 30px Bold (예: "당신은 본질미니멀형입니다") `#373737`
  - 한 줄 설명 (`PERSONA_DESCRIPTIONS[p]`)
  - 축 점수 표시 (디버그용, dev 환경에서만): `axisA: -3 / axisB: -4`
  - "다음 단계 준비 중" 안내 16px gray
  - "다시하기" 버튼 (검정 배경, 흰 텍스트, 78px) → onClick에서 `reset()` 호출

**커밋**: `feat: add temporary persona result view with axis scores`

---

### Task 9: sessionStorage 마이그레이션

**파일**: `src/app/budget-draft/page.tsx`

- 진입 useEffect에서:
  - 옛 키 `budgetroad_result` 발견 시 `sessionStorage.removeItem(...)` (try/catch)
  - 새 키 `budgetroad_onboarding_v6` 복원 시도 → `{ step, answers, persona, axisScore }`
- 옵션 선택 후 매번 새 키로 저장 (별도 useEffect로 `[step, answers, persona]` 의존)

**커밋**: `feat: migrate session storage to onboarding v6 schema`

---

### Task 10: GA4 이벤트 갱신

**파일**: `src/lib/gtag.ts`

- 기존 `EventName` 유니온 타입에 `onboarding_question_answered` 추가
- 페이로드 타입 정의 (`question_id`, `choice_id`)
- 기존 `result_viewed` payload 타입 갱신 (새 필드)
- `trackEvent` 호출 사이트가 타입 안전하게 동작하는지 확인

**커밋**: `feat: add onboarding question answered event`

---

### Task 11: 시각 확인 (dev 서버)

**도구**: `npm run dev`

- 모바일(402px) / 데스크탑(1440px) 둘 다 점검
- 14스텝 전부 클릭해서 결과 도달 확인
- 옵션 개수가 각 질문별로 정확히 노출:
  - 진입 5개 / Q1/Q4/Q7/Q8/T7/M1/M2/M5 4개 / T2/T5/M3 3개 / Q2/Q3 2개
- 진행률 바 14세그먼트 동적 표시
- "단계 STEP 1 / 3" 라벨 노출
- Q번호 prefix 노출
- 카드 선택/미선택 색상·높이 정확
- 콘솔 에러 0

각 사분면 케이스로 분류 손 검증:
- Q1=A, Q2=B, Q3=A, Q4=B, Q7=C, Q8=A → axisA=4, axisB=8 → 전통격식
- Q1=B, Q2=A, Q3=B, Q4=A, Q7=B, Q8=C → axisA=1, axisB=-7 → 경험연출
- Q1=D, Q2=A, Q3=B, Q4=C, Q7=D, Q8=D → axisA=-7, axisB=-6 → 본질미니멀
- (전부 중간값) → 탐색미결정 확인

**커밋 없음** — 발견된 이슈는 별도 fix 커밋

---

### Task 12: 빌드/lint

**도구**: `npm run lint`, `npm run build`

- 타입 에러/린트 에러 0
- 빌드 통과
- 발견 시 수정 후 `chore: fix lint and types` 커밋

---

## 6. PR 분할 (사용자 결정: 옵션 B)

| PR | 포함 Task | 리뷰 포인트 |
|---|---|---|
| PR-1: 데이터 모델 + 공통 컴포넌트 | Task 1, 2, 3 | 타입 안정성, 가중치 표 정확성, 컴포넌트 props 설계 |
| PR-2: 페이지 흐름 교체 | Task 4~12 | 14스텝 흐름, 분류 로직, 이벤트, sessionStorage 마이그레이션 |

브랜치: `feature/onboarding-v6-step1` (main에서 새로 분기)

## 7. 검증 체크리스트 (PR-2 끝나기 전)

- [ ] 14스텝 모두 클릭해서 결과 도달 가능
- [ ] 이전 버튼으로 모든 스텝 역행 가능
- [ ] 결과 화면 "다시하기" 클릭 시 step=0으로 리셋되고 sessionStorage 정리됨
- [ ] 모바일·데스크탑 반응형 정상
- [ ] Figma CSS 토큰 일치 (카드 72/76px, gap 12px, padding 20px, 색상)
- [ ] Q번호 prefix 노출 (Q1, Q2, Q3, Q4, Q7, Q8, T2, T5, T7, M1, M2, M3, M5)
- [ ] "단계 STEP 1 / 3" 라벨 노출
- [ ] 옵션 개수 정확
- [ ] 5유형(탐색미결정 포함) 분류 동작 확인 — Task 11의 4케이스 검증
- [ ] `npm run build` 통과
- [ ] 콘솔 에러 0
- [ ] 옛 sessionStorage 키 자동 삭제됨

## 8. 후속 작업 (이 계획 종료 후)

1. **STEP 2 계획서** — `docs/Result Page Calculation Algorithm.md` STAGE 3~8 구현
   - 변수 세팅(M1·M2·M5 변환, 유형별 베이스, 토글 디폴트)
   - 추천 식장 형태(STAGE 4)
   - 예산 계산(보증인원 식대, 지역계수, 카테고리별 합산)
   - 정합성 진단(밴드 / WARN·OVER·UNDER·FIT)
   - 동적 조언(세이브·투자)
   - 3탭 결과 페이지 UI
   - 백엔드 도입 여부 결정 (handoff API or 클라이언트 only)
2. **STEP 3 계획서** — 추가금 케어 토글 25개 + 유형별 디폴트 매트릭스 + 클라이언트 실시간 재계산
3. **PRD 보강 필요 항목**
   - '아직 모르겠다' 진입 분기 흐름
4. **DB 시드 (백엔드 도입 시)** — questions / options / type_config / toggle_items / region_profiles / pricing CSV
