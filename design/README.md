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
- **서비스명 표기**: "버짓로드"

타이포그래피는 아래 별도 섹션 참조.

## 타이포그래피

### 스케일

모바일 → 데스크탑 자동 반응형 (`clamp()`). Tailwind 유틸리티는 `text-display` / `text-h1` / `text-h2` / `text-h3` / `text-body` / `text-caption` — **토큰 클래스 우선 사용**. 하드코딩 `text-[32px]`는 지양.

| 토큰 | 모바일 | 데스크탑 | 용도 |
|------|--------|----------|------|
| `text-display` | 40px | 65px | 결과 페이지 총 예산 금액 (hero 숫자) |
| `text-h1` | 28px | 48px | 랜딩 메인 타이틀 |
| `text-h2` | 22px | 36px | 섹션 타이틀 (예: "항목별 예산") |
| `text-h3` | 18px | 30px | 입력 스텝 제목 (예: "결혼 지역은?") |
| `text-body` | 16px | 16px | 본문 |
| `text-caption` | 13px | 14px | STEP 번호·설명·보조 라벨 |

정의 위치: `src/app/globals.css` (`@theme` 내 `--text-*`, `clamp()` 적용).

### 결정 근거

- **웹 기준값**: PM 부트캠프에서 공유된 업계 표준 (h1 48 / h2 36 / h3 30 / body 16 / caption 14) 적용.
- **모바일 값**: 결혼 예산 앱이 **모바일 우선**이라는 점을 반영해 강사 권고 범위(h1 24~28, h2 18~22, h3 16~18)의 상단값으로 설정. 작아지는 화면에서도 가독성 확보.
- **`text-display`**: 강사 권고표에 없는 별도 토큰. 결과 페이지의 **총 예산 금액을 hero 숫자**로 강조하기 위해 h1보다 크게 유지 (40/65px).
- **`text-body` 16px**: 웹/앱 공통 고정 — 가독성 표준.
- **반응형 처리**: `clamp()` 단일 토큰으로 통합. breakpoint별 클래스(`text-[28px] sm:text-[48px]`) 병기 불필요, 뷰포트 중간 구간도 부드럽게 보간.

### 사용 가이드

```tsx
// ✅ 권장
<h1 className="text-h1 font-bold">지역은 어디인가요?</h1>
<p className="text-body">예산 초안을 자동으로 생성합니다.</p>

// ❌ 지양
<h1 className="text-[28px] sm:text-[48px] font-bold">…</h1>
```

**예외 허용**: 토큰에 흡수되지 않는 1회성 디자인 인자 사이즈(예: 결과 페이지 부제목 `text-[25.6px]`)는 하드코딩 OK. 남용 금지.

### 폰트 패밀리

- **본문·금액 공통**: Pretendard Variable (`src/app/fonts/PretendardVariable.woff2`)
- **금액 숫자**: `tabular-nums` 클래스로 자릿수 정렬 (`.gitignore`·`src/app/layout.tsx` 참조)

### 적용 범위 (2026-04-24 도입)

토큰 값만 갱신. 기존 하드코딩된 사이즈(`src/app/page.tsx`, `src/app/budget-draft/page.tsx`)는 회귀 리스크 최소화를 위해 유지. **앞으로 작성되는 코드부터 토큰 클래스 사용** 원칙.

## 팀 디자인

팀원 Figma 시안: https://www.figma.com/design/ln357t0WYrrMCjyQ9ncQ0N/UI-Design

코드와 Figma가 어긋날 땐 **코드가 우선**이며, Figma 업데이트 필요 시 팀에 공유.

## 작업 워크플로우 (5단계 파이프라인)

UI/디자인 작업은 다음 5단계로 진행한다. 각 단계의 매체·참여자·산출물이 구분되며 역할을 섞지 않는다.

| # | 단계 | 매체 | 참여자 | 산출물 |
|---|------|------|--------|--------|
| 1 | **컨셉·구조** | Figma | 팀 전원 | 스케치·프레임, 공감대 |
| 2 | **시스템 구체화** | Claude Design | 솔로 | 토큰·컴포넌트 spec, zip export |
| 3 | **와이어프레임** | Pencil + Claude Code (MCP) | 솔로 | `.pen` 캔버스 |
| 4 | **코드 구현** | Claude Code | 솔로 | PR, 커밋 |
| 5 | **QA/리뷰** | Vercel Preview URL | 팀 전원 | GitHub PR 코멘트 |

### 피드백 루프 (뒤→앞만 허용)

- `5 → 3`: QA에서 구조 문제 발견 → 와이어프레임 재작업
- `5 → 2`: 토큰/spec 어긋남 발견 → 시스템 보완
- `4 → 3`: 구현하다 레이아웃 제약 발견 → 와이어프레임 수정
- `1 → 2`: 큰 결정 변경 → 시스템 재정리

**금지**: `5 → 1` 점프 — 팀 우회해서 혼자 구조 결정. 이게 드리프트 원인.

### 매체 선택 원리

**결정 비용 × 매체 비용 매칭**. 큰 결정(컨셉)은 Figma에서 30초에 뒤집고, 작은 결정(코드)은 30분 걸리지만 정확함. 뒤로 갈수록 결정이 작아지고 매체 정확도가 커져 낭비 최소화.

### 유연 적용 (단계 생략)

5단계는 **큰 기능/새 화면 기준 full 파이프라인**이며, 변경 규모에 따라 생략 가능하다.

| 변경 규모 | 권장 경로 |
|---|---|
| 작은 스타일·copy 수정 | Stage 4 (코드) 바로 |
| 단일 컴포넌트 변경 | Stage 3~4 |
| 브랜드·토큰 변경 | Stage 2 → 4 |
| 큰 새 기능·화면 | Stage 1~5 전체 |

판단 기준: **"팀 공감대가 필요한가? 시각 구조 검증이 필요한가?"** 둘 다 NO면 상위 단계 스킵 OK.

### 팀 공유 원칙

`.pen` 파일은 **솔로 워크숍 노트** 역할이며 팀 공유 대상 아님 (Pencil 설치 필수 + Mac/Linux 전용). 팀 리뷰는 반드시 Stage 5 (Vercel Preview URL) 경유. 스냅샷이 필요하면 Pencil MCP의 `get_screenshot` → PNG → PR 설명에 첨부.

## UI 작업 플로우 (Stage 4 실무 팁)

1. **새 컴포넌트 필요**: `bunx shadcn@latest add {component}` → `src/components/ui/`에 base-nova 버전 설치
2. **토큰 수정**: `globals.css`의 `:root`(라이트) / `.dark`(다크) 값 변경. 토큰명은 유지.
3. **페이지 작업**: 하드코딩 hex 대신 토큰 클래스 사용 (`bg-muted`, `text-foreground`, `border-border` 등)
4. **디자인 검증**: `/design-system` 쇼케이스 페이지에서 전체 컴포넌트 점검

## 과거 이력

- **2026-04-15**: `.pen` 3계층 디렉토리(shared/master/experiment) 세팅
- **2026-04-20**: 3계층 구조 폐지 + 모든 `.pen` 파일 삭제. 사유: 당시 "진실의 원천" 역할을 주려다 팀 공유 불가·드리프트 리스크 발생. 관련 history unit: `design-directory-setup`, `claude-design-adoption`
- **2026-04-21**: `.pen` **역할 변경하여 재도입**. "진실의 원천"이 아니라 **솔로 와이어프레임용 워크숍 노트**로만 사용 (Stage 3). Claude Design 쿼터 제약 상황에서 시각 검증 수단 필요성 확인.
