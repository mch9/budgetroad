# Design Guide

버짓로드 디자인의 진입점. **진실의 원천은 코드**이며, 이 문서는 어디서 무엇을 찾는지 알려주는 지도.

## 진실의 원천

| 대상 | 위치 |
|------|------|
| 컬러·라디우스·다크모드 토큰 | `src/app/globals.css` (`@theme`, `:root`) |
| 타이포그래피 스케일 | `src/app/globals.css` (`@theme`의 `--text-*`) |
| UI 컴포넌트 | `src/components/ui/` (shadcn `base-nova` 스타일) |
| 브랜드 에셋 (로고/파비콘) | `public/brand/`, `src/app/icon.tsx`, `src/app/opengraph-image.tsx` |

## 기반 시스템

**shadcn `base-nova`** — Anthropic 후원 공개 레지스트리. Claude 디자인 언어 기반.
- 설정: `components.json` (`"style": "base-nova"`)
- 프리미티브: `@base-ui/react`
- 공식 문서: https://ui.shadcn.com

## 브랜드 커스터마이징

시스템은 base-nova를 따르되, 다음은 버짓로드 고유값:
- **Primary**: `#FF8400` (OKLCH `0.7 0.16 60`)
- **폰트**: Geist (본문), Geist Mono (금액 숫자)
- **서비스명 표기**: "버짓로드"

## 팀 디자인

팀원 Figma 시안: https://www.figma.com/design/ln357t0WYrrMCjyQ9ncQ0N/UI-Design

코드와 Figma가 어긋날 땐 **코드가 우선**이며, Figma 업데이트 필요 시 팀에 공유.

## UI 작업 플로우

1. **새 컴포넌트 필요**: `bunx shadcn@latest add {component}` → `src/components/ui/`에 base-nova 버전 설치
2. **토큰 수정**: `globals.css`의 `:root`(라이트) / `.dark`(다크) 값 변경. 토큰명은 유지.
3. **페이지 작업**: 하드코딩 hex 대신 토큰 클래스 사용 (`bg-muted`, `text-foreground`, `border-border` 등)
4. **디자인 검증**: `/design-system` 쇼케이스 페이지(추후 구축 예정)에서 전체 컴포넌트 점검

## 과거 이력

`.pen` 파일 기반 워크플로우는 2026-04-20에 폐지. 사유: 진실의 원천 분산(.pen/Figma/코드 3곳) → 드리프트 리스크 + 팀 공유 불가. 관련 history unit: `design-directory-setup`.
