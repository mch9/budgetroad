# 프로젝트 스캐폴딩 및 초기 설정

## Summary
wedding-budget 프로젝트의 Next.js + TypeScript + Tailwind + shadcn/ui + Prisma 기반 초기 구조를 생성하고, 독립 git repo로 초기화한 세션.

## Context
- **Background**: `/1-claude-md-setup`에서 CLAUDE.md를 작성한 뒤, `/2-directory-structure-setup`으로 실제 프로젝트 폴더 구조를 생성하는 단계
- **Requirements**: 검증된 helper/ 템플릿(bun.lock, package.json)을 사용하여 의존성 호환성 보장, shadcn/ui 초기화, Prisma SQLite 로컬 개발 환경 구성
- **Decisions**: create-next-app 실행 후 검증된 bun.lock/package.json으로 덮어쓰는 방식 채택 (최신 버전 호환성 이슈 방지)
- **Constraints**: claude-starter의 helper/ 디렉토리에 .gitignore가 없어 create-next-app이 생성한 것을 그대로 사용

## Timeline

### 2026-04-11
**Focus**: Next.js 프로젝트 생성 + shadcn/ui 초기화 + git repo 초기화
- create-next-app으로 Next.js 16.1.7 + TypeScript + Tailwind v4 프로젝트 생성
- 검증된 helper/bun.lock, package.json으로 의존성 고정 (Prisma 6, shadcn 4 포함)
- 추가 폴더 구조 생성: components/ui, components/layout, components/common, hooks, types
- prisma/schema.prisma 생성 (SQLite 로컬 개발용)
- shadcn/ui 초기화 (Button 컴포넌트 + utils.ts 생성)
- omniscitus 플러그인 설치 확인 완료
- 독립 git repo 초기화 및 초기 커밋
- CLAUDE.md 프로젝트 구조 섹션 업데이트
- dev 서버 정상 동작 확인 (localhost:3000 → HTTP 200)
- `/3-mcp-setup` 시작했으나 Step 0 진행 중 세션 종료

**Learned**: create-next-app이 자동으로 git init을 실행하므로, 독립 repo 초기화 시 기존 .git을 제거 후 재초기화 필요

## Pending
- [ ] `/3-mcp-setup` 완료 (Playwright, Slack, Pencil MCP 연결)
- [x] `/4-critical-ground-rule-setup` 진행 — ESLint+Prettier 설정, CLAUDE.md 협업규칙 추가 완료
- [x] CLAUDE.md 코딩 컨벤션 섹션 구체화

## Notes
- starter 경로: `/Users/mch/Documents/GitHub/claude-starter`
- 검증된 의존성을 starter helper/에 백업 완료 (다음 프로젝트 재사용 가능)
