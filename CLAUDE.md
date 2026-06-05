# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# 버짓로드 (budgetroad)

## 명령어
- `npm run dev` — 개발 서버 (http://localhost:3000)
- `npm run build` — `prisma generate` 후 `next build` (빌드 전 Prisma 클라이언트 생성 필수)
- `npm run lint` — ESLint (Next core-web-vitals + TS + Prettier)
- `npm run db -- <args>` — `.env.local` 로드 후 Prisma CLI 실행 (예: `npm run db -- migrate dev`, `npm run db -- studio`)
- `npm run build:pricing` — `가격 정보 DB.csv` → `src/lib/budget-engine/data/*.ts` 재생성 (아래 "데이터 파이프라인" 참조)
- 테스트 러너 없음 — 검증은 `npm run lint` + `npm run build`로 한다.

> ⚠️ Next.js 16 / React 19 사용. `AGENTS.md`가 경고하듯 학습 데이터의 Next.js와 API·관례가 다를 수 있으니, 불확실하면 `node_modules/next/dist/docs/`의 가이드를 먼저 읽을 것.

## 프로젝트 개요
결혼 준비 중인 사용자가 온보딩 질문(가치관 + 예산·하객수·지역 등 실측 입력)에 답하면, 페르소나 분류와 통계 기반 값으로 예산 초안을 자동 생성해주는 웹앱.
사용자가 결혼 유형과 예산을 상호 전환하지 못하는 문제를 해결하여, "구상 상태"에서 "초안 작성 시작 상태"로의 전이를 돕는다.

## 대상 사용자
- 결혼을 준비하는 예비 부부
- 결혼 형태는 생각했지만 전체 예산 감을 잡지 못하는 사람
- 예산을 직접 정리하려다 중단하거나 외부 템플릿에 의존하는 사람

## 핵심 기능
1. **온보딩 질문**: 가치관 질문(선택지별 2축 점수)과 실측 입력(예산·하객수·지역 등)을 단계별로 수집 — `src/lib/onboarding-v6.ts`
2. **페르소나 분류 + 예산 초안 자동 생성**: 답변 2축 점수로 페르소나를 분류하고, 실측 입력 + 통계 기반 값으로 항목별 예산 초안 구성 — `src/lib/budget-engine/`
3. **결과 시각화**: 항목별 금액 테이블 + 비율 차트로 결과 확인 — `src/components/result/`
4. **링크 공유**: 로그인 없이 고유 URL로 결과 공유
5. **계정 저장**: 로그인 후 마이페이지에서 저장 목록 관리

## 핵심 퍼널
```
Entered → Input Started → Result Viewed → Intent Created (Save/Share) → Revisited
```

## 핵심 KPI
- P(Input In Progress | Entered): 진입 후 첫 Action 발생률
- P(Result Viewed | Input In Progress): 입력 시작 → 결과 확인 전이율
- P(Intent Created | Result Viewed): 결과 저장/공유율
- P(Revisited | Intent Created): 재방문율

## 기술 스택
- **Framework**: Next.js 16.1.7 (App Router) + React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase PostgreSQL (dev/prod 공통) + Prisma — `is_dev` 플래그로 환경 구분
- **Auth**: 프로젝트 진행 중 선택
- **Deployment**: Vercel

## 프로젝트 구조
```
budgetroad/
├── src/
│   ├── app/              # Next.js App Router (페이지 + 레이아웃)
│   │   ├── api/          # API 라우트
│   │   ├── layout.tsx    # 루트 레이아웃
│   │   ├── page.tsx      # 메인 페이지
│   │   └── globals.css   # 글로벌 스타일
│   ├── components/       # UI 컴포넌트
│   │   ├── ui/           # shadcn/ui 기본 컴포넌트
│   │   ├── layout/       # 레이아웃 컴포넌트
│   │   └── common/       # 공통 컴포넌트
│   ├── hooks/            # 커스텀 React 훅
│   ├── lib/              # 유틸리티 (utils.ts 등)
│   └── types/            # TypeScript 타입 정의
├── design/               # 디자인 가이드 (README만, 토큰/컴포넌트 진실의 원천은 코드)
├── prisma/               # Prisma 스키마 + migrations (Supabase PostgreSQL)
├── public/               # 정적 파일 (이미지, 아이콘)
└── ...
```

## 코딩 컨벤션
- ESLint: `eslint.config.mjs` (Next.js 기본 + TypeScript + Prettier 연동)
- Prettier: `.prettierrc` (세미콜론, 싱글쿼트, 2칸 들여쓰기, trailing comma)

## Claude 협업 규칙

### 응답 언어
- 설명/대화는 한국어, 코드/커밋 메시지/변수명은 영어

### 코드 스타일
- 간결하게: 필요한 코드만 작성, 주석 최소화
- 자명한 코드에 불필요한 주석 달지 않기

### 작업 방식
- 기능 하나씩 작은 단위로 만들고 확인하면서 진행
- 작업 전 계획을 먼저 공유하고 확인 후 진행
- 파일 수정 전 반드시 해당 파일을 먼저 읽을 것
- 한 번에 너무 많은 파일을 수정하지 말 것

## 프로젝트 운영 규칙

### Git 브랜치 전략
- `main`: 배포되는 브랜치 (직접 푸시 금지)
- `develop`: 개발 브랜치
- `feature/{기능명}`: 기능 개발 브랜치
- `fix/{버그명}`: 버그 수정 브랜치

### 커밋 메시지 규칙
- feat: 새 기능
- fix: 버그 수정
- docs: 문서 수정
- style: 코드 스타일 변경
- refactor: 리팩토링

### 배포 정책
- develop → main PR 후 Vercel 자동 배포

## 작업 원칙 (필수)

### 재사용성 최우선
- 문서/코드 모두 재사용성을 최우선으로 한다
- 상위 문서에 정의된 내용을 하위 문서에서 반복하지 않고 레퍼런스만 건다
- 문서/코드를 늘리고 확장하는 것에 극히 보수적으로 접근한다

### 임시 스크립트 관리
- 작업 수행 중 필요한 스크립트는 `.claude/temp/scripts/`에 생성한다
- 재사용성이 없는 1회성 스크립트는 작업 완료 후 반드시 삭제한다

### 디버깅 원칙
- 오류 수정 시 반드시 가설을 하나 세우고, print/console.log로 해당 가설만 검증한다
- 가설이 맞으면 수정, 틀리면 다음 가설로 넘어간다
- 한 번에 여러 가설을 동시에 테스트하지 않는다 (1가설 1검증)

## 화면 및 URL 구조
- `/` — 랜딩 페이지 (서비스 소개 + CTA)
- `/budget-draft` — 온보딩 → 결과 (한 페이지 상태 전환): 온보딩 질문(`src/components/onboarding/`) → 로딩 → 결과(`src/components/result/`)
- `/design-system` — 디자인 시스템 프리뷰 (개발용)

## 데이터 구조 (통계 기반)
- 온보딩 입력 매핑/페르소나 분류 로직: `src/lib/onboarding-v6.ts` (예산·하객수·지역 매핑, 2축 점수 → 페르소나)
- 예산 산출 엔진·통계 데이터: `src/lib/budget-engine/` (`data/`, `stages/`)
- 지역: 서울 / 수도권 / 광역시 / 지방
- 항목: 식장, 스드메, 혼수, 예물, 예단, 신혼여행, 한복, 폐백음식, 청첩장, 답례품
- 통계 데이터: 정적 데이터로 관리 (실시간 시세 연동 제외)

## 예산 엔진 아키텍처 (`src/lib/budget-engine/`)
진입점은 `index.ts`의 `diagnose(answers, toggles?)` — **결정론적 순수 함수**(같은 입력 → 같은 결과). 단계별 stage 함수를 순서대로 체이닝한다:
1. `scoreAxis` → `classifyPersona` (`onboarding-v6.ts`): 답변 2축 점수 → 페르소나 분류
2. `stage3-variables` `setupVars`: 페르소나·응답 → 변수 + 유형별 토글 디폴트(`toggleDefaults`)
3. `stage4-venue` `recommendVenue`: 식장 유형 추천
4. `stage5-budget` `calculateBudget`: 변수 + 활성 토글 + 식장 유형 → 항목별 예산
5. `stage6-consistency` `diagnoseConsistency`: 예산 정합성 진단
6. `stage7-advice` `buildAdvice`: 진단 기반 조언 생성

반환값 `ResultPayload = { vars, venue, budget, consistency, advice }` (타입은 `types.ts`). 정적 입력 데이터는 `data/`(`category-base`, `region-profiles`, `toggle-prices`, `toggles-meta`, `type-config`, `venue-profiles`). **stage 로직이나 데이터를 수정하면 `diagnose`의 결정론적 출력이 바뀌므로 전체 파이프라인 영향을 고려할 것.**

## 데이터 파이프라인 (가격 데이터)
`가격 정보 DB.csv`(진실의 원천) → `npm run build:pricing`(`scripts/build-pricing.mjs`) → `src/lib/budget-engine/data/*.ts` 자동 생성.
- ⚠️ 생성된 `data/*.ts`를 **직접 손으로 수정하지 말 것** — CSV 갱신 후 재생성하면 덮어쓰여진다. 가격을 바꾸려면 CSV를 고치고 `build:pricing`을 다시 돌린 뒤 생성된 파일을 커밋한다.
- 스크립트 내부에 지역 매핑(`REGION_MAP`), 시즌(peak/off-peak), 신뢰도 낮은 항목 하드코딩(`HARDCODE_PRICES`), 토글↔CSV 매핑(`TOGGLE_CSV_MAP`)이 정의돼 있다.

## 이벤트 수집 (Prisma/Supabase)
- 단일 `Event` 모델(`prisma/schema.prisma`, `events` 테이블): 플랫 JSON `properties` + `is_dev` 플래그로 dev/prod 구분. API는 `src/app/api/events/route.ts`, 클라이언트 식별은 `src/lib/visitor.ts`·`session.ts`.

## 데이터 수집
- 이벤트: GA4 + Vercel Analytics 운영 중. Supabase 자체 수집(events 테이블)은 구축 진행 중 — 세부는 `.omniscitus/history/devops/2026-04-24-supabase-migration.md`
- 스키마 결정 근거: `docs/prd/analytics/event-schema-options.md` (옵션 A — 플랫 JSON 단일 테이블)

## 디자인 시스템
- 컬러(브랜드): Primary Accent `#AAC7E1` (선택 상태), Action `#373737` (CTA·헤드라인), Background `#F9FAFB`. ⚠️ 이 브랜드 컬러들은 토큰이 아니라 컴포넌트에 Tailwind arbitrary value(`bg-[#373737]` 등)로 직접 지정돼 있음. `globals.css`의 `--primary`(#FF8400 등)는 base-nova 기본 토큰으로 브랜드 컬러와 무관.
- 폰트: Pretendard Variable (본문·금액 공통, `src/app/fonts/PretendardVariable.woff2`). 금액은 `tabular-nums`로 자릿수 정렬.
- 상세 PRD: `docs/prd/budget-builder/budget-draft-v0.md`
- **기반**: shadcn `base-nova` (Claude Design). 토큰 = `src/app/globals.css`, 컴포넌트 = `src/components/ui/`
- **UI 작업 시** → `design/README.md` 참조 (진입점 + 워크플로우)

## 코드 아키텍처 컨벤션

### 1. 컴포넌트 분리 기준
- 한 컴포넌트는 **UI 렌더링 / 상태 관리 / 계측(트래킹)** 중 하나만 담당한다.
- 200줄을 넘으면 책임 분리 가능한지 검토한다.
- 기준 사례:
  - `result-view.tsx` 445줄 — UI + 공유/PDF 액션 + 스크롤·탭 계측 혼재 → 계측 로직은 `useResultTracking()` 훅으로 분리 대상
  - `ChecklistGroup.tsx` 297줄 — 아코디언 + DnD 정렬 + 편집 모드 혼재 → 편집 모드는 `checklist-edit-mode.tsx`로 분리 대상
- 예외: 순수 데이터 파일(`checklist-data.ts` 335줄)은 책임이 단일하면 줄 수 기준 적용 안 함.

### 2. 레이어 규칙 — 계산 vs 표시
- **계산은 `budget-engine`에서, 뷰는 `ResultPayload`만 읽는다.**
- `components/`·`hooks/`에서 `TOGGLE_PRICES`, `TOGGLES_META`, `CATEGORY_BASE` 등 원시 엔진 데이터 테이블을 직접 읽는 것을 금지한다.
- 금지 패턴: `tab-itemized.tsx:enabledToggleLines`와 `useBudgetTrackingState.ts:buildItems` 모두 `TOGGLE_PRICES[id][region][season]`을 직접 순회 — `ResultPayload.budget`에 이미 계산된 결과가 있다.
- 뷰에서 추가 계산이 필요하면 `ResultPayload`에 필드를 보강하거나 `budget-engine/index.ts`에 헬퍼를 추가한다.

### 3. 체크리스트 3-레이어 규칙

| 레이어 | 소스 | 소유자 | 허용 | 금지 |
|---|---|---|---|---|
| 정적 | `CHECKLIST_GROUPS` | `checklist-data.ts` | 읽기 전용. `ChecklistTab`에서만 import | 수정·런타임 변경 |
| 토글 | `TOGGLE_CHECKLIST_MAP` | `useChecklistState` | hook 내부에서만 소비. highlight/inject 타입 구분 유지 | 컴포넌트가 직접 참조 |
| 사용자 | `userItems` state | `useChecklistState` | `ChecklistGroup`에 props로 전달 | hook 외부에서 직접 변경 |

- `ChecklistGroup.tsx`는 세 레이어를 props로만 받는다. hook을 직접 호출하지 않는다.

### 4. 스토리지 키 규칙
- localStorage/sessionStorage 키는 `src/lib/storage-keys.ts`의 `STORAGE_KEYS`를 통해서만 접근한다.
- 파일에 `'budgetroad_*'` 문자열 리터럴 직접 작성 금지.
- **키 문자열 값은 절대 변경 금지** — 변경 시 기존 사용자의 로컬 데이터 유실.
- 새 키 추가 시 `STORAGE_KEYS`에만 추가한 뒤 import해서 사용한다.

### 5. 중복 로직 금지
- 같은 매핑·변환이 2곳 이상에 나타나면 `src/lib/`의 순수 함수 하나로 추출하고 공유한다.
- 선례: `filterCategoryToLabel()` — 3항 연산 중복을 제거하고 단일 구현으로 추출.
- 예외: 우연히 비슷한 코드이고 독립적으로 변경될 가능성이 있으면 추출하지 않는다.

### 6. Prisma 데이터 접근
- Prisma 클라이언트는 `src/lib/db.ts`에서만 생성한다 (싱글톤 패턴, hot-reload 안전).
- 현재 규모에서는 쿼리를 `src/app/api/**/route.ts`에 직접 작성한다. 쿼리 복잡도가 커지면 service 레이어 도입을 재검토한다.
- `globalThis as unknown as { prisma: ... }` 캐스팅은 Next.js 핫리로드 관용 패턴이므로 유지한다.

### 7. UI · 스타일 규칙
**컴포넌트**: shadcn/ui 컴포넌트는 `src/components/ui/`에만 위치. 기존 컴포넌트를 먼저 재사용한다.

**컬러**: 브랜드 3색은 arbitrary value로 직접 지정한다.
- `bg-[#AAC7E1]` — 선택 상태
- `bg-[#373737]` — CTA·헤드라인
- `bg-[#F9FAFB]` — 배경

`globals.css`의 `--primary` 등 base-nova 토큰은 shadcn 컴포넌트 내부 전용이며 브랜드 컬러와 무관. 새 컬러 추가 금지.

**뷰포트**: `min-h-dvh` 사용. `min-h-screen` 신규 작성 금지.

**dnd-kit**: `ChecklistGroup.tsx` 단독 사용. `PointerSensor(distance:8)` + `verticalListSortingStrategy` + `closestCenter`를 표준으로 유지.

**파일/폴더 네이밍**:
- 컴포넌트: kebab-case `.tsx` (예: `result-view.tsx`, `checklist-group.tsx`)
- 훅: `useXxx.ts` camelCase (예: `useChecklistState.ts`)
- 유틸: kebab-case `.ts` (예: `storage-keys.ts`)
- App Router 파일: Next.js 규약 그대로 (`page.tsx`, `layout.tsx`)
- **새 파일은 반드시 kebab-case로 생성한다.** §1에서 분리로 새로 만드는 컴포넌트도 포함 (예: `checklist-edit-mode.tsx`, `use-result-tracking.ts`).
- ⚠️ 기존 PascalCase 파일(`ChecklistGroup.tsx` 등)의 리네임은 독립 커밋으로 분리한다.

**export**: `page.tsx`·`layout.tsx`는 `export default`, 나머지는 `export function` (named).

### 8. Next 16 'use client' 직렬화 규칙
- `[71007]`("Props have function types") 경고는 **서버→클라 경계에서만 실제 오류**다.
- **무시**: 부모·자식 모두 `'use client'`인 경우 — 직렬화 불필요. 현재 발생하는 모든 [71007]이 이에 해당.
- **수정 필요**: 부모가 진짜 Server Component인데 함수 prop을 넘길 때 → Server Action으로 처리.
- `'use server'` 파일: 현재 0개. Server Action이 필요한 경우에만 추가한다.

### 9. 분석·트래킹 이벤트
- **리팩토링 중 절대 제거 금지**: `trackEvent()`, `sendEvent()` 호출은 코드 정리 대상이 아니다.
- 위치: `src/lib/gtag.ts` (GA4), `@vercel/analytics` 직접 호출, `src/app/api/events/route.ts` (Supabase 수집).
- 계측 로직을 훅으로 추출할 때 이벤트 호출은 빠짐없이 함께 이동시킨다.

## 제외 범위 (이번에는 안 만듦)
- 예산 항목별 금액 직접 수정/관리 기능 (이후 버전)
- 양방향 전환: 예산 → 유형 추천 (이후 버전)
- 사용자 커스텀 항목 추가 기능 (이후 버전)
- 실시간 시세 연동
- 업체 추천/연결

## 현재 진행 상황
- 온보딩 v6 (페르소나 분류 기반) 흐름 구현·다듬는 단계
- 작업 맥락·의사결정 이력: `.omniscitus/history/`
- 상세 PRD: `docs/prd/budget-builder/budget-draft-v0.md`
