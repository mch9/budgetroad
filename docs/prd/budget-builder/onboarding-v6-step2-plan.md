# 온보딩 v6.0 — STEP 2(결과 페이지 + 로딩) 구현 계획

> 참조 spec: `docs/questionnaire design.md` (v6.0)
> 참조 알고리즘: `docs/Result Page Calculation Algorithm.md` (계산 v2)
> 참조 핸드오프: `docs/Development handoff.md`
> 참조 디자인: 4 결과 탭 + 모달 + 4장 로딩 (`docs/모바일-결과페이지-*.md`, `docs/모바일-결과화면 로딩페이지-*.md`)
> 참조 가격 DB: `가격 정보 DB.csv` (8,280행, 21지역 × 12개월 × 4 카테고리 × 5분위)
> 작성일: 2026-05-27 · 작성자: claude (powel 협의)

## 1. 목표 (Scope)

시뮬레이션 마지막 응답 직후 **로딩 페이지 3.5초 → 결과 페이지 3탭**으로 자연스럽게 전환. 사용자의 13(+1) 응답을 8단계 계산 엔진으로 처리해 종합 설계서·항목별 내역·추가금 케어 3탭으로 시각화한다.

### 포함
- 가격 DB CSV → TypeScript 객체 변환 (빌드 타임 집계)
- 계산 엔진 순수 모듈 (`src/lib/budget-engine/`) — STAGE 3~7
- M4 시기 질문 추가 (성수기/비성수기) → 14문항
- 로딩 페이지 3.5초 시퀀스 (3-step 카드 + wiggle 배지)
- 결과 페이지 — 3탭 + 푸터(실시간 총 예산) + 저장공유 모달
- 추가금 케어 25개 토글 (유형별 디폴트, 실시간 합계 반영)

### 제외 (후속 작업)
- 백엔드 API (`/api/v1/diagnose`) — 향후 AI LLM 도입 시점
- 저장공유 모달의 실제 기능 (PDF·카톡·이미지·상담) — UI만, 클릭 시 토스트 안내
- 결과 영구 저장·URL 공유 — Auth + DB 도입 후
- 콘텐츠 (5유형 × 시나리오별 동적 텍스트) — placeholder 시작, PM 보강
- 페르소나 일러스트 5종 — 임시 placeholder 컴포넌트, 디자인 자산 도착 후 교체

### 확정 사항 (사용자 결정)
- **결과 카테고리**: 5개 (예식장 / 스드메 / 예물·예단 / 혼수 / 신혼여행). "기타"·답례품 제거. 청첩장 무시.
- **추가금 케어 토글 UI**: 4 그룹 (예식장 / 스튜디오 / 드레스 / 메이크업). spec의 "예식장 연출"+"예식장 진행·가족"을 "예식장"으로 통합. 25개 토글 그대로.
- **토글 가산 매핑**:
  - 스튜디오·드레스·메이크업 토글 → **스드메** 카테고리 가산
  - 예식장 연출·진행 토글 → **예식장** 카테고리 가산
- **M4 시기 질문**: 성수기(3~6·9~11월) / 비성수기(7~8·12~2월) 2지선다
- **지역 매핑**: 서울 / 수도권 / 광역시 / 이외 지역 → CSV의 동명 그룹과 1:1
- **M2 매핑**: 30 / 100 / 225 / 350 (이전 합의)
- **로딩 시간**: 3.5초 (3단계 × 1초 + fade 0.5초)
- **모달 4 액션**: 디자인만, 클릭 시 토스트 `"곧 만나요!"`
- **PR 운영**: 같은 브랜치(`feature/onboarding-v6-step1`)에 계속 commit, PR #29 title을 작업 진행에 맞춰 갱신
- **모달 카피**: UX 라이팅 개선안 적용 (PDF로 내려받기 / 카카오톡으로 공유하기 / 이미지로 내려받기 / 전문가 상담 신청하기)

### 빈칸 (이번 단계도 placeholder)
- 5유형 × 시나리오별 reasoning/추천/절약/TOP3 동적 텍스트 콘텐츠 — 디자인 산출물의 더미 텍스트 + `{유형명}` placeholder로 시작
- 페르소나 일러스트 자산 5종 — CSS 그라데이션 placeholder
- 추가금 토글 중 일부 가격(예: 드레스 지정 +55~140만 범위 → 단일 값 결정 필요)
- 일러스트는 사용자/디자이너가 후속 제공

## 2. 아키텍처 결정

### 결정 1: 라우팅은 같은 URL(`/budget-draft`), 컴포넌트 분리
시뮬 → 로딩 → 결과 모두 `/budget-draft` 한 페이지에서 step 상태로 전환. URL 분리는 sessionStorage 기반이라 의미 적음.
- step 0~13: 시뮬레이션 (Q1~M5 + M4 추가) — 인라인 컴포넌트
- step 14: 로딩 (`<LoadingView>` 자동 마운트, 3.5초 후 step 15)
- step 15: 결과 페이지 (`<ResultView>` 마운트, 3탭 라우팅)

### 결정 2: 가격 DB는 빌드 타임 집계
CSV 8,280행을 그대로 import하면 번들 ~500KB 부담. 빌드 스크립트로 집계:

```
scripts/build-pricing.ts        # CSV → 4개 TS 파일 생성

src/lib/budget-engine/
  data/
    region-profiles.ts    # 4지역 × 2시즌 = 8 entries (보증인원·식대·대관·기본식대·생화)
    category-base.ts      # 4지역 × 2시즌 × 3 카테고리 = 24 entries (스튜디오/드레스/메이크업 mid 합)
    toggle-prices.ts      # 25 토글 × 4지역 × 2시즌 = 200 entries
    type-config.ts        # 5유형 정적 (베이스·디폴트·밴드·OFF-TYPE·기타 추정)
```

총 데이터 ~50KB. 가격 갱신 시 CSV 교체 + 스크립트 재실행 + commit.

### 결정 3: 계산 엔진 순수 모듈
```
src/lib/budget-engine/
  index.ts                  # diagnose(answers, toggles?) → ResultPayload
  stages/
    stage3-variables.ts     # 변수 세팅 (region, guests, season, target, base, toggleDefaults)
    stage4-venue.ts         # 추천 식장 형태 (form, alt, reasons)
    stage5-budget.ts        # 예산 계산 (categories, venueDetail)
    stage6-consistency.ts   # 정합성 진단 (status, headline, body)
    stage7-advice.ts        # 동적 조언 (save, invest)
  types.ts                  # 공유 타입
```

각 stage 함수는 순수. 입력 = answers + (선택) toggleState. 출력 = stage 결과 object. 향후 백엔드 API route에서 그대로 import 가능.

### 결정 4: 토글 상태는 결과 페이지 안에서 관리
```
<ResultView>
  const [toggles, setToggles] = useState<Record<ToggleId, boolean>>(initialFromPersona)
  const liveResult = useMemo(() => diagnose(answers, toggles), [answers, toggles])
  → footer 총액 / 도넛 차트 / 카테고리 행 모두 liveResult 구독
```

토글 변경 → diagnose 재실행(instant) → 모든 UI 즉시 갱신. Context 불필요 (한 컴포넌트 안에서 prop drilling).

### 결정 5: 차트는 pure SVG (의존성 추가 X)
도넛 차트 5등분 + 호버는 SVG `<circle>` + `stroke-dasharray` 패턴. ~60줄. recharts/chart.js 도입 안 함.

### 결정 6: 모달은 자체 구현 (vaul 미도입)
shadcn Dialog는 데스크탑 modal 형태. 모바일 바텀시트는 fixed bottom + slide transition으로 직접 구현. 의존성 0.

### 결정 7: 로딩은 인위적 지연 (3.5초)
계산 엔진이 instant라 1단계 1초 × 3 + fade 0.5초 = 3.5초 setTimeout 시퀀스. 향후 AI LLM 도입 시 실제 응답 대기로 자연스럽게 전환.

### 결정 8: 시기 가격 처리
- CSV 12개월 → 성수기/비성수기 6개월씩 평균
- 매핑: 성수기 = 3·4·5·6·9·10·11월, 비성수기 = 7·8·12·1·2월
- 빌드 스크립트가 각 지역·카테고리·항목별로 시즌 평균 계산

### 결정 9: SessionStorage 스키마 확장
기존 키 `budgetroad_onboarding_v6`에 `toggles` 필드 추가:
```ts
{ step, answers, persona, axisScore, toggles?: Record<ToggleId, boolean> }
```
호환성: toggles 없으면 유형별 디폴트로 채움.

### 결정 10: 분류 가중치 — 14문항 영향
M4 시기 추가는 분류(scoreAxis)에 영향 없음 — Modifier 질문. 가격 계산에만 사용.

## 3. 데이터 매핑 표

### 지역 매핑 (M5 → CSV)
| M5 응답 | CSV 지역 |
|---|---|
| A 서울 | `서울` |
| B 수도권 | `수도권` |
| C 광역시 | `5대 광역시` |
| D 지방 | `이외 지역` |

### 시기 매핑 (M4 → CSV 월 집계)
| M4 응답 | 포함 월 |
|---|---|
| A 성수기 | 3·4·5·6·9·10·11 (7개월 평균) |
| B 비성수기 | 7·8·12·1·2 (5개월 평균) |

### M1·M2 매핑 (이미 정의)
- M1 예산: A=1800 / B=2750 / C=4250 / D=5500
- M2 하객: A=30 / B=100 / C=225 / D=350
- M3 양가: A=0 / B=1 / C=2

### 토글 25개 → 결과 카테고리 가산처
| spec sub-category | 결과 카테고리 (가산처) | UI 그룹 |
|---|---|---|
| 스튜디오 (5개) | 스드메 | 스튜디오 |
| 드레스 (6개) | 스드메 | 드레스 |
| 메이크업 (2개) | 스드메 | 메이크업 |
| 예식장 연출 (5개) | 예식장 | 예식장 |
| 예식장 진행·가족 (7개) | 예식장 | 예식장 |

### 유형별 베이스 (Result Algorithm STAGE 3)
| 유형 | 드레스 계약 | 메이크업 등급 | 본식 촬영 |
|---|---|---|---|
| 전통격식 | 본식+촬영(159) | 원장(78) | 예식장 연계(80) |
| 표준실용 | 본식+촬영(159) | 부원장(69) | 예식장 연계(80) |
| 경험연출 | 본식+촬영(159) | 원장(78) | 외부 전문(150) |
| 본질미니멀 | 본식만(145) | 실장(63) | 예식장 연계(80) |
| 탐색미결정 | (표준실용 fallback) | (표준실용) | (표준실용) |

### 유형별 기타 추정값 (Result Algorithm STAGE 5)
| 항목 | 전통격식 | 표준실용 | 경험연출 | 본질미니멀 | 탐색미결정 |
|---|---|---|---|---|---|
| 예물/예단 | 500 | 350 | 250 | 150 | 350 |
| 혼수 | 600 | 600 | 600 | 600 | 600 |
| 신혼여행 | 400 | 400 | 450 | 300 | 400 |

### 정합성 진단 밴드 (core = 스드메 + 예식장, 만원)
| 유형 | 하한 | 상한 |
|---|---|---|
| 본질미니멀 | 1,000 | 2,200 |
| 표준실용 | 2,200 | 3,400 |
| 경험연출 | 2,700 | 4,100 |
| 전통격식 | 3,200 | 5,000 |
| 탐색미결정 | (표준실용 밴드) | |

### OFF-TYPE 토글 (유형 충돌)
| 유형 | OFF-TYPE 토글 |
|---|---|
| 본질미니멀 | 드레스 지정·가봉 스냅·퍼스트웨어·서브 스냅·원본 구매·2부 드레스·생화 꽃장식 |
| 표준실용 | 퍼스트웨어·가봉 스냅·생화 꽃장식 |
| 경험연출 | (없음) |
| 전통격식 | 퍼스트웨어 |

## 4. 파일 구조

### 신규
| 경로 | 책임 |
|---|---|
| `scripts/build-pricing.ts` | CSV → TS 변환 (one-shot, npm run build:pricing) |
| `src/lib/budget-engine/index.ts` | diagnose() entry |
| `src/lib/budget-engine/types.ts` | ResultPayload, ToggleId, AdviceItem 등 |
| `src/lib/budget-engine/stages/stage3-variables.ts` | 변수 세팅 |
| `src/lib/budget-engine/stages/stage4-venue.ts` | 추천 식장 |
| `src/lib/budget-engine/stages/stage5-budget.ts` | 예산 계산 |
| `src/lib/budget-engine/stages/stage6-consistency.ts` | 정합성 진단 |
| `src/lib/budget-engine/stages/stage7-advice.ts` | 동적 조언 |
| `src/lib/budget-engine/data/region-profiles.ts` | 4×2 지역 프로파일 (빌드 산출물) |
| `src/lib/budget-engine/data/category-base.ts` | 4×2×3 카테고리 base (빌드 산출물) |
| `src/lib/budget-engine/data/toggle-prices.ts` | 25×4×2 토글 가격 (빌드 산출물) |
| `src/lib/budget-engine/data/type-config.ts` | 5유형 정적 설정 |
| `src/lib/budget-engine/data/toggles-meta.ts` | 토글 메타 (라벨·sub-category·디폴트 매트릭스) |
| `src/components/result/loading-view.tsx` | 로딩 페이지 3-step 시퀀스 |
| `src/components/result/result-view.tsx` | 결과 페이지 컨테이너 + 탭 라우팅 |
| `src/components/result/footer.tsx` | 푸터 (총 예산 + 저장공유 버튼) |
| `src/components/result/share-modal.tsx` | 저장공유 바텀시트 모달 |
| `src/components/result/tabs/tab-comprehensive.tsx` | 탭 1 종합 설계서 |
| `src/components/result/tabs/tab-itemized.tsx` | 탭 2 항목별 내역 |
| `src/components/result/tabs/tab-care.tsx` | 탭 3 추가금 케어 |
| `src/components/result/charts/donut-chart.tsx` | SVG 도넛 차트 5등분 |
| `src/components/result/charts/persona-illustration.tsx` | 5유형 placeholder |
| `src/components/result/ui/toggle-row.tsx` | 토글 row (탭 3) |
| `src/components/result/ui/category-row.tsx` | 카테고리 드롭다운 row (탭 2) |
| `src/components/result/ui/toast.tsx` | 토스트 알림 ("곧 만나요!") |

### 수정
| 경로 | 변경 |
|---|---|
| `src/lib/onboarding-v6.ts` | M4 시기 질문 추가, TOTAL_STEPS 13→14, getMacroStep 처리 |
| `src/app/budget-draft/page.tsx` | step 14·15 분기 추가 (loading, result), toggle state 전달 |
| `src/app/globals.css` | secondary 색상 토큰 추가 (`#7499BA`, `#CEE7FE`) |
| `package.json` | `scripts.build:pricing` 추가 |

## 5. 시각 사양 (디자인 산출물 기반)

### 색상 추가
```css
:root {
  --accent: #AAC7E1;             /* 기존 */
  --accent-strong: #7499BA;       /* 신규 — 펼친 금액 텍스트 */
  --accent-soft: #CEE7FE;         /* 신규 — 그라데이션 시작 */
  --accent-bg-10: rgba(170,199,225,0.3);  /* 신규 — 아이콘 칩 배경 */
  --accent-ring: rgba(170,199,225,0.4);   /* 신규 — 카드 보더·그림자 */
  --action: #373737;              /* 기존 */
  --background: #F9FAFB;          /* 기존 */
}
```

### 모바일 기본 사양
- 캔버스 width: 402px
- 카드 width: 361px (좌우 20.5px 여백)
- 카드 padding: 14~16px
- 카드 radius: 16px
- 카드 border: 1px `var(--accent-ring)`
- 카드 간격: 20~32px
- 푸터 height: 75.69px, sticky bottom, bg `#373737`, 상단 그림자

### 폰트
- 모두 Pretendard
- 타입명·금액: 24px / 700
- 섹션 헤딩: 20px / 600~700
- 항목명: 16px / 500
- 본문: 14px / 400 (line-height 24~26)
- 보조: 12px / 400~500
- 금액은 `tabular-nums` 강제

### 탭 네비
- top: 88px, height 40px, 흰색 배경
- 3 탭 균등 분할 (각 134px)
- 활성: bg `#373737` + 흰글자 weight 700
- 비활성: 회색 글자 `#A1A1A1` weight 500

### 푸터
- bg `#373737`, 그림자 `0 -4px 20px rgba(0,0,0,0.18)`
- 좌측: `예상 총 예산 +{deltaAmount}만원` (회색 부제) + `{totalAmount} 만원` (큰 흰글자 24px/700)
- 우측: `저장 & 공유` 버튼 — bg `#AAC7E1`, radius 14px, 글자 `#171717`/600

### 도넛 차트
- 5등분, 각 segment 색은 카테고리 컬러 (예: 예식장 #AAC7E1, 스드메 #7499BA, 예물·예단 #CEE7FE, 혼수 #B8D4E8, 신혼여행 #9BB8D4)
- 중앙에 총액 표시

## 6. 작업 단위 (Tasks)

### Task C1: 가격 DB 변환 + 계산 엔진 골격

**파일**: `scripts/build-pricing.ts` + `src/lib/budget-engine/data/*` + `src/lib/budget-engine/*`

- 변환 스크립트:
  - CSV 파싱 (Papa Parse 또는 직접)
  - 4지역(서울/수도권/5대 광역시/이외 지역) × 2시즌(성수/비성수) × 카테고리·항목별 mid값 평균
  - 4개 TS 파일 생성: region-profiles / category-base / toggle-prices / type-config
- 엔진 골격:
  - `types.ts` 정의
  - `index.ts`: `diagnose(answers, toggles?)` entry 함수 (각 stage 호출)
  - 각 stage 파일 placeholder (TODO 주석 + 더미 반환)
- toggles-meta.ts: 25개 토글 정의 (id, label, subCategory, 유형별 디폴트 매트릭스, gain 카테고리)

**검증**:
- CSV 변환 결과 sanity check (예: 서울 성수기 평균이 비성수기보다 높음)
- `diagnose(answers)` 호출 시 type 통과
- 빌드 통과

**commit**: `feat: budget engine pure module skeleton + pricing data build script`

### Task C2: STAGE 3~7 본격 구현

**파일**: `src/lib/budget-engine/stages/*`

- STAGE 3: 변수 세팅 (region, guests, season, target, base, toggleDefaults)
- STAGE 4: 추천 식장 형태 (유형 + 하객/예산 → form, alt, reasons)
- STAGE 5: 예산 계산 (식대 보증인원 공식, 스드메 지역계수, 카테고리별 합산)
- STAGE 6: 정합성 진단 (밴드 vs core → WARN/OVER/UNDER/FIT)
- STAGE 7: 동적 조언 (세이브 + 투자, OFF-TYPE 항목 지목)

**검증**:
- 손 검증 케이스 (수도권/100명/표준실용 등) 통과
- 토글 상태 변경 시 결과 즉시 변화

**commit**: `feat: implement budget engine stages 3-7`

### Task C3: M4 시기 질문 + 14문항

**파일**: `src/lib/onboarding-v6.ts`

- STEPS 배열에 M4 추가 (M3과 M5 사이)
- TOTAL_STEPS 13→14
- getMacroStep — M형이 4→5문항이지만 macroStep은 그대로 1·2·3 매핑
- EMPTY_ANSWERS·OnboardingAnswers에 M4 필드

**검증**:
- 시뮬 14문항 진행, M4 정상 노출
- 진행률 바 동작

**commit**: `feat: add M4 season question (peak/off-peak)`

### Task C4: 로딩 페이지 (LoadingView)

**파일**: `src/components/result/loading-view.tsx` + page.tsx 라우팅

- 3-step progress 카드 컴포넌트
  - 카드 상태: 대기 / 활성 / 완료
  - 활성 카드: spinner + glow + 흰 배경 + accent border
  - 완료 카드: 연한 accent bg + 체크 칩
  - 대기 카드: 60% 흰 + 회색 border + 회색 라벨
- 상단 그라데이션 배지 56×56 + wiggle 모션 (rotate ±5도)
- 헤딩 `설계서를 준비하고 있어요` / 서브 `잠시만 기다려 주세요`
- 3 단계 카피 (정확 인용):
  - `예산을 계산하고 있어요` / `선택하신 옵션을 기반으로 총 예산을 산출 중이에요`
  - `맞춤 추천을 분석 중이에요` / `두 분의 우선순위에 맞는 패키지를 찾고 있어요`
  - `설계서를 완성하고 있어요` / `결과 화면을 예쁘게 다듬는 중이에요`
- 시퀀스: setTimeout 1s × 3 + 0.5s fade → step 15
- page.tsx 라우팅: step 14일 때 `<LoadingView onComplete={() => setStep(15)} />`

**검증**:
- 시뮬 마지막 (M5) 답변 후 자동으로 로딩 전환
- 3.5초 후 결과 페이지 전환
- 단계 카드 상태 부드러운 전환

**commit**: `feat: add loading view with 3-step sequence`

### Task C5: 결과 페이지 골격 + 푸터 + 탭 네비

**파일**: `src/components/result/result-view.tsx` + `footer.tsx` + page.tsx 라우팅

- 탭 라우팅: useState로 `activeTab: 'comprehensive'|'itemized'|'care'`
- 탭 네비 UI (sticky top)
- 푸터 UI (sticky bottom)
  - 푸터 데이터: `useMemo`로 diagnose 결과 + toggle 상태 → 총액·델타
  - 저장공유 버튼 클릭 시 모달 열기 (다음 commit)
- 각 탭 placeholder (`<div>탭 N 준비 중</div>`)
- 토글 상태 management: `useState<Record<ToggleId, boolean>>` 초기값 = 유형별 디폴트
- page.tsx 라우팅: step 15일 때 `<ResultView persona answers />`

**검증**:
- 로딩 끝나면 결과 페이지 진입
- 3 탭 네비 클릭 시 활성 탭 전환
- 푸터 총액 표시 (초기값)

**commit**: `feat: add result page shell + tab nav + sticky footer`

### Task C6: 탭 1 종합 설계서

**파일**: `src/components/result/tabs/tab-comprehensive.tsx` + `persona-illustration.tsx`

- 타입 진단 카드:
  - 일러스트 placeholder (CSS 그라데이션 + 큰 이모지 같은 임시 표현 OR persona-illustration 컴포넌트로 분리)
  - `우리 커플은` 라벨 + `{personaName} 웨딩 타입` 큰 헤딩
  - 한 줄 설명 (PERSONA_DESCRIPTIONS 활용)
  - 해시태그 라인 (유형별 placeholder)
- 예산 총 합계 카드:
  - 카테고리 칩 + 라벨 + 큰 금액
  - 구분선
  - `이 예산이 나온 이유` 섹션 + TOP 3 reasoning row (placeholder 텍스트)
  - 면책 문구
- 여기에 더 투자하는 게 좋아요 카드 (유형별 placeholder)
- 여기서 줄여도 괜찮아요 카드 (유형별 placeholder)
- 지금 당장 해야 할 준비 TOP 3 카드 (디자인 텍스트 그대로 사용)

**검증**: 모바일 width 402px에서 카드 정렬, 탭 전환 시 활성 탭만 노출

**commit**: `feat: add tab 1 comprehensive design`

### Task C7: 탭 2 항목별 내역 + 도넛 차트

**파일**: `src/components/result/tabs/tab-itemized.tsx` + `donut-chart.tsx` + `category-row.tsx`

- SVG 도넛 차트 5등분
  - props: `{ data: { label, value, color }[] }`
  - SVG `<circle>` + `stroke-dasharray` + `transform: rotate` 패턴
  - 중앙에 총액 표시
- 카테고리 드롭다운 row × 5
  - 접힌 상태: 아이콘 + 카테고리명 + 금액 + caret
  - 펼친 상태: 산출 근거 표 (카테고리별 다른 구성)
- 합계 행 하단

**검증**:
- 토글 변경 시 도넛 비중 즉시 반영
- 드롭다운 펼침 애니메이션

**commit**: `feat: add tab 2 itemized breakdown with donut chart`

### Task C8: 탭 3 추가금 케어 + 25개 토글

**파일**: `src/components/result/tabs/tab-care.tsx` + `toggle-row.tsx`

- 컨트롤 바: `전체 옵션` / `전체 켜기` / `모두 끄기` 텍스트 버튼
- 토글 리스트 (4 그룹 헤더로 시각 분리):
  - 예식장 (12개)
  - 스튜디오 (5개)
  - 드레스 (6개)
  - 메이크업 (2개)
- 각 토글 row: 아이콘 칩 + 항목명 + 가격·설명 + 우측 스위치
- 스위치 켜진 색: `#AAC7E1`
- 놓치기 쉬운 추가 비용 정보 카드 (placeholder)

**검증**:
- 유형별 디폴트 자동 적용
- 토글 변경 시 푸터 총액·델타·도넛 차트·항목별 내역 모두 즉시 갱신
- 전체 켜기/모두 끄기 동작

**commit**: `feat: add tab 3 add-on care with 25 toggles + real-time recalc`

### Task C9: 저장공유 모달 + 토스트

**파일**: `src/components/result/share-modal.tsx` + `toast.tsx`

- 바텀시트 모달
  - 오버레이 `rgba(0,0,0,0.4)`, 클릭 시 닫기
  - 시트: 흰색, radius 24px 24px 0 0, 상단 grab 핸들
  - 슬라이드업 진입 애니메이션
- 헤더: `결과를 어떻게 가져갈까요?` + `아래에서 원하는 방식을 골라주세요`
- 4 액션 row (아이콘 + 라벨 + 설명):
  - PDF로 내려받기
  - 카카오톡으로 공유하기
  - 이미지로 내려받기
  - 전문가 상담 신청하기
- 클릭 시 토스트 `"곧 만나요!"`
- 닫기 버튼 + 핸들 드래그(생략 가능)
- 토스트: fixed bottom 안전 거리, fade in/out 2초 자동 사라짐

**검증**:
- 푸터의 저장공유 클릭 → 모달 열림
- 4 액션 클릭 → 토스트 노출 → 자동 사라짐

**commit**: `feat: add share modal (UI only, "coming soon" toasts)`

### Task C10: 시각 확인 + 빌드/lint

**도구**: `npm run dev`, `npm run lint`, `npm run build`

- 모바일·데스크탑 둘 다 점검
- 5유형 분류 케이스 진행 → 로딩 → 결과 페이지 도달
- 3 탭 전환 + 토글 변경 + 푸터·도넛 실시간 반영
- 모달 + 토스트 동작
- 빌드 통과 (가격 데이터 import + 큰 컴포넌트)

**commit (필요 시)**: `chore: fix lint/types for STEP 2`

## 7. PR 관리

같은 브랜치(`feature/onboarding-v6-step1`)에 C1~C10 commit 누적. PR #29 title을 작업 진행에 맞춰 단계별로 갱신:

- 현재: `feat: replace simulation with onboarding v6 (STEP 1)`
- C2 끝: `feat: onboarding v6 — simulation (14Q)`
- C5 끝: `feat: onboarding v6 — simulation + loading + result shell`
- C9 끝: `feat: onboarding v6 — full pipeline (sim + loading + result + care + modal)`

PR 본문도 단계별 commit 추가 시 갱신.

## 8. 검증 체크리스트 (C10 끝나기 전)

### 흐름
- [ ] 14문항 진행 후 로딩 자동 진입
- [ ] 로딩 3.5초 후 결과 페이지 진입
- [ ] 결과 페이지에서 3탭 전환
- [ ] 토글 변경 시 푸터·도넛·항목별 내역 모두 즉시 갱신

### 5유형 검증
- [ ] 전통격식 케이스 → 전통격식 유형 + 적합한 베이스·추정값
- [ ] 표준실용
- [ ] 경험연출
- [ ] 본질미니멀
- [ ] 탐색미결정 (표준실용 fallback)

### 계산 정합성
- [ ] 푸터 총액 = 5 카테고리 합 + 추가금 토글 합
- [ ] 도넛 5등분 비중 = 카테고리 합 비율
- [ ] 항목별 내역의 펼침 표 산출 근거 = 푸터 카테고리 금액과 일치

### UI/UX
- [ ] 모바일 width 402px 정렬
- [ ] 데스크탑 width 1440px에서도 깨지지 않음 (모바일 중앙 정렬 가능)
- [ ] 한국어 폰트 (Pretendard) 적용
- [ ] 금액 tabular-nums

### 빌드/lint
- [ ] `npm run build` 통과
- [ ] `npm run lint` 통과
- [ ] 콘솔 에러 0

## 9. 후속 작업 (이 계획 종료 후)

1. **콘텐츠 보강** — 5유형 × 시나리오별 동적 텍스트, 일러스트 자산 5종
2. **백엔드 API 도입** — AI LLM 통합 시점. 계산 엔진 모듈을 그대로 API route에서 import
3. **저장공유 실제 기능** — PDF (jsPDF) / 카톡 (Kakao SDK) / 이미지 (html2canvas) / 상담 (외부 URL)
4. **결과 영구 저장** — Auth + DB → 마이페이지 / 결과 URL 공유
5. **STEP 3 단계 정리** — spec의 STEP 3(추가금 케어)는 이번 STEP 2에 사실상 포함됨. 별도 STEP 3 작업 없음.
6. **추가 카테고리** — 청첩장·답례품 추가 시 토글로 처리

## 10. 작업 시간 추정

| Task | 추정 시간 |
|---|---|
| C1 가격 DB + 엔진 골격 | 2시간 |
| C2 STAGE 3~7 구현 | 2~3시간 |
| C3 M4 시기 질문 | 30분 |
| C4 로딩 페이지 | 1시간 |
| C5 결과 페이지 골격 | 1시간 |
| C6 탭 1 종합 설계서 | 2시간 |
| C7 탭 2 항목별 내역 + 도넛 | 2시간 |
| C8 탭 3 추가금 케어 + 토글 | 2시간 |
| C9 저장공유 모달 + 토스트 | 1시간 |
| C10 검증 + 빌드 | 30분 |
| **합계** | **~14시간** |

multi-session 작업이 가능하도록 각 commit이 독립적으로 동작하게 설계됨.
