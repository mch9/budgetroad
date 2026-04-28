# 예산 초안 10-step 플로우 피그마 기반 리디자인

**Participants**: mincheol.kim, claude

## Summary
2026-04-22~23 세션에서 `/budget-draft`를 6-step에서 Figma 최신안 기준 **10-step + 결과 페이지**로 전면 리디자인. 입력 화면 10개 각각 재작성, 결과 페이지 도넛 차트 제거 및 "선택한 조건" 카드 + 아코디언 구조 도입. PR #18 생성. 2026-04-23 후속 QA 세션에서 팀원 Preview URL 접근 허용(Vercel Authentication OFF), 하단 네비 sticky 전환 + 홈 CTA와 구분선 위치 통일, CTA 버튼 높이 복구(`min-h-[78px]`), 신혼여행 스텝 문구 3곳 제거, 입력박스 Figma 스펙(42×118px) 반영, 모든 카드 94px 높이 통일.

## Context
- **Background**: 팀 QA에서 Figma 리디자인(`680:1093` "화면 구성") 올라옴. 기존 6-step 구조(Step 2 식장+시기 통합, Step 3 스드메 통합, Step 4 하객+식비 통합)를 각 항목 단위 10-step으로 분리하라는 요구.
- **Requirements**:
  - 10-step 입력: 지역 / 예식 스타일 / 시기 / 스튜디오 / 드레스 / 메이크업·헤어 / 하객수 / 식비(Type B 평균값 추천) / 예물 / 신혼여행
  - 결과 페이지: 도넛 차트 제거, "선택한 조건" 카드(2열 10필드) + 아코디언 항목별 예산(세부 내역 자동)
  - pastel 계열 컬러 5종(#FF6B6B/#4ECDC4/#FFE66D/#95E1D3/#C7CEEA)
  - 반응형: 데스크탑 42/65px, 모바일 26/40px (항목별 예산은 모바일도 32/24px 동일 유지)
- **Decisions**:
  - **Figma 맹목 추종 금지**: 신혼여행 카드 높이 등 UX적으로 어색한 부분은 현재 구현 기준으로 조정 (피드백 메모리 `feedback_figma_comparison`에 원칙 추가)
  - **UX 카피 앵커링 회피**: 서브타이틀에 "시세 반영" 문구 반복 금지 — Step 1에만 유지, Step 2~10은 제거. 인지심리학/행동경제학 관점으로 사용자가 직접 제기 (메모리 `feedback_subtitle_anchoring`)
  - **기본 선택값 첫 번째 옵션**으로 (중간값 `standard` → `simple`). 사용자 의식적 선택 유도
  - **아코디언 기본 전체 펼침** + 화살표 접힘 시 왼쪽(`<`), 펼침 시 아래(▽)
  - **좌/우 비교 스크린샷 포맷 정착**: 사용자가 Figma(좌) vs 구현(우) 비교 스크린샷으로 피드백 제시 (메모리 `feedback_figma_comparison`)
  - 커밋·PR 1개로 묶기 — 리뷰어가 Figma 비교 관점에서 한 번에 볼 수 있게
  - **(2026-04-23 후속)** Figma 미완 상태에서는 지목된 요소(입력박스)만 스펙 적용, 상위 컨테이너(카드)는 프로젝트 내 다른 카드와 동일 크기로 명시 고정 — 시각 일관성이 Figma 충실도보다 우선 (memory `feedback_figma_partial_reference` 생성)
  - **(2026-04-23 후속)** Preview 배포 보호는 시장 진입 모드에선 해제가 합리적 — QA 루프 단축, 숨길 비밀 없음, 해시 URL이 인덱싱 방지
- **Constraints**:
  - Doc-Freeze(~2026-06-03): 새 PRD·블루프린트 추가 금지. 임시 매핑 노트(`.claude/temp/budget-draft-redesign-mapping.md`)만 허용
  - MCP 연결이 세션 중 끊겼으나 로컬 `/tmp/figma-page.yaml` 캐시로 나머지 파싱 진행
  - develop 브랜치 실제 없음 → PR base는 `main` 직결
  - **(2026-04-23 후속)** Figma 캐시 YAML은 layout reference ID만 저장 — 실제 dimensions는 Figma MCP 직접 조회 필요
  - **(2026-04-23 후속)** Next.js 16 Turbopack dev 환경. 브라우저 실측은 로컬 Chrome(`/Applications/Google Chrome.app/...`) + puppeteer-core 임시 설치 방식 — 매 QA 후 제거

## Timeline

### 2026-04-23
**Focus**: Figma 최신안 기준 10-step 플로우 + 결과 페이지 전면 리디자인 + PR #18
- 공통 틀 재구성: `TOTAL_STEPS = 10`, 분할 세그먼트 progress bar, 헤더 로고 전용, 하단 chevron 네비(`<`/`>`)
- Step 1~10 개별 컴포넌트 신설(`SeasonStep`, `StudioStep`, `DressStep`, `MakeupStep`, `GuestStep`, `MealStep`, `YemulStep`, `HoneymoonStep`) — 기존 legacy Step3~6 + TierSelector + SectionLabel 삭제
- `budget-data.ts`: VENUE/SEASON/TIER/MEAL/YEMUL/HONEYMOON OPTIONS 재정의, 카테고리별 `*_TIER_OPTIONS` 3종 추가, `calculateBudget`에 `details` 필드 계산 로직 추가, pastel 컬러 5종 교체
- 결과 페이지: 도넛 차트 제거 → "선택한 조건" 카드(2열 grid) + 아코디언 항목별 예산(20px progress bar, `#F3F4F6` 세부 박스, 펼침/접힘 상태 관리) + 버튼 2개 레이아웃(다시하기 primary / 결과 공유하기 secondary)
- sessionStorage 구 result에 `details` 누락 → 복원 시 `selections`만 신뢰하고 result는 항상 `calculateBudget()` 재계산
- 랜딩 CTA(`cta-link.tsx`) onClick 시 `sessionStorage.removeItem('budgetroad_result')` 추가 → 이전 결과 재등장 방지
- 반응형 폰트 재정렬: 상단 카드는 모바일/데스크탑 2단계, 항목별 예산은 동일 유지
- 브랜치 `feature/budget-draft-figma-redesign` 생성 → 3파일만 staging → 커밋 1개 → push → **PR #18** (base: main)

**Learned**:
- Figma MCP 응답이 720KB처럼 큰 경우 파일로 빠져 context 부담 작음. 진짜 토큰 비용은 **Bash awk 파싱 결과 stdout 누적 + 긴 답변 본문**이 대부분. 세션 중 검증됨
- Figma 프레임 이름이 실제 컨텐츠와 어긋날 수 있음 ("예물"이라 이름 붙은 680:1699 실제는 "신혼여행"). 단계 번호(`단계 N/10`)를 진실의 원천으로 써야
- CSS `-rotate-90`은 SVG V(▽)를 **오른쪽(▷=`>`)**으로 돌림. 왼쪽(◁=`<`)이 필요하면 `rotate-90`. 직관과 반대라 매번 직접 테스트해야

### 2026-04-23 (후속 QA 세션)
**Focus**: Vercel Preview 접근 해제 → sticky 네비 + CTA 높이 복구 → 홈 CTA와 구분선 위치 통일 → 신혼여행 스텝 정리 + Figma 스펙 부분 반영 → 전체 카드 94px 통일

- **Vercel Deployment Protection 해제** — Chaeyeon·해든 Preview 접근 요청 해결. 장기적으론 Settings → Deployment Protection → "Vercel Authentication: Disabled" 권장(시장 진입 모드·해시 URL이라 보안 리스크 없음)
- **하단 네비 sticky 전환** (`page.tsx:232`) — `<nav>`에 `sticky bottom-0 z-10 border-t bg-[#F9FAFB]/80 backdrop-blur-sm` 추가. 헤더(`sticky top-0`)와 대칭
- **CTA 버튼 높이 복구** (`page.tsx:815,827`) — `h-[78px]` → `min-h-[78px]`. 원인: `flex-1` = `flex: 1 1 0%`가 `flex-col` 부모에서 `flex-basis: 0%`로 세로축을 덮어써 버튼이 ~40px로 찌그러짐. `min-h-*`는 flex-basis와 독립이라 해결
- **홈 CTA와 네비 구분선 위치 통일** (`page.tsx:232-234`) — 배경 `bg-[#F9FAFB]/90 backdrop-blur-md`, padding `py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]`, 버튼 `h-14` 추가. 실측 결과 양쪽 모두 "뷰포트 하단 89px 위에 구분선, 박스 높이 89px"로 픽셀 단위 일치
- **신혼여행 스텝 문구 3곳 제거** (`page.tsx:560-587`) — "예상 예산을 입력해주세요"(inline desc + OptionCard prop), "신혼여행 없이 진행"(OptionCard desc)
- **신혼여행 입력박스 Figma 스펙 반영** (`page.tsx:567-572`) — Figma MCP로 node 680:1722 직접 조회 → Rectangle 11(680:1727)이 118×42px 확인. `h-8 w-28 rounded-lg` → `h-[42px] w-[118px] rounded-[9px]`. 단 카드 자체는 Figma 76px 스펙을 따르지 않고 프로젝트 내 일관성 우선
- **모든 카드 94px 높이 통일** (`page.tsx:296,311,561`) — OptionCard 양 상태(normal·disabled)에 `min-h-[94px]`. HoneymoonStep inline yes-card에 `h-[94px]`. Step 1 카드들이 이미 2줄 콘텐츠로 자연 94px이라 `min-h`는 다른 스텝에 영향 無, 신혼여행처럼 짧은 카드만 강제로 맞춰짐. 실측: Step 1/Step 10 카드 전부 94×354px
- **반복 검증 패턴 정착**: 로컬 Chrome headless(`/Applications/...`) + 세션 중 `puppeteer-core` devDep 설치 → 측정 후 `bun remove` 제거. `/tmp/budget-shots/` 폴더에 스크린샷 누적, `getBoundingClientRect` + `getComputedStyle`로 픽셀 실측
- **새 feedback memory** — `feedback_figma_partial_reference.md`: "Figma가 미완일 때 지목된 요소(예: 입력박스)만 스펙 적용, 상위 컨테이너는 다른 카드와 동일 크기 명시 고정". MEMORY.md 인덱스 추가

**Learned**:
- **`flex-1` + `flex-col` 조합의 함정**: `flex: 1 1 0%`의 `flex-basis: 0%`가 flex-col 부모에서 세로축을 제어. `h-[78px]` 같은 명시 높이를 덮어써 모바일(flex-col)에선 찌그러지고 데스크톱(sm:flex-row)에선 정상 보이는 **반응형 회귀**. `min-h-*`는 flex-basis와 독립이라 안전. 발견 단서: Figma 비교 스크린샷에서 모바일만 flat한 경우를 의심
- **`min-h` 단일 변경의 전역 일관성 전략**: OptionCard처럼 여러 스텝에서 재사용되는 컴포넌트에 `min-h-[94px]` 하나 추가하면, 이미 94px인 사용처는 no-op이고 부족한 사용처만 자동 보정. prop·변형 컴포넌트 없이 시각 일관성 확보
- **Figma CSS export 좌표의 함정**: "image 2" width:570 height:398 left:4169 top:764 형식 CSS에서 `left:4169`는 여러 화면을 가로 병렬한 캔버스 오프셋이라 해당 요소가 사용자가 말한 화면과 다를 수 있음. Figma MCP로 node ID 직접 조회가 신뢰 가능한 경로
- **도메인 제약 vs 스펙 충실도 트레이드오프**: 같은 스텝 내 카드 크기가 다른 카드들과 다르면 "인지적으로 이상해보인다"(사용자 표현). Figma가 미완이면 스펙 적용 범위를 지목 요소로 엄격 제한하고, 부모 컨테이너는 프로젝트 내 통계적 다수에 맞추는 게 실전 원칙
- **구분선 위치 통일 3요소 분해**: 두 화면의 하단 고정 요소 구분선 위치를 맞추려면 (a) 내부 버튼 명시 높이 (b) 박스 padding 동일 (c) 배경 opacity/blur 동일 — 특히 `env(safe-area-inset-bottom)`이 한 쪽만 있으면 iOS Safari에서 어긋남

### 2026-04-24
**Focus**: QA round 2 피드백 반영 + 타이포 토큰 도입 + 하이브리드 경계 결정 + 프로덕션 배포

- **타이포 토큰 시스템 도입** (PR #20의 커밋 08985c4/2ef247c): `globals.css` `--text-*` 토큰을 `clamp()` 기반 반응형으로 전환. PM 부트캠프 강사 권고표 적용 (h1 28→48, h2 22→36, h3 18→30, body 16 고정, caption 13→14, display 40→65). `design/README.md` Typography 섹션 + 결정 근거 + 사용 가이드 + 폰트 패밀리 정돈 (기존 "Geist" 오기 → Pretendard Variable 정정)
- **QA round 2 수정 커밋 체인** (PR #19 → auto-close → PR #20 복구판 → MERGED):
  - 아코디언 기본 닫힘 (was: 전체 펼침) + 화살표 방향 ▽/△ (`rotate-180`)
  - `%` 값 금액 하단 우측 정렬 (화살표 우측 별도 컬럼 분리)
  - 공유 아이콘 Share2 (점 3개 연결) / 다시하기 RotateCw (단순 원형) 인라인 SVG 교체
  - **Windows Chrome 공유 모달 도입** (`navigator.share` 제거): 커스텀 Dialog + 텍스트 미리보기 + 복사 버튼 → 한 번 클릭으로 폼 표시
  - 공유 문구 갱신 ("💍 우리 결혼식, 미리 그려봤어요 / 예상 총 비용 X원 / 나도 내 예산 그려보기 👉"). `summary` 파라미터·`summarizeSelections` 헬퍼 제거
  - 결과 페이지 모바일 폰트 (11곳 토큰 치환 시도) → CTO Council 후 **Figma px로 revert** (커밋 2a4f89e)
  - CTA `min-h-[78px]` 중복 적용 (PR #18 본체의 같은 수정이 stacked 브랜치에 자동 반영 안 되어 회귀 발생)
  - 다시하기 아이콘 방향 반전 (RotateCcw → RotateCw, 팀원 QA 피드백 "Figma 방향 일치")
- **하이브리드 타이포 경계 결정** (/cto-council 후 반영): 결과 페이지는 **Figma 원안 px 고정** (11, 13.57, 15.5, 25.6, 42, 65 등 그리드 계산값 보존), 랜딩·입력 스텝·범용 컴포넌트는 토큰. `design/README.md`에 "하이브리드 경계" 섹션 추가
- **Stacked PR 3함정 경험 + 메모리화** (`feedback_stacked_pr_base_fix` 확장): (1) base 수정은 stacked 브랜치에 중복 적용 필요, (2) `gh pr merge --delete-branch`는 child PR 자동 close, (3) squash merge 후 rebase는 충돌 폭발 → cherry-pick이 정답. PR #19 CLOSED 후 `fix/budget-draft-qa-round2-v2` 브랜치에 cherry-pick 6개 (revert 쌍 2c4cc58/2a4f89e 제외) → PR #20 재생성 → auto-merge
- **프로덕션 배포**: PR #18 (본체 + 3 chore 커밋: page.tsx 후속 / omniscitus 누적 / council 산출물) → `41d3b56` 1차 배포. PR #20 (QA 복구) → `dccf135` 2차 배포. https://budgetroad.vercel.app 최종 반영

**Learned**:
- **하이브리드 경계 원칙**: 토큰은 반응형 규칙(clamp), Figma px는 그리드 계산. **다른 레이어**라 경쟁 아님. 화면 성격("브랜드 얼굴" vs "범용 컴포넌트")에 따라 경계 설정. "디자인 시스템은 완성이 아니라 진화".
- **Stacked PR + squash merge 함정**: squash merge로 생성된 새 commit hash는 원본 commit과 diff가 같아도 Git은 동일성 인식 못함 → rebase 시 "이미 merged된 commit을 다시 적용"하려다 충돌 폭발. cherry-pick은 main HEAD 위에 개별 적용이라 3-way 병합으로 자연 해소.
- **moving goalpost 해결 단서**: 평가 기준이 매번 바뀌는 건 체계 문제가 아니라 평가자 문제. 외부 근거 자료(업계 사례·공개 문서)로 기준을 외부화하는 전략 유효 (CTO Council에서 Shape Up·DHH·YC 다층 권위 배치 전략 수립)

## Pending
- [~] 팀원 Vercel Preview URL QA 피드백 수집 — 일부 반영 완료 (CTA min-h·아이콘 방향). 프로덕션 배포 후 추가 피드백 루프 계속
- [x] **(신규)** Vercel Settings → Deployment Protection → "Vercel Authentication: Disabled" 적용 ✔️ 2026-04-24
- [x] QA 통과 시 PR #18 후속 커밋 + merge → 프로덕션 배포 ✔️ 2026-04-24 (PR #18 + PR #20)
- [x] `.claude/temp/budget-draft-redesign-mapping.md` 삭제 ✔️ 2026-04-24
- [x] `.omniscitus/*` 및 기타 unstaged 변경 분리 커밋 ✔️ 2026-04-24 (PR #18에 chore 커밋 3개)
- [~] 모바일 QA — 프로덕션 배포됨, 실기기 iPhone QA는 팀원 진행 단계
- [x] **(신규)** 프로덕션 GA4 이벤트 실제 수집 검증 ✔️ 2026-04-25 (`supabase-migration` end-to-end 검증: 시크릿 창 10-step 완주 → events 6 rows `is_dev:false` + 단일 UUID + `result_viewed` 11개 파라미터 정확 캡처)

## Notes
- 관련 메모리: `feedback_figma_comparison` (좌/우 비교 포맷), `feedback_subtitle_anchoring` (UX 카피 앵커링 회피), **`feedback_figma_partial_reference` (Figma 미완 시 지목 요소만 적용, 이번 세션 신규)**
- 관련 기존 unit: `web/2026-04-14-budget-draft-step-flow.md` (6-step 원본, closed 상태) — 이번 작업이 후속 확장
- 관련 unit(deferred): `devops/2026-04-17-neon-db-setup.md` — 이번 세션 `/follow-up`에서 Event 모델 추가 체크 완료(2026-04-22 market-entry-pivot 세션에 작성된 것 소급 체크)
- PR: https://github.com/mch9/budgetroad/pull/18
- 임시 매핑 노트: `.claude/temp/budget-draft-redesign-mapping.md` (작업 종료 후 삭제 예정)
- QA 도구: 로컬 Chrome headless(`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`) + `puppeteer-core` devDep 임시 설치 패턴. 스크린샷은 `/tmp/budget-shots/`에 누적
