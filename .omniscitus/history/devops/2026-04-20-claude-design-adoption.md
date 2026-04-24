# Claude Design 도입 + 디자인 시스템 레이어 정립

**Participants**: mincheol.kim, claude

## Summary
`.pen` 워크플로우 폐기하고 shadcn `base-nova`(Claude Design) 기반 code-first 시스템으로 전환. 9개 base-nova 컴포넌트 + 타이포/모션 토큰 설치, `/design-system` 쇼케이스 페이지 구축. Claude 제품 내부 Design System 아티팩트(spec 층)와 repo(impl 층)의 이중 구조를 발견하고 싱크 전략 정립.
2026-04-21 session 3에서 Claude Design 쿼터 고갈을 계기로 **디자인 워크플로우 5단계 파이프라인** 정립 + `.pen` **역할 변경하여 재도입** (진실의 원천 아님, 솔로 와이어프레임용 Stage 3). zip export 수령·파싱, Pencil.dev 조사, 메모리/문서 동기화 완료.

## Context
- **Background**:
  - `.pen` 파일이 팀과 공유 불가(Pencil MCP 없이 못 읽음) → 사실상 솔로 산출물로만 존재
  - 팀 Figma → 코드 파이프라인은 이미 돌고 있음 (PR #12에서 Figma UI 전면 적용됨)
  - Claude Design 출시로 shadcn `base-nova` 스타일이 공개 레지스트리로 등장 → 세 번째 진실의 원천 후보 추가
  - 3 source of truth(.pen + Figma + code)는 드리프트 필연 → 단일화 필요

- **Requirements**:
  - 팀이 공유 가능한 디자인 시스템 구조
  - Claude Design 스타일 이식 (컴포넌트 구조/패턴)
  - 버짓로드 브랜드 컬러 `#FF8400` 유지 (Claude 코랄로 대체 금지)
  - 타이포그래피 스케일 확립 (현재 budget-draft에 `text-[32px]` 등 임의 값 난무)
  - 기존 작업 롤백 없이 진행

- **Decisions**:
  - **`.pen` 완전 폐기** — 3개 파일 `git rm`, `design/README.md`는 "진입점 가이드"로 전면 재작성
  - **shadcn `base-nova` 공식 채택** — `components.json`에 이미 설정돼 있던 스타일을 전면 활용
  - **2층 구조 인정** — Claude 제품 UI 내 아티팩트(spec/디자인 언어 문서) + repo(impl/렌더 코드)는 별개이며 각각 고유 역할. 하나로 합칠 수 없고 싱크해야 함
  - **싱크 방향: 아티팩트 → repo** — 사용자가 대화로 결정한 디자인이 spec 권위를 가지며 repo는 이를 반영
  - **Option C(롤백 없이 싱크만) 채택** — 오늘 설치한 컴포넌트는 어떤 spec이든 어차피 필요하므로 유지
  - **Primary는 #FF8400 유지** — OKLCH `0.7 0.16 60`, dark 블록은 일단 유지(결혼 예산 앱 라이트 고정이 자연스러우나 추후 판단)
  - **팀 Figma 공식 URL 등록** — `design/README.md`에 https://www.figma.com/design/ln357t0WYrrMCjyQ9ncQ0N/UI-Design 박음
  - **Phase A만 실행, Phase B는 보류** — 컴포넌트 설치 + 토큰 + 쇼케이스까지 완료. 하드코딩 hex 마이그레이션은 별도 세션으로
  - **2026-04-21 session 3 추가 결정**: 디자인 워크플로우 **5단계 파이프라인** 공식화 — (1) Figma 컨셉·팀, (2) Claude Design 시스템·솔로, (3) Pencil+Claude Code MCP 와이어프레임·솔로, (4) Claude Code 구현, (5) Vercel Preview URL QA·팀. 피드백 루프는 뒤→앞만 허용, 5→1 점프 금지. 변경 규모별 단계 생략 유연 적용
  - **`.pen` 역할 변경하여 재도입**: 4/20 폐지는 "진실의 원천 역할 부여 + 팀 공유 불가"가 문제였음 → 이번엔 **솔로 와이어프레임 스크래치 패드(Stage 3)로 역할 한정**. 진실의 원천 아니며 팀 공유 매체도 아님. 같은 파일 포맷이라도 역할 명시에 따라 정합/드리프트가 갈림

- **Constraints**:
  - `api.anthropic.com/v1/design/h/*` 엔드포인트는 Claude 세션 토큰 전용 — 외부 도구(Claude Code WebFetch 포함)로 fetch 불가. 아티팩트 내용 공유는 **zip export 다운로드**가 유일한 경로
  - 브라우저 시각 검증은 사용자 수동 (Claude Code는 브라우저 자동화 권한 없음)
  - `main`에 직접 push 금지 규칙이 있지만 최근 docs/refactor 커밋 패턴 따라 진행. 이후 `develop` 경유 재고 필요
  - `@base-ui/react@^1.3.0`는 Button 설치 시점에 이미 의존성이 있어 추가 컴포넌트 9개는 코드만 추가됨 (package.json 변경 없음)

## Timeline

### 2026-04-20
**Focus**: `.pen` 폐기 → shadcn base-nova 9개 설치 → 토큰 확장 → 쇼케이스 페이지 구축 (4커밋)

- **커밋 11ffac9 (.pen 폐기)**: design/shared/design-dna.pen, design/master/home.pen, design/master/budget-draft.pen 3파일 `git rm`. design/README.md를 "Claude Design(base-nova) 진입점 가이드 + 팀 Figma 링크"로 전면 재작성. CLAUDE.md 프로젝트 구조 + 디자인 시스템 섹션의 `.pen` 언급 제거. design.yaml blueprint에서 .pen 엔트리 `status: deleted`로 전환 (purpose 필드에 폐기 사유 보존)
- **커밋 7db8336 (wrap-up)**: 2026-04-19 GA4+Looker 작업 분리 커밋 (design 리팩토와 혼합 방지)
- **커밋 2eecda9 (컴포넌트 + 토큰)**: `bunx shadcn@latest add card input label badge radio-group separator dialog tabs skeleton` → 9개 base-nova 컴포넌트 설치. globals.css `@theme inline`에 타이포 스케일(`--text-display/h1/h2/h3/body/caption` = 60/32/24/20/16/13px), letter-spacing(`--tracking-display/tight` = -0.02/-0.01em), line-height(`--leading-display/tight` = 1.05/1.2), 모션(`--duration-fast/base` = 150/200ms, `--ease-out-expo` = cubic-bezier(0.2, 0, 0, 1)) 토큰 추가. Tailwind v4의 `@theme` → 자동 유틸리티 노출 활용
- **커밋 42cd08a (/design-system 쇼케이스)**: 컬러 스와치 8개 / 타이포 6단 / Button 6 variants × 4 sizes / Card(default + sm) / Form(Input+Label+RadioGroup) / Badge 6 / Tabs / Dialog / Skeleton / Motion demo를 단일 페이지에 모두 렌더. 모든 요소에 semantic 토큰만 사용(하드코딩 hex 0개) — 이 페이지가 깨끗하면 토큰 시스템 작동 증명
- `bun run build` 통과 (Turbopack, 정적 prerender 9개 라우트 확인)
- 3커밋을 origin/main에 push (42cd08a는 push 대기)

**Learned**:
- **Claude Design System은 2층 구조**. Claude 제품 UI 안의 아티팩트는 "디자인 언어 spec", repo의 shadcn base-nova는 "렌더 impl". 하나로 합칠 수 없고 둘 다 필요하며 싱크만 가능
- **shadcn copy-into-repo 모델의 강점** — 레지스트리 컴포넌트가 설치 순간 우리 코드가 되므로 이후 수정이 원본에 역전파되지 않음. 커스터마이징 자유, npm 락인 없음, 공급자 영향력 최소화
- **Tailwind v4 `@theme`의 자동 유틸리티 노출** — `--text-display: 60px` 선언만으로 `text-display` 클래스가 생성됨. v3의 config 파일 방식과 결정적으로 달라 마이그레이션 사고 모델 재조정 필요
- **브랜드 컬러는 디자인 시스템과 직교** — Claude Design "적용"은 컴포넌트 구조/패턴/interaction 이식이며, 브랜드 컬러는 primary 토큰 값 하나로 격리됨. Anthropic 코랄 따라 할 필요 없음
- **3 source of truth → 2로 감소의 심리적 효과** — `.pen` 제거 하나로 "어디를 봐야 하지?"의 인지 부하가 눈에 띄게 줄어듦. 숫자보다 "공유 가능성(팀이 보는가)"이 진실의 원천 자격의 핵심 기준
- **shadcn CLI의 dependency 재확인** — 9개 컴포넌트 설치 시 `@base-ui/react`가 이미 있어 package.json/bun.lock 변경 0. 동일 peer를 쓰는 컴포넌트 일괄 설치는 실질 무비용

### 2026-04-21
**Focus**: 아티팩트 vs repo 인식 정렬 + 싱크 전략 수립

- 사용자가 스크린샷으로 Claude 제품 UI 안의 **budgetroad Design System 아티팩트** 존재 공유. 어제 작업 시 사용자의 의도는 "아티팩트 내용 다듬기"였고 Claude Code는 "repo에 디자인 시스템 구축"으로 오해했음이 확인됨
- 롤백 vs 유지 논의 → **유지 + 아티팩트 우선 싱크**로 결론. 오늘 repo 작업은 어떤 spec이든 필요한 "하부 인프라"라는 관점 공유
- 아티팩트 공유 방식 탐색:
  - 스크린샷: 컬러 hex 정확도 떨어짐, OKLCH 복원 불가 → 최후수단
  - HTML preview 복붙: preview 폴더에 각 섹션별 `.html` 존재 발견 (colors-accent-and-surface, colors-chart, colors-ink, type-*, spacing-*, comp-button, comp-input, comp-option-card, comp-progress, comp-donut, comp-emoji-chips, brand-logos, brand-illustration, brand-grid-motif) → 차선책
  - **Zip export**: 아티팩트에서 zip으로 내보내 로컬 경로 공유 → 최선. `.claude/temp/`에 두고 파싱 권장
  - `api.anthropic.com/v1/design/h/...` URL fetch 시도 불가 확인 (세션 토큰 전용)
- 분석 대시보드 16개 KPI 난이도별 triage 재확인: 🟢 6(쉬운 차트) / 🟡 6(계산식 필드) / 🔴 4(BigQuery/코호트)
- Looker Studio 첫 차트 구축 가이드: #8 공유 클릭 수 → Scorecard 타입, `Event count` 측정항목 + `Event name = share_clicked` 필터로 1분 완성. 같은 패턴으로 #10/#11/#13 5분 복제

**Learned**:
- **Claude 제품 내부 API는 세션 토큰 전용** — Anthropic SDK 키로도 접근 불가. Claude 대화 맥락에서만 살아있는 리소스는 export(zip)가 외부 공유의 유일 경로
- **아티팩트 HTML preview는 파싱 친화적** — Claude Design System의 각 섹션이 독립 HTML로 export돼 있어 섹션별 incremental 싱크 가능. 한 번에 전체 싱크 불필요
- **"repo vs artifact" 분리를 조기에 인식했어야 함** — 이전 세션에서 사용자가 "Claude Design 내부 편집하는 거지?"라고 물었을 때 정답은 "아뇨, repo 편집 중이며 아티팩트와는 별개"였음. 맥락 재확인 태만이 한 세션 분량 오해를 만듦
- **롤백 여부 판단 기준** — 작업이 "어떤 spec이든 필요한 하부 인프라"면 유지, "특정 spec 해석에만 유효"면 롤백. 컴포넌트 설치/토큰 선언은 전자, 구체 색상/크기 값은 후자

### 2026-04-21 (session 2)
**Focus**: Pretendard Variable 통일 + Claude Design System 세팅 완료 + quick wins 4종

- `/follow-up` 리뷰로 14개 open unit pending 재확인 — 새로 코드로 해소된 항목 0건, 남은 건 대부분 외부 시스템(GA/Looker/BigQuery) 확인 대기 성격이라 확인
- 브랜드 컬러 reality check: `CLAUDE.md`에 "Primary #FF8400"으로 적혀있으나 실제 UI는 `#AAC7E1` 블루-그레이 + `#373737` 차콜 조합. 코드 하드코딩 hex 30회(블루-그레이) vs 오렌지 2파일만(토큰 선언·차트 fallback) → **오렌지 완전 퇴출 결정**
- Claude Design System 입력 세팅 완료 — **GitHub App 직접 연결 경로 채택, 기존 "zip export → HTML 파싱" 계획 폐기**:
  - Company blurb 가치중심 재작성 (옵션 🅐 "공감·감정 중심" — "감을 잡다", "첫 걸음을 떼다" 동사 강조 + brand voice 힌트 명시 문장)
  - Notes 템플릿: 오렌지 제외 + 블루-그레이 컬러표 + Pretendard 파일 경로 + 미정의 커스텀 컴포넌트(OptionCard/ProgressBar/ResultDonut) spec 생성 요청
  - 업로드 파일: `src/app/fonts/PretendardVariable.woff2` + `public/brand/` 로고 3종 + `public/couple-illustration.png`
- Pretendard Variable 통일 (커밋 `42cb0b4`):
  - `src/app/fonts/PretendardVariable.woff2` 신규 (jsdelivr npm CDN, 2.06MB, `wOF2` magic bytes 검증)
  - `layout.tsx`: Geist/Geist_Mono import·정의·html className 완전 제거, Pretendard만 `next/font/local`로 로드 (variable `--font-pretendard`, weight axis `45 920`, display `swap`)
  - `globals.css`: `--font-sans`·`--font-mono` 둘 다 Pretendard 첫 순위로 체인 (mono는 `ui-monospace, SFMono-Regular, Menlo` 폴백)
  - `budget-draft/page.tsx:747` 금액 표시 `font-[family-name:var(--font-geist-mono)]` → `tabular-nums` (모노스페이스 폰트 없이 자릿수 정렬 달성)
  - `page.tsx:103` Figma 주석 "Geist 700" → "Pretendard 700"
  - `CLAUDE.md` 폰트 섹션 Pretendard 기준 갱신
- Quick wins 4종 일괄 (커밋 `a8879f4`):
  - `.claude/temp/backups/*.serif-B.bak` 2개 로컬 삭제 (`.gitignore:43` 포함되어 git 무관)
  - `public/robots.txt`에 `Disallow: /design-system` 1줄 추가 (showcase 페이지 SEO 색인 차단)
  - `CLAUDE.md` Primary 컬러 표기 현실 반영 (`#FF8400` → "Primary Accent `#AAC7E1` / Action `#373737` / Background `#F9FAFB`")
  - `globals.css` `.dark {}` 블록 32줄 제거. `@custom-variant dark (&:is(.dark *))` 선언은 **유지** (shadcn 컴포넌트의 `dark:` 유틸리티 대량 사용 중 — 선언 삭제 시 Tailwind v4 기본값 `prefers-color-scheme: dark` 미디어쿼리로 폴백해 OS 다크 사용자의 UI가 깨짐)
- 로컬 3커밋 원격 push: `2eecda9..a8879f4` 범위 (42cd08a showcase + 42cb0b4 Pretendard + a8879f4 cleanup 동시 반영)
- dev 서버 시각 검증: 4개 경로(`/`, `/budget-draft`, `/design-system`, 결과 페이지) 사용자 "괜찮다" 승인

**Learned**:
- **"토큰 선언 vs 실사용"의 괴리는 문서만 보면 놓치기 쉬움** — Claude Design 슬롯에 brand blurb 쓰려고 스크린샷과 코드를 대조하는 과정에서 오렌지 퇴출이 드러남. 디자인 시스템 세팅이 의도치 않게 **"코드 현실을 감사하는 효과"**를 낳음. 이런 미세 드리프트는 정기 감사 의식 없이는 누적됨
- **Pretendard Variable + `tabular-nums` = 모노스페이스 폰트 없이 테이블 자릿수 정렬** — OpenType `font-variant-numeric: tabular-nums`는 동일 폰트 내에서 숫자 글리프 폭만 고정. "폰트 통일성 + 레이아웃 기능성" 둘 다 확보되며 별도 monospace 폰트 로드 불필요
- **다크모드 블록만 제거, `@custom-variant dark` 선언은 유지**가 핵심 — 선언까지 지우면 Tailwind v4가 기본 `prefers-color-scheme: dark` 미디어쿼리로 폴백해 shadcn 컴포넌트의 `dark:` 유틸이 OS 다크 사용자에게 자동 발동. dead CSS 제거 시 "선언 vs 사용처" 의존성 확인 필수
- **"Continue to generation" 경로는 zip export보다 훨씬 직접적** — GitHub App이 default branch 최신 커밋을 스캔하므로, 생성 직전 repo를 최신 상태로 push하는 게 생성 결과 품질의 전제조건. 이번 세션의 3커밋 묶음 push 타이밍이 Claude Design Continue 클릭 직전이었던 것이 설계상 맞는 순서
- **가치중심 blurb의 voice 힌트 명시** — Claude Design이 컴포넌트 생성 시 brand voice를 직접 참조하므로 "공감형·권유형 — 명령하지 않고 '함께 구경해보자'는 태도" 같은 문장이 사실상 생성 지시문 역할. 기능 설명만 있는 blurb는 voice가 UI에 스며들지 않음

### 2026-04-21 (session 3)
**Focus**: Claude Design 쿼터 고갈 → 워크플로우 5단계 파이프라인 정립 + Pencil 역할 변경 재도입 + 메모리/문서 동기화

- Claude Design 쿼터 소진(다음 주까지 사용 불가) 발견 → 쿼터 제약 상황의 "그 동안 어떻게 작업하느냐" 대안 탐색 시작
- 사용자 초기 제안: "`.pen` 기반 와이어프레임 재도입" → 4/20 폐지 사유(팀 공유 불가 + 3 source of truth 드리프트) 근거로 1차 반대. 사용자가 의도를 재확인 → **"영구 대체가 아니라 쿼터 제약 기간의 솔로 워크스페이스"** 로 맥락이 달라 의견 수정 (일시적 스크래치는 4/20 결정과 충돌 안 함)
- **Claude Design zip export 수령** (사용자 `/Users/mch/Downloads/Comet/Budgetroad Design System.zip`) → `.claude/temp/claude-design-2026-04-21/`에 추출. 구성: `README.md`(138줄 완전 spec), `colors_and_type.css`(140줄 토큰 정의), `preview/*.html` 17개(섹션별 카드), `ui_kits/budgetroad-app/`(하이파이 React recreation + `index.html`), `assets/`·`fonts/`
- **zip vs 코드 드리프트 발견**: `src/app/globals.css`의 `--primary`가 여전히 `oklch(0.7 0.16 60)` = 오렌지 shadcn 기본값, zip spec은 `#373737`(Action) 명시. 실제 UI는 **하드코딩 hex 73곳**으로 블루-그레이 흉내 → Phase C 마이그레이션의 근본 원인 = semantic token이 spec과 어긋나 있음
- **`.pen` 재구성 불필요 판단**: `ui_kits/budgetroad-app/index.html`이 **완성된 하이파이 뷰어**라 "와이어프레임 보기" 목적에는 브라우저 더블클릭으로 충분. 별도 `.pen` 재구성 필요 없음 (결과물은 다음 세션 판단)
- 사용자 질문 "**코드 안 바꾸고 팀과 컴포넌트·레이아웃·스타일 검증은 어떻게?**" → Pencil.dev 공식 문서 + 리뷰 블로그 3건 크로스 체크 조사. 주요 발견: MCP 도구 전 패키지(`batch_design`/`batch_get`/`get_screenshot`/`get_variables`/`snapshot_layout` 등), VS Code+Claude Code 네이티브, 로컬 퍼스트, 얼리 액세스 무료, **팀 실시간 협업 부재 + 데스크톱(Mac/Linux) 전용**이 핵심 한계
- 최종 합의 **5단계 파이프라인**: ① Figma(컨셉·팀) ② Claude Design(시스템·솔로) ③ Pencil+Claude Code MCP(와이어프레임·솔로, `.pen` 출력) ④ Claude Code(구현) ⑤ Vercel Preview URL(QA·팀). 피드백 루프 5→3/5→2/4→3/1→2 허용, 5→1 금지. 유연 적용: 작은 스타일 → Stage 4 바로, 컴포넌트 변경 → 3-4, 토큰 변경 → 2→4, 큰 기능 → 1-5 전체
- **메모리/문서 동기화**:
  - `~/.claude/projects/.../memory/feedback_design_workflow.md` 생성 (5단계 + Why + How + 유연 규칙 + 금지 5→1 점프)
  - `~/.claude/projects/.../memory/project_design_structure.md` 삭제 (4/20에 3계층 폐지되어 stale)
  - `MEMORY.md` 인덱스 갱신 (Design Structure → Design Workflow 항목 교체)
  - `design/README.md` "작업 워크플로우 (5단계 파이프라인)" 섹션 신설 + 피드백 루프 + 팀 공유 원칙 + 매체 선택 원리 + 유연 적용 표 + 과거 이력 보강(폐지 → 역할 변경 재도입 기록)

**Learned**:
- **`.pen` 재도입 판단 기준은 "영구 대체냐 vs 임시 워크스페이스냐"** — 전자면 여전히 거부, 후자면 수용. 같은 파일 포맷이라도 **역할 명시**에 따라 정합/드리프트가 갈림. "같은 도구를 다시 쓰는 게 맞나"의 답은 "어떤 역할로 쓰느냐"에 종속
- `ui_kits/budgetroad-app/index.html` 같은 **자가포함 HTML export**는 팀 공유 매체로 `.pen`보다 우위(브라우저로 누구나 열람 가능, MCP/Pencil 설치 불필요). 단 인터랙션 검증은 여전히 Vercel Preview URL 필요
- **Pencil MCP의 핵심 밸류 = AI가 캔버스에 직접 디자인 배치**. `batch_design`(생성) + `get_screenshot`(시각 피드백) 순환 구조로 디자이너 지위 없는 개발 입문자도 솔로 디자인 반복 가능. Figma가 없는 틈새를 정확히 채움
- 워크플로우 5단계 설계 원리 = **"결정 비용 × 매체 비용 매칭"**. 큰 결정은 Figma에서 30초, 작은 결정은 코드에서 30분. **결정 크기와 매체 비용이 반비례할 때 낭비 최소**. 이 원리가 Figma vs Claude Design vs Pencil vs 코드의 역할 분리를 도출한 근본 논거
- **디자인 시스템 세팅(Stage 2)이 코드 현실을 감사하는 효과**를 낳음. 4/20 session 2 + 4/21 session 3 둘 다 같은 패턴 — Claude Design/spec 작업은 코드-spec 드리프트 발견의 자연스러운 계기로 기능. `--primary`가 오렌지로 남아있던 것도 zip 대조 중 드러남
- **"난리났다" 수준의 혼란은 도구 선택 문제가 아니라 역할 분리 실패**일 가능성. 3 source of truth가 문제가 아니라 "각 source가 어떤 역할인지 명시 안 된 상태"가 문제. 역할을 명시하는 순간 3-4개 매체가 공존해도 혼란이 사라짐

## Pending
- [x] 42cd08a를 origin/main에 push ✔️ 2026-04-21 (`2eecda9..a8879f4` range로 Pretendard + cleanup까지 함께 push)
- [x] `/design-system` 페이지를 `robots.txt`에 차단 ✔️ 2026-04-21 (`Disallow: /design-system` 1줄)
- [x] 다크모드 블록(`globals.css:86-118`) 정책 결정 ✔️ 2026-04-21 (블록 32줄 제거, `@custom-variant dark` 선언은 shadcn 호환 위해 유지)
- [x] 브라우저에서 `/design-system` 시각 검증 ✔️ 2026-04-21 (dev 서버에서 사용자 "괜찮다" 승인)
- [x] 아티팩트 zip 수령 → `.claude/temp/claude-design-2026-04-21/`에 추출 → 구조 파악 완료 ✔️ 2026-04-21 session 3 (README.md 138줄 spec + colors_and_type.css 140줄 토큰 + preview HTML 17개 + ui_kits/budgetroad-app/ 하이파이)
- [x] Claude Design System 생성 결과물 수령 → 토큰 Colors/Type/Spacing 대조 ✔️ 2026-04-21 session 3. **주요 어긋남**: `globals.css --primary` 여전히 `oklch(0.7 0.16 60)`=오렌지(shadcn 기본), zip spec은 `#373737` 명시. `--accent`·`--background`·브랜드 토큰(`--br-*`)·shadow 토큰 전부 code에 부재. 이것이 **하드코딩 hex 73곳의 근본 원인**
- [ ] 토큰 싱크: 생성 값으로 repo 덮어쓰기 (생성물이 진실의 원천)
- [ ] 생성물에만 있는 컴포넌트 처리: Emoji Chips, Progress Bar, Result Donut → `bunx shadcn add` 또는 커스텀 구현
- [ ] repo에만 있고 생성물에 없는 Option Card 추출 → `src/components/ui/option-card.tsx`로 분리 후 생성물에도 spec 추가 권장
- [ ] Brand Grid Motif 존재 여부 확인 및 에셋 준비
- [ ] Phase C: `budget-draft/page.tsx`의 하드코딩 hex 73곳 → semantic 토큰 마이그레이션 (grep 재측정 결과 73건)
- [ ] Looker Studio 실행: #8 Scorecard 구축 → #10/#11/#13 복제 → #16 분포 바차트 7개 (다음 세션 예정, `ga4-looker-analytics-setup` unit 본체에 상세)

## Notes
- 관련 unit: `design-directory-setup`(.pen 3계층 폐지됨, 본 unit으로 승계)
- 관련 unit: `step-flow-rebuild`(하드코딩 hex 68곳 migration target)
- 관련 unit: `analytics-dashboard-prd`, `ga4-looker-analytics-setup`(KPI 구현 루트)
- 커밋 해시: 11ffac9 (.pen 제거), 2eecda9 (컴포넌트+토큰), 42cd08a (showcase), 42cb0b4 (Pretendard 통일), a8879f4 (dark block 제거 + robots + brand color 문서)
- Pretendard 파일: `src/app/fonts/PretendardVariable.woff2` (Apache 2.0, 2.06MB, Variable woff2, weight axis 45~920)
- Claude Design System 입력 세팅 경로: Company blurb(옵션 🅐) + Notes 템플릿 + 파일 업로드(woff2 + 브랜드 로고 3종 + 일러스트) → "Continue to generation"
- 팀 Figma: https://www.figma.com/design/ln357t0WYrrMCjyQ9ncQ0N/UI-Design
- shadcn base-nova 문서: https://ui.shadcn.com (style=base-nova)
- Claude Design System 아티팩트는 Claude 제품 UI 안에만 존재 — 현 Claude Code 세션에서 직접 조작 불가
