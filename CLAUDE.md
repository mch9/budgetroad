# 버짓로드 (budgetroad)

## 프로젝트 개요
결혼 준비 중인 사용자가 결혼 유형과 조건을 선택하면, 통계 기반 평균값으로 예산 초안을 자동 생성해주는 웹앱.
사용자는 결혼 유형과 예산을 상호 전환하지 못하는 문제를 해결하여, "구상 상태"에서 "초안 작성 시작 상태"로의 전이를 돕는다.

## 대상 사용자
- 결혼을 준비하는 예비 부부
- 결혼 형태는 생각했지만 전체 예산 감을 잡지 못하는 사람
- 예산을 직접 정리하려다 중단하거나 외부 템플릿에 의존하는 사람

## 핵심 기능
1. **결혼 유형 선택**: 기본 항목(식장, 스드메, 혼수, 예물 등) 제공 + 사용자 직접 정의 가능
2. **예산 초안 자동 생성**: 선택한 유형에 맞는 통계 기반 평균값으로 항목별 예산 자동 구성
3. **결과 시각화**: 항목별 금액 테이블 + 비율 차트로 결과 확인
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
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase PostgreSQL (dev/prod 공통) + Prisma — `is_dev` 플래그로 환경 구분
- **Auth**: 프로젝트 진행 중 선택
- **Deployment**: Vercel

## 프로젝트 구조
```
wedding-budget/
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
- `/budget-draft` — 예산 생성 페이지 (입력 → 결과, 한 페이지 상태 전환)

## 데이터 구조 (통계 기반)
- 지역: 서울 / 경기 / 지방
- 항목: 식장, 스드메, 혼수, 예물, 예단, 신혼여행, 한복, 폐백음식, 청첩장, 답례품
- 세부 조건: 식장(호텔/웨딩홀/스몰웨딩/야외), 신혼여행(국내/동남아/유럽/기타)
- 통계 데이터: 정적 데이터로 관리 (실시간 시세 연동 제외)

## 데이터 수집
- 이벤트: GA4 + Vercel Analytics 운영 중. Supabase 자체 수집(events 테이블)은 구축 진행 중 — 세부는 `.omniscitus/history/devops/2026-04-24-supabase-migration.md`
- 스키마 결정 근거: `docs/prd/analytics/event-schema-options.md` (옵션 A — 플랫 JSON 단일 테이블)

## 디자인 시스템
- 컬러: Primary Accent `#AAC7E1` (선택 상태), Action `#373737` (CTA·헤드라인), Background `#F9FAFB` — 상세는 `src/app/globals.css`
- 폰트: Pretendard Variable (본문·금액 공통, `src/app/fonts/PretendardVariable.woff2`). 금액은 `tabular-nums`로 자릿수 정렬.
- 상세 PRD: `docs/prd/budget-builder/budget-draft-v0.md`
- **기반**: shadcn `base-nova` (Claude Design). 토큰 = `src/app/globals.css`, 컴포넌트 = `src/components/ui/`
- **UI 작업 시** → `design/README.md` 참조 (진입점 + 워크플로우)

## 제외 범위 (이번에는 안 만듦)
- 예산 항목별 금액 직접 수정/관리 기능 (이후 버전)
- 양방향 전환: 예산 → 유형 추천 (이후 버전)
- 사용자 커스텀 항목 추가 기능 (이후 버전)
- 실시간 시세 연동
- 업체 추천/연결

## 다음 단계
- `/6-prototype` 으로 프로토타입을 만드세요
