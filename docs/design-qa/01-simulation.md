# 디자인 QA — 01. 시뮬레이션 화면 (Q1~Q14)

> 작성일: 2026-05-28 · 상태: **🟢 비교표 작성 완료 — 사용자 결정 대기**
> 기준 문서: `docs/텍스트 스타일 현황 (2026-05-28).md`
> 대상 코드: `src/app/budget-draft/page.tsx` + `src/components/onboarding/{progress-bar,question-card}.tsx`
> 정밀 분석 화면: **Q4** (옵션 4개, 모바일에서 타이틀 wrap, 가장 복합적)

## 진행 상태

| 단계 | 상태 |
|---|---|
| 1. 첨부 (Figma CSS dump + 스크린샷) | ✅ |
| 2. 비교표 작성 (claude) | ✅ |
| 3. 결정 (사용자) | ⬜ |
| 4. 코드 수정 + 검증 | ⬜ |
| 5. 텍스트 스타일 현황 동기 갱신 | ⬜ |
| 6. commit + push | ⬜ |

---

## 1. 첨부 영역 (사용자 작성)

> viewport당 1덩어리 + 스크린샷 1장. 파싱·분해는 claude가 담당.

### 1-1. 모바일

- 스크린샷: `assets/01-simulation/모바일-시뮬레이션-1.svg`
- CSS dump: `assets/01-simulation/01-simulation-모바일-CSS.md`
- 캔버스: 402 × 1068, bg `#F9FAFB`

### 1-2. 데스크톱

- 스크린샷: `assets/01-simulation/데스크톱-시뮬레이션-1.svg`
- CSS dump: `assets/01-simulation/01-simulation-데스크톱-CSS.md`
- 캔버스: 1440 × 1024, bg `#F9FAFB`, 본문 컨테이너 576px 중앙(left 432)

---

## 2. 현재 코드 (claude 추출 — As-Is)

### 2-1. Header (로고)

`src/app/budget-draft/page.tsx:165-173`

```tsx
<header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-[#E5E7EB] bg-[#F9FAFB]/80 px-6 backdrop-blur-sm sm:h-[87px] sm:px-8">
  <Link href="/">
    <img
      src="/brand/logo-ko-nav.png"
      alt="버짓로드"
      className="h-[28px] w-auto sm:h-[36px]"
    />
  </Link>
</header>
```

| 속성 | 값 |
|---|---|
| height | 56px (mobile) / 87px (sm+) |
| padding-x | 24px / 32px |
| border-bottom | 1px `#E5E7EB` |
| background | `#F9FAFB` + 80% opacity + backdrop-blur |
| logo height | 28px / 36px |

### 2-2. ProgressBar

`src/components/onboarding/progress-bar.tsx:9-32`

```tsx
<div className="w-full">
  <div className="flex items-center justify-between pb-3">
    <span className="text-sm leading-5 text-[#6A7282]">
      단계 {currentStep + 1} / {totalSteps}
    </span>
    <span className="text-sm leading-5 text-[#6A7282]">{percent}% 완료</span>
  </div>
  <div className="flex w-full gap-[4px]">
    {/* segment 14개, 활성 #AAC7E1 / 비활성 #E5E7EB */}
    <div className="h-[10px] flex-1 rounded-full bg-[#AAC7E1]" />
  </div>
</div>
```

| 속성 | 값 |
|---|---|
| 좌·우 라벨 font-size | 14px (`text-sm`) |
| 좌·우 라벨 weight | 400 (default) |
| 좌·우 라벨 line-height | 20px (`leading-5`) |
| 좌·우 라벨 color | `#6A7282` |
| 라벨↔바 간격 | 12px (`pb-3`) |
| 바 height | 10px |
| segment gap | 4px |
| segment radius | full |
| 활성 색 | `#AAC7E1` |
| 비활성 색 | `#E5E7EB` |
| 컨테이너 max-width | 576px (부모에서 적용) |

### 2-3. 질문 영역

`src/app/budget-draft/page.tsx:253-261`

```tsx
<div className="space-y-1.5 pb-2 pt-2">
  <p className="text-sm leading-5 text-[#6A7282]">Q{stepNumber}.</p>
  <h1 className="text-[30px] font-bold leading-9 text-[#373737]">{meta.title}</h1>
  {meta.subtitle && (
    <p className="pt-2 text-base leading-6 text-[#6A7282]">{meta.subtitle}</p>
  )}
</div>
```

| 위치 | font-size | weight | color | line-height |
|---|:---:|:---:|---|:---:|
| Q번호 prefix | 14px | 400 | `#6A7282` | 20px |
| **질문 타이틀** | **30px** | **700** | `#373737` | 36px |
| 부제 | 16px | 400 | `#6A7282` | 24px |

### 2-4. 옵션 카드

`src/components/onboarding/question-card.tsx:33-74`

```tsx
<button
  className={`flex min-h-[74px] w-full items-center justify-between gap-3 rounded-[14px] border-2 px-5 py-5 text-left ${
    selected
      ? 'border-[#AAC7E1] bg-[rgba(170,199,225,0.3)]'
      : 'border-[#E5E7EB] bg-white'
  }`}
>
  <div className="flex min-w-0 flex-col">
    <span
      className={`text-lg font-medium leading-7 ${
        selected ? 'text-[#101828]' : 'text-[#364153]'
      }`}
    >
      {label}
    </span>
  </div>
  {selected ? (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#AAC7E1]">
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path d="M4.5 9L7.5 12L13.5 6" stroke="white" strokeWidth="1.8" />
      </svg>
    </div>
  ) : (
    <div className="h-7 w-7 shrink-0 rounded-full border-2 border-[#D1D5DC] bg-white" />
  )}
</button>
```

| 속성 | 미선택 | 선택 |
|---|---|---|
| min-height | 74px | 74px |
| border | 2px `#E5E7EB` | 2px `#AAC7E1` |
| background | white | `rgba(170,199,225,0.3)` |
| padding-x | 20px | 20px |
| padding-y | 20px | 20px |
| radius | 14px | 14px |
| 라벨 font-size | **18px** (`text-lg`) | **18px** |
| 라벨 weight | 500 | 500 |
| 라벨 line-height | 28px (`leading-7`) | 28px |
| 라벨 color | `#364153` | `#101828` |
| indicator size | 28px (`h-7 w-7`) | 28px |
| indicator | 빈 원형 border 2px `#D1D5DC` | bg `#AAC7E1` + 18px 체크 SVG (stroke 1.8) |
| 카드 간 gap | 12px (부모 `gap-3`) | — |

### 2-5. Bottom Nav

`src/app/budget-draft/page.tsx:197-234`

```tsx
<nav className="sticky bottom-0 z-10 border-t border-[#E5E7EB] bg-[#F9FAFB]/90 backdrop-blur-md">
  <div className="mx-auto flex w-full max-w-[576px] items-center justify-between px-6 py-4">
    <button className="flex h-14 items-center gap-2 text-base font-bold text-[#373737]">
      <svg width="16" height="16" viewBox="0 0 16 16">
        <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      이전
    </button>
    <button className="flex h-14 items-center gap-2 text-base font-bold text-[#373737]">
      {step === TOTAL_STEPS - 1 ? '결과 보기' : '다음'}
      <svg width="16" height="16" viewBox="0 0 16 16">
        <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </button>
  </div>
</nav>
```

| 속성 | 값 |
|---|---|
| nav height (버튼) | 56px (`h-14`) |
| nav padding-y | 16px (`py-4`) |
| 버튼 텍스트 font-size | **16px** (`text-base`) |
| 버튼 텍스트 weight | 700 (`font-bold`) |
| 버튼 텍스트 color | `#373737` |
| 텍스트↔화살표 gap | 8px (`gap-2`) |
| 화살표 SVG size | **16×16** |
| 화살표 stroke-width | **1.5** |
| disabled opacity | 0.4 |

---

## 3. 비교표 (claude 작성)

> 표식: 🔴 결정적 차이 · 🟡 미세 차이 · 🟢 동일 · ⚪️ 의도적 차이 (사용자 결정으로 코드가 우선)
> Figma 값은 mobile(M) / desktop(D) 표기.

### 3-1. Header (로고 + 컨테이너)

| ID | 항목 | Figma | 현재 코드 | 표식 | 비고 |
|:---:|---|---|---|:---:|---|
| H1 | 헤더 height | M 88 / D 87 | M 56 / D 87 | 🔴 | **모바일 56→88**. 56px는 데스크톱 87의 절반 수준, 모바일에서 헤더 시각 비중 약함 |
| H2 | 헤더 padding | 24 / 32 | M 24 / D 32 | 🟢 | 동일 |
| H3 | border-bottom | 1px `#E5E7EB` | 1px `#E5E7EB` | 🟢 | (모바일 1.32px는 Figma scale artifact) |
| H4 | 로고 크기 | 132 × **41** (둘 다) | M 28 / D 36 (height) | 🔴 | **로고가 Figma 41px, 코드 28/36px**. 비율 유지하되 height 36→41 정도 검토 |
| H5 | bg | `#F9FAFB` | `#F9FAFB` + 80% opacity + blur | ⚪️ | sticky scroll blur 의도. Figma는 정적 |

### 3-2. ProgressBar

| ID | 항목 | Figma | 현재 코드 | 표식 | 비고 |
|:---:|---|---|---|:---:|---|
| P1 | 좌측 라벨 | "단계 STEP 1" | "단계 X / 14" | ⚪️ | 사용자 결정 — micro 단계 노출 (Q/T/M macro와 분리) |
| P2 | 라벨 typography | 14 / 400 / `#6A7282` / lh 20 | 14 / 400 / `#6A7282` / lh 20 | 🟢 | 완전 일치 |
| P3 | segment 개수 | **5** | **14** | ⚪️ | 사용자 결정 — micro 단계마다 1 segment |
| P4 | segment height | 10 | 10 | 🟢 | 동일 |
| P5 | segment gap | M 8 / D 7 | 4 | 🟡 | gap이 좁음 — 14 segment 환경에선 좁아야 fit. **Figma 5 segment 환경 가정의 gap이라 무관** |
| P6 | 활성 색 | `#AAC7E1` | `#AAC7E1` | 🟢 | 동일 |
| P7 | 비활성 색 | `#E5E7EB` | `#E5E7EB` | 🟢 | 동일 |
| P8 | 라벨↔바 간격 | 13 (33 - 20) | 12 (`pb-3`) | 🟢 | 사실상 동일 |

### 3-3. 질문 영역

| ID | 항목 | Figma | 현재 코드 | 표식 | 비고 |
|:---:|---|---|---|:---:|---|
| Q1 | Q번호 prefix typography | 14 / 400 / `#6A7282` / lh 20 | 14 / 400 / `#6A7282` / lh 20 | 🟢 | 완전 일치 |
| Q2 | **질문 타이틀 size** | **M 28 / D 30** | **30 (전 viewport)** | 🔴 | **모바일에서 30→28**. wrap 빈도 감소. desktop은 유지 |
| Q3 | 타이틀 weight | 700 | 700 | 🟢 | 동일 |
| Q4 | 타이틀 line-height | 36 | 36 | 🟢 | 동일 |
| Q5 | 타이틀 color | `#373737` | `#373737` | 🟢 | 동일 |
| Q6 | Q번호↔타이틀 간격 | 8 (28 - 20) | 6 (`space-y-1.5`) | 🟡 | 미세 — 8px가 더 안정. `space-y-2` 권장 |
| Q7 | subtitle (Q4) | hidden | hidden | 🟢 | Q4는 subtitle 없음 (M1만 있음) |

### 3-4. 옵션 카드 (Q4 = 4개 옵션, 첫 카드 selected)

| ID | 항목 | Figma | 현재 코드 | 표식 | 비고 |
|:---:|---|---|---|:---:|---|
| O1 | 카드 width | M 295 / D 576 | M (402−48)=354 / D 576 | 🔴 | **모바일이 더 좁음** (Figma px24×2 = 48 패딩이 아니라 53×2 = 106 패딩) |
| O2 | **카드 height (selected)** | **76** | min-h **74** | 🔴 | 선택 시 카드가 살짝 커지는 의도. 코드는 통일 |
| O3 | **카드 height (unselected)** | **72** | min-h **74** | 🔴 | 동일 이유. selected/unselected 4px 분리 |
| O4 | 카드 padding | 20 (모든 방향) | 20 | 🟢 | 동일 |
| O5 | 카드 radius | 14 | 14 | 🟢 | 동일 |
| O6 | border (unselected) | 2px `#E5E7EB` | 2px `#E5E7EB` | 🟢 | 동일 |
| O7 | border (selected) | 2px `#AAC7E1` | 2px `#AAC7E1` | 🟢 | 동일 |
| O8 | bg (selected) | rgba(170,199,225,0.3) | rgba(170,199,225,0.3) | 🟢 | 동일 |
| O9 | 라벨 size/weight/lh | 18 / 500 / 28 | 18 / 500 / 28 | 🟢 | 완전 일치 |
| O10 | 라벨 color (selected) | `#101828` | `#101828` | 🟢 | 동일 |
| O11 | 라벨 color (unselected) | `#364153` | `#364153` | 🟢 | 동일 |
| O12 | 카드 간 gap | 12 | 12 (`gap-3`) | 🟢 | 동일 |

### 3-5. 옵션 selected indicator (체크 원형)

| ID | 항목 | Figma | 현재 코드 | 표식 | 비고 |
|:---:|---|---|---|:---:|---|
| I1 | **외부 원 크기** | **32 × 32** | **28 × 28** (`h-7 w-7`) | 🔴 | 사용자가 처음 언급한 차이 |
| I2 | 외부 원 bg | `#AAC7E1` | `#AAC7E1` | 🟢 | 동일 |
| I3 | **내부 체크 SVG** | **20 × 20** | **18 × 18** | 🔴 | indicator 32 가면 내부도 18→20 |
| I4 | 체크 stroke 색 | `#EBF0F4` (옅은 회색) | white | 🟡 | 거의 white라 시각상 무차이지만 토큰 정확화 가능 |
| I5 | unselected indicator | (Figma에 안 그림 — selected만 노출) | 28×28 border 2 `#D1D5DC` | ⚪️ | 코드 자체 결정 (선택 전 상태) |

### 3-6. Bottom Nav (이전 / 다음 + 화살표)

| ID | 항목 | Figma | 현재 코드 | 표식 | 비고 |
|:---:|---|---|---|:---:|---|
| N1 | **버튼 텍스트 size** | **M 16 / D 18** | **16 (전 viewport)** | 🔴 | desktop 16→18 |
| N2 | 버튼 텍스트 weight | 700 | 700 | 🟢 | 동일 |
| N3 | 버튼 텍스트 color | `#373737` | `#373737` | 🟢 | 동일 |
| N4 | **화살표 SVG size** | **M 25 / D 28** | **16 (전 viewport)** | 🔴 | **사용자 첫 언급. 16→25/28로 1.5~1.8배 키움** |
| N5 | 화살표 stroke 색 | `#373737` | currentColor (`#373737`) | 🟢 | 동일 |
| N6 | nav sticky 컨테이너 | (Figma는 absolute top 938) | sticky bottom + border-top + blur | ⚪️ | 코드는 sticky bottom 정책 — 보존 |
| N7 | 텍스트↔화살표 gap | (Figma 좌표만 — 약 8~10) | 8 (`gap-2`) | 🟢 | 동일 |

### 3-7. 컨테이너 / 모바일 좌우 패딩

| ID | 항목 | Figma | 현재 코드 | 표식 | 비고 |
|:---:|---|---|---|:---:|---|
| C1 | 데스크톱 컨테이너 width | 576 (중앙) | max-w-[576px] | 🟢 | 일치 |
| C2 | **모바일 옵션 카드 영역 좌우 패딩** | ~**53** | **24** (`px-6`) | 🔴 | Figma는 카드 295/(402−295)/2 = 53px. 코드는 24px. **검토 필요** — 53은 좀 과한 느낌이지만 디자인 의도일 가능성 |
| C3 | 모바일 질문 영역 좌우 패딩 | ~**67** | **24** | 🔴 | 질문 영역만 67px (옵션 카드보다 14px 더 좁음). **Figma artifact 가능성 — 디자이너 확인 권장** |
| C4 | 모바일 진행률 영역 좌우 패딩 | ~31 | 24 | 🟡 | 미세 |

### 3-8. Ripple Effect (다른 화면 영향)

| 변경 | 영향 받는 곳 | 액션 |
|---|---|---|
| **옵션 라벨 18px 유지** (Figma와 동일) | 결과 페이지 카드 합계·모달 제목도 18px | 변경 X → ripple 없음 ✓ |
| 질문 타이틀 30→28 (mobile만) | 결과 페이지 영향 없음 — 시뮬에만 쓰임 | 안전 |
| Indicator 28→32 | onboarding에만 쓰임 (결과 페이지엔 같은 모양 없음) | 안전 |
| Nav 화살표 16→25/28 | 결과 페이지 nav 없음 (3탭 + sticky footer) | 안전 |
| 모바일 좌우 패딩 24→53 | 결과 페이지도 동일 패딩 사용 시 ripple | **결정 필요** — 시뮬레이션만 적용? 전체 통일? |

---

## 4. 결정 (확정 2026-05-28)

| ID | 위치 | 차이 요약 | 결정 | 비고 |
|:---:|---|---|:---:|---|
| H1 | 헤더 높이 (mobile) | 56 → 88 | ✅ 수정 | mobile/desktop 일관성 |
| H4 | 로고 크기 | 28/36 → 41 | ✅ 수정 | Figma는 mobile/desktop 동일 41 |
| Q2 | 질문 타이틀 (mobile) | 30 → 28 | ✅ 수정 | mobile wrap 빈도 ↓ |
| Q6 | Q번호↔타이틀 간격 | 6 → 8 | ✅ 수정 | `space-y-2` |
| O2/O3 | 옵션 카드 높이 분리 | 74 통일 유지 | ❌ 보존 | 사용자 명시 — "클릭 시 미세 움직임 거슬림" |
| I1 | indicator 크기 | 28 → 32 | ✅ 수정 | 사용자 첫 언급 케이스 |
| I3 | indicator 내부 체크 | 18 → 20 | ✅ 수정 | I1 동반 |
| I4 | indicator 체크 색 | white 유지 | ❌ 보존 | 대비 가독성 우선 |
| N1 | nav 텍스트 (desktop) | 16 → 18 | ✅ 수정 | `sm:text-lg` |
| N4 | nav 화살표 크기 | 16 → mobile 25 / desktop 28 | ✅ 수정 | 사용자 첫 언급 케이스 |
| C2 | 모바일 옵션 좌우 패딩 | 24 유지 | ❌ 보존 | 53은 Figma artifact 가능성, 실 모바일 폭 대응 |
| C3 | 모바일 질문 좌우 패딩 | 24 유지 | ❌ 보존 | 동일 이유 |
| P5 | progress segment gap | (의도적 차이) | ❌ | 사용자 macro 결정 (Q/T/M micro 단계) |
| P1/P3 | progress 좌측 라벨 + segment 개수 | (의도적 차이) | ❌ | 사용자 macro 결정 |

---

## 4. 결정 (사용자 작성)

| ID | 위치 | 결정 | 비고 |
|---|---|---|---|
| | | | |

---

## 5. 변경 후

### 5-1. 적용 diff (요약)

**`src/components/onboarding/question-card.tsx`**
- `INDICATOR_SIZE`: `h-7 w-7` → `h-8 w-8` (28→32)
- 체크 SVG: `width="18" height="18"` → `width="20" height="20"` (viewBox 0 0 18 18 유지 — 자동 비례 확대)

**`src/app/budget-draft/page.tsx`**
- Header: `h-14 ... sm:h-[87px]` → `h-[88px]` (전 viewport 통일)
- Logo: `h-[28px] w-auto sm:h-[36px]` → `h-[41px] w-auto`
- QuestionView: `space-y-1.5` → `space-y-2`, 타이틀 `text-[30px]` → `text-[28px] sm:text-[30px]`
- Bottom Nav 텍스트: `text-base` → `text-base sm:text-lg`
- Bottom Nav 화살표: `width="16" height="16"` (attribute) → `className="h-[25px] w-[25px] sm:h-7 sm:w-7"`

**`docs/텍스트 스타일 현황 (2026-05-28).md`**
- § 1-1 헤더 로고: 28/36 → 41 통일
- § 1-3 시뮬 하단 네비: 텍스트 16 → 16/18, 화살표 row 신규 추가
- § 2-1 질문 타이틀: 30 → 28/30
- § 0 변환표, § 10 분포: 28px row 추가

### 5-2. 자가 검증
- [x] `npm run lint` 통과 (0 errors, 41 warnings — 전부 기존 warning)
- [x] `npm run build` 통과 (exit 0)
- [ ] 모바일 width 402px에서 정렬 확인 → **Vercel preview** (사용자 확인)
- [ ] 데스크탑 width 1440px에서 정렬 확인 → **Vercel preview** (사용자 확인)
- [x] `텍스트 스타일 현황 (2026-05-28).md` 갱신
- [ ] commit + push → Vercel preview 확인

### 5-3. 커밋
*(commit 직후 hash 기록)*

### 5-4. 롤백 방법

이 PR의 디자인 변경만 되돌리려면:
```
git revert <hash>
git push
```
1 commit으로 묶여 있어 한 번에 원상복귀. PR #29 안의 다른 commit은 영향 없음.
