# 웨딩버젯 (wedding-budget)

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
- **Database**: SQLite (로컬) / Neon Postgres (배포) + Prisma
- **Auth**: 프로젝트 진행 중 선택
- **Deployment**: Vercel

## 프로젝트 구조
```
wedding-budget/
├── src/
│   ├── app/          # Next.js App Router
│   ├── components/   # UI 컴포넌트
│   ├── lib/          # 유틸리티
│   └── ...
├── prisma/           # DB 스키마
├── public/           # 정적 파일
└── ...
```

## 코딩 컨벤션
- /4-critical-ground-rule-setup 에서 상세 설정 예정

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

## 제외 범위 (이번에는 안 만듦)
- 예산 항목별 금액 직접 수정/관리 기능 (이후 버전)
- 양방향 전환: 예산 → 유형 추천 (이후 버전)
- 사용자 커스텀 항목 추가 기능 (이후 버전)
- 실시간 시세 연동
- 업체 추천/연결

## 다음 단계
- `/2-directory-structure-setup` 으로 프로젝트 폴더 구조를 생성하세요
