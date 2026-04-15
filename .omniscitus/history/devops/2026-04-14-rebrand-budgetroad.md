# 버젯로드 리브랜딩 및 도메인 변경

## Summary
서비스명을 "웨딩버젯"에서 "버젯로드"로 변경하고 Vercel 도메인 이전. 이후 표기를 "버짓로드"로 교정하여 전체 SEO/UI 반영.

## Context
- **Background**: 서비스 정체성 강화를 위해 프로젝트명/도메인 리브랜딩 결정
- **Requirements**: 코드 내 모든 서비스명, URL, SEO 관련 설정 일괄 변경
- **Decisions**: Vercel Dashboard에서 프로젝트명 변경 + 도메인 편집 (기존 도메인 → 신규 도메인 리다이렉트); CLAUDE.md 제목도 동시 변경
- **Constraints**: GitHub 저장소 이름(wedding-budget)은 유지 (별도 작업)

## Timeline

### 2026-04-14
**Focus**: 리브랜딩 전체 수행 — 이름 + 도메인 + 코드 + 배포
- Vercel Dashboard에서 프로젝트명 wedding-budget → budgetroad 변경
- Vercel Domains에서 budgetroad.vercel.app 추가 + 기존 도메인 리다이렉트 설정
- 코드 내 "웨딩버젯" → "버젯로드" 일괄 변경 (layout.tsx, page.tsx, opengraph-image.tsx)
- sitemap.ts, robots.txt URL을 budgetroad.vercel.app으로 변경
- metadataBase fallback URL 업데이트
- CLAUDE.md 프로젝트 제목 변경
- PR #8 → main 머지 → Vercel 배포 완료

**Learned**: Vercel에서 프로젝트 이름을 바꿔도 기존 .vercel.app 도메인은 자동 변경되지 않음 — Domains 설정에서 수동으로 변경 필요

### 2026-04-15
**Focus**: 서비스명 표기 "버젯로드" → "버짓로드" 일괄 변경
- layout.tsx siteTitle, template, siteName 변경 (3곳)
- opengraph-image.tsx alt 텍스트 + 렌더링 텍스트 변경 (2곳)
- budget-draft/page.tsx 헤더 로고 텍스트 변경
- budget-draft/layout.tsx openGraph title 변경
- CLAUDE.md 프로젝트 제목 변경
- main 푸시 → Vercel 자동 배포

**Learned**: none

## Pending
- [x] GitHub 저장소 이름 wedding-budget → budgetroad 변경 완료 ✔️ 2026-04-15
  — 모든 작업 완료. unit closed.

## Notes
- PR: https://github.com/mch9/wedding-budget/pull/8
- 기존 도메인 wedding-budget-chi.vercel.app → budgetroad.vercel.app 리다이렉트 설정됨
