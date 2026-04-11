# 예산 초안 생성 기능 프론트엔드 구현

## Summary
budget-draft MVP 기능을 순수 프론트엔드로 구현. 랜딩 페이지, 입력 UI(지역/항목/세부조건), 예산 계산 로직, 결과 UI(테이블+도넛 차트), 반응형 대응, SEO/Analytics 세팅까지 완료.

## Context
- **Background**: PRD 12단계 완료 후 실제 동작하는 앱 구현 단계
- **Requirements**: 정적 통계 데이터 기반 예산 산출, 데스크톱+모바일 반응형, SEO 메타태그, GA/Vercel Analytics
- **Decisions**: DB/API 없이 클라이언트 사이드만으로 구현; conic-gradient로 도넛 차트 구현 (차트 라이브러리 미사용); shadcn 테마 primary를 #FF8400으로 변경
- **Constraints**: 통계 데이터는 정적(듀오 2025 기준); GA ID는 미입력 상태(환경변수로 나중에 추가)

## Timeline

### 2026-04-11
**Focus**: MVP 전체 프론트엔드 구현 + Growth Setup
- 코딩 컨벤션 설정 (ESLint + Prettier, eslint-config-prettier 연동)
- Claude 협업 규칙 / 프로젝트 운영 규칙 CLAUDE.md에 추가
- 통계 데이터 정의 (`src/lib/budget-data.ts` — 3개 지역 × 10개 항목)
- 랜딩 페이지 구현 (`/` — 헤드카피 + CTA)
- 예산 생성 페이지 구현 (`/budget-draft` — 입력↔결과 상태 전환)
- CSS conic-gradient 도넛 차트 구현
- SEO 메타태그, robots.txt, sitemap.ts 생성
- Vercel Analytics + Speed Insights 설치

**Learned**: conic-gradient + CSS mask로 도넛 차트를 구현하면 차트 라이브러리 없이 번들 사이즈를 줄일 수 있음

### 2026-04-11 (2)
**Focus**: 도넛 차트 계산 로직 lint 에러 수정
- `cumulativeDeg` let 재할당 → `reduce`로 리팩터링 (react-hooks/immutability 규칙 위반 해결)

**Learned**: React 렌더 중 let 변수 재할당은 react-hooks/immutability lint 규칙에 걸림. reduce로 누적 계산하면 순수하게 처리 가능

## Pending
- [x] GitHub CI/CD 설정 (`/8-github-ci-cd-setup`)
- [x] Vercel 배포 (`/9-deploy`)
- [ ] GA 측정 ID 환경변수 설정 (`.env.local`에 `NEXT_PUBLIC_GA_ID`)
- [ ] OG 이미지 제작 및 추가

## Notes
- 빌드 성공 확인 완료 (모든 페이지 Static 생성)
- dev 서버: http://localhost:3000
