# GA4 `/og-image` 404 추적 + 팀 공유 자료 작성

**Participants**: mincheol.kim, claude

## Summary
회의 중 GA4에서 발견된 `/og-image` 404 1건을 코드·git history·외부 신호 3축으로 추적해 우리 코드 무관임을 확인. OG 이미지에 대한 팀 공유용 설명 자료 작성. 1회성 무해 이벤트로 분류해 무대응 결정.

## Context
- **Background**: 오늘(2026-04-29) 회의 중 GA4 "인기 페이지/화면" 표에 `404: This page could not be fo...`가 1 view·1 user·3 events로 표시되어 원인 확인 요청.
- **Requirements**: (1) 어떤 URL에서 404가 났는지 짚어내기 (2) 우리 코드/설정 문제인지 분별 (3) 무대응/redirect/`not-found.tsx` 추가 중 적절한 처리 결정.
- **Decisions**:
  - **404 path 확정**: `/og-image` (GA4 page_path 드릴다운 결과). 내부 라우트로 한 번도 존재한 적 없음 (전체 git history 검색 결과 `feat/og-image` 브랜치 이름만 존재).
  - **원인 추정**: 사용자가 회의 중 OG 이미지 확인하려 `/og-image`로 추측 입력 (실제 경로는 `/opengraph-image`, Next.js Metadata API가 `src/app/opengraph-image.tsx`에서 자동 생성). 사용자 본인이 1회 시도했음을 확인.
  - **처리 결정**: 무대응. 근거 — (a) 외부 사용자 시나리오 없음(OG 이미지를 직접 URL 입력해서 보는 일반 사용자는 없음, 메신저 자동 추출이 표준) (b) YAGNI(1회 발생에 redirect 추가는 코드 부채) (c) 시장 진입 모드 + Tier 1 합류 자료가 우선.
  - **팀 공유 자료**: OG 이미지 정의·실제 경로·404 원인·영향 평가를 마크다운 1블록으로 정리해 노션·슬랙 붙여넣기 용도로 제공.
- **Constraints**:
  - **Vercel 무료 플랜 로그 보관 1시간**: 어제 발생한 404의 raw 로그는 이미 휘발 → vercel logs로 직접 접근 불가
  - **Supabase events에 `page_view` 미수집**: 도메인 이벤트 7종(`service_entered`, `budget_draft_entered`, `cta_clicked`, `input_started`, `result_viewed`, `back_clicked`, `share_result`)만 트래킹. `not-found.tsx`에 분석 코드도 없음 → 자체 DB로 404 추적 불가능 (GA4가 유일 소스)
  - **Next.js OG 라우트의 비직관성**: `opengraph-image.tsx` 파일명이 그대로 라우트 path가 됨. 짧은 단축형(`/og-image`)을 추측하기 쉬워 동일 패턴 재발 가능성

## Timeline

### 2026-04-29
**Focus**: GA4 404 path 확정 + 코드 무관성 증명 + 팀 공유 자료 작성

- **404 path 확정**: GA4 "보고서 → 참여도 → 페이지 및 화면" 표 차원을 "페이지 경로 + 쿼리 문자열"로 변경 + 페이지 제목 "404" 필터 → `/og-image` 1 view·1 user·3 events 확인.
- **3축 코드 추적으로 무관성 증명**: (a) 내부 링크 — `Link href`/href 는 `/`, `/budget-draft` 2개만, 둘 다 유효 (b) 외부 URL 생성 — `siteUrl`은 root만 사용, 깨진 path 없음 (c) sitemap/robots/vercel.json/next.config — redirect/rewrite 0건. 추가로 git log --all --diff-filter=A로 전체 히스토리에서 `og-image` 라우트 파일이 *한 번도 존재한 적 없음* 확인 (브랜치 이름 `feat/og-image`만).
- **GA4 신호로 봇/정상 사용자 분별**: 1 user · 1 view · *3 events* · 이탈률 0% → JS 실행되는 진짜 브라우저 + 다른 페이지로 이동한 패턴. 봇이면 보통 1 event + 100% 이탈률. 사용자 본인이 회의 중 입력한 케이스로 확정.
- **추적 한계 매핑**: GA4(✅ 가용) / Vercel logs(❌ 1시간 보관 휘발) / Supabase events(❌ `not-found` 트래킹 0). 향후 `not-found.tsx` + analytics 추가 옵션 보유.
- **팀 공유 자료 작성**: OG 이미지 정의·실제 경로(`/opengraph-image`)·잘못된 추측(`/og-image`)·영향 평가(외부 사용자 0 / 1회성)·다음 확인법(메신저 미리보기 카드)을 마크다운 단일 블록으로 정리. 코딩 0인 합류자도 즉시 이해 가능한 톤.
- **무대응 vs redirect vs not-found.tsx 3안 검토 후 무대응 채택**.

**Learned**:
- **404를 항상 fix해야 하는 신호로 보면 안 됨** — *외부 사용자가 클릭한 깨진 외부 링크* / *반복 패턴*이면 fix 가치 있지만, *내부 디버그 1회*는 정보일 뿐. "원인 짚어내고 → 무해 확인 → 그대로 둔다"가 정상 흐름. 모든 404를 fix하는 게 위생이 아니라, 진짜 문제 신호인지 *분별*하는 게 위생.
- **Next.js Metadata API 라우트의 함정**: `opengraph-image.tsx`가 `/opengraph-image`로 직접 노출돼 PNG가 뜸. `/og-image` 같은 단축형 추측이 직관적이라 같은 typo 패턴이 재발 가능. 하지만 외부 사용자에겐 메신저 자동 추출이 표준이라 영향 0 → cosmetic redirect는 코드 부채.
- **추적 도구 매트릭스를 사전에 알아야 사고 시 시간 절약** — Vercel Free 로그 보관 1시간 / Supabase는 도메인 이벤트만 / GA4가 page_view·404 자동 추적의 유일 소스. 이 매트릭스를 머릿속에 들고 있으면 "어디서 단서 찾을지" 판단이 즉각.
- **GA4 page_path 드릴다운은 표 차원 변경 1번이면 됨** — 기본 표는 페이지 제목 기준이지만 드롭다운 한 번으로 path 확인 가능. 차원 추가에 탐색(Explore) 띄울 필요 없음. 같은 질문 재발 시 30초.
- **회의 중 발견된 이슈는 회의 자료 형태로 마무리하는 게 효율적** — 본인 머릿속만 정리하면 같은 질문이 다음 회의에서 또 나옴. 마크다운 1블록(노션·슬랙 호환)으로 만들어 두면 합류자도 즉시 같은 이해에 도달.

## Pending
(없음 — 무대응 결정으로 완결)

## Notes
- **관련 unit**: `web/2026-04-13-og-image-social-sharing.md` (PR #7 — OG 이미지 PR 시 브랜치 이름이 `feat/og-image`였던 흔적이 이번 typo 추측의 잠재적 근원).
- **관련 메모리**: `feedback_missing_data_ux` (없는 데이터는 조작 금지)와는 다른 축 — 이건 "무관 신호 분별" 패턴.
- **재발 시 처리법**: 동일 패턴(`/og-image` 또는 다른 추측 경로)이 반복되면 그때 (a) `/og-image` → `/opengraph-image` redirect 1줄 추가 또는 (b) `not-found.tsx` + `trackEvent('not_found', { attempted_path })` 5분 작업으로 자체 DB 추적 활성화 검토. 1회성에선 불필요.
- **GA4 드릴다운 경로** (재사용용): 보고서 → 참여도 → 페이지 및 화면 → 표 상단 드롭다운 "페이지 제목 및 화면 클래스" → "페이지 경로 + 쿼리 문자열" 변경 → 검색창 "404" 필터.
