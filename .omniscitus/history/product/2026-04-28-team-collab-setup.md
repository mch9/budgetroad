# 팀 합류 운영 모델 + 강사님 스타일 cycle 결정

**Participants**: mincheol.kim, claude

## Summary
PM 부트캠프 7명 팀의 Pro·Max 두 명이 클로드 요금제로 합류하는 시점에서 운영 모델 결정. CTO Council 다중 세션으로 ① Vercel→AWS EC2 보안 이전 검토(유지) ② 팀 영역 분담·wrap-up 권한·메모리 정책·CLAUDE.md 한도·cycle 모델 5건 결정 ③ 미니 Shape Up 변형안 폐기·강사님 스타일 7-layer + 1+1 cycle 채택 ④ Doc Freeze 50명 트리거(223명) 충족으로 해제 ⑤ market-entry-pivot 및 ga4-looker-analytics-setup unit close.

## Context

- **Background**:
  - 2026-04-22 Council 결정의 재평가 트리거(2026-06-03 또는 방문자 50명) 중 50명 트리거가 223명 달성으로 4.4배 충족
  - Pro 구독자(학생, 글쓰기·데이터 정리 강점, 코딩 0)와 Max 구독자(경영·세무 공무원 1년 경험, 정리·탐구 강점, 코딩 0)가 PM 부트캠프 7명 팀 일원으로 합류, 클로드 요금제 사용 시작
  - 강사님이 Vercel 보안 우려를 이유로 AWS EC2 이전 제안. "지난번 Vercel 털렸다", "개발자가 수사받는다" 등 사용자 불안 표면화
  - 시장 진입 모드(2026-04-22~28) 종료 시점에서 팀 운영 모델 새로 짜야 함
- **Requirements**:
  - AI native 팀 운영 합의 — "AI에 어디까지 맡길 것인가"의 권한 위임 매트릭스
  - 부트캠프 평가 정합성 — 강사님 표준 산출물 양식 정렬
  - 9주 부트캠프(~2026-06-28) timebox 안에 학습 가치 극대화
  - 학습부채 누적 정리 (이전 결정 잔재·obsolete pending)
- **Decisions**:
  - **Vercel 유지** — EC2 이전 안 함. 우리 데이터(익명 visitor_id + 결혼 선택값, PII 0건)에 위협 표면 작음. PaaS→IaaS 이전은 운영 책임 이전이지 보안 자동 향상 아님. 1인 운영에 EC2는 OS 패치·SSH·키 회전 새 공격면으로 보통 보안 *떨어뜨림*. 호스팅 위치는 결정 99% 비핵심
  - **영역 분담 (모두 PM+개발 동일 역할)**: 본인=Core PM(코어 플로우·인프라·KPI 운영) / Pro=UX·콘텐츠 PM(카피·UX writing·정성 데이터 정리) / Max=확장·분석 PM(Cycle Pitch·KPI SQL 분석·새 가설 PRD). 코딩 0 두 분에게 frontend/backend 같은 *기술축* 분리는 부적합 → *기획축* 분리만 가능 (사용자 직감이 정확했고 Claude 첫 권장은 잘못된 축)
  - **wrap-up 권한 점진 확대**: Cycle 1 본인 단독 → Cycle 2 각자 초안+본인 검토 → Cycle 3 각자 PR commit. 두 분 강점(글쓰기·정리)이 wrap-up 직결이라 빠른 이양 가능
  - **메모리 정책**: 개인 메모리(`~/.claude/projects/`)는 사람별 자유. 프로젝트 합의는 CLAUDE.md / `.claude/skills/` / `.omniscitus/` (git 추적, PR로 변경)
  - **CLAUDE.md 한도**: 1차 250줄 → `docs/AI-DELEGATION.md` 분리 / 2차 350줄 → `docs/CONTRIBUTING.md` 분리. `feedback_doc_chaining` 메모리의 "포인터만 남길 것" 원칙 적용
  - **Cycle 모델 변경**: 미니 Shape Up 9주 변형안(2주 Build + 1주 Cool-down × 3) **폐기** → 강사님 스타일 7-layer + **1주 빌드 + 1주 관찰** cycle 채택. 부트캠프 평가 정합성 + 외부 표준 정렬이 결정 근거. 2026-04-24 Council의 "Shape Up 외부 권위 다층 배치 전략"은 *팀에 강사님 7-layer를 거부할 때*의 무기였으나 본인이 강사님 스타일에 정렬하기로 했으므로 그 무기 자체가 불필요
  - **Git 협업 모델**: collaborator 직접 clone (fork 아님). 근거: Vercel Preview URL 자동 생성 + CI secrets 공유에 same-repo PR 필수
  - **AI 역할 분담 (Delegation Levels L0~L3)**: L0(타입·테스트·문서·정적 데이터, spot-check만) / L1(UI·API·비즈니스 로직, PR 리뷰 1명) / L2(스키마·외부 API·보안·성능, 인간 주도) / L3(KPI 정의·인터뷰 해석·디자인·정책, 인간만). PR 템플릿의 "AI assistance" 칸 → 리뷰 강도 자동 조절
  - **Doc Freeze 해제** — 50명 트리거 충족으로 자연 만료. `feedback_doc_freeze.md` 메모리 삭제. 새 PRD·skill·docs 자유
  - **단일 Bet 모델**: 본인·Pro·Max가 각자 영역에서 *같은 Bet 1개*에 기여. Cycle 2 후보 = "회귀 기대감 가설 — 결과 저장 기능" (KPI #4 7일 재방문 1% 신호 직격)
- **Constraints**:
  - Pro·Max 둘 다 코딩 0 → Claude 의존도 100%. 첫 2주는 "Claude가 짠 코드를 읽는 습관" 형성이 PR 리뷰 1순위
  - 부트캠프 9주 timebox(~2026-06-28). Cycle 2(5/12~5/25), Cycle 3(5/26~6/8), 이후 Cycle 4·5 추정
  - PR 템플릿의 "AI assistance" 칸은 표시만 있고 안 지키면 무의미 → 정책이 아니라 리뷰 강도 조절 신호
  - Husky+lint-staged 도입 보류 — 입문자 환경에서 commit 막힘이 학습 비용 초과. CI lint 실패 게이팅으로 대체

## Timeline

### 2026-04-28
**Focus**: CTO Council 다중 세션 → Vercel 유지 + 팀 합류 셋업 5건 결정 + 강사님 스타일 cycle 채택 + 학습부채 정리

- **CTO Council #1 (Vercel→EC2)**: 강사님 제안 검토 → 이전 안 함 결정. PaaS vs IaaS 책임 분담 표 + 데이터 자산 분석(PII 0건) + 비용 분석(Cycle 2 통째로 잡아먹음) 근거. 대안 5종 제시: 개인정보처리방침 / 동의 배너 / Supabase RLS(Phase 3) / Vercel Firewall+BotID / .env 위생. 합 1시간 미만
- **사용자 불안 해소 (Vercel 털림·개발자 수사)**: 두 위험을 *플랫폼 보안* vs *법적 책임*으로 분리. Vercel 자체 대형 사고 공개된 적 없음. "털린다"의 99%는 코드 위생(노출된 키, NPM supply chain)이고 EC2로 옮겨도 동일. 한국 개발자 수사 사례 패턴(대량 PII 유출 / 처리방침 미고지 / 금융 사기 / 저작권 / 보안 우회) 모두 우리 앱 비해당
- **CTO Council #2 (팀 합류 셋업 검토)**: 현재 자산 점검 (CLAUDE.md / ESLint+Prettier / CI / 21개 프로젝트 skill / omniscitus / hooks 풍부) vs 미흡(README stale=next-app 기본 / PR 템플릿 0 / Branch protection 0 / Husky 0 / Vitest 0 / Delegation 정의 0). 결론: 새로 만들 거 적고 *합류자가 1일차에 발견 가능하게* 만드는 게 진짜 일
- **결정 #1 영역 분담**: 첫 권장(frontend/backend) → 사용자 직감 반영 후 *기획축* 분리로 수정. 본인=Core / Pro=UX·콘텐츠 / Max=확장·분석. Cycle 2 매핑 예시 포함
- **결정 #2~#5 wrap-up 권한·메모리 정책·CLAUDE.md 한도·Cycle 모델**: 표준 정답 + 사용자 컨텍스트(PM 부트캠프, 코딩 0) 가중. Shape Up 폐기 + 강사님 스타일 채택은 외부 표준 정렬이 학습 가치 극대화 논리
- **Git 협업 모델**: collaborator + 직접 clone. fork는 외부 기여 모델, Vercel Preview URL/CI secrets 차단으로 부적합
- **메모리·unit 정리**:
  - `feedback_doc_freeze.md` 삭제 (규칙 만료)
  - `project_2026-04-22-council-decision.md` "후속 결정 (2026-04-28 트리거 발동 후)" 섹션 추가
  - `MEMORY.md` 인덱스 갱신 (Doc Freeze 항목 제거 + Council 항목 RESOLVED 표기)
  - `market-entry-pivot` unit Pending 5건 처리(3건 ✔️ + 2건 obsolete) + Timeline 2026-04-28 entry 추가 + close

**Learned**:
- **외부 트리거 도달 시점이 "재평가하자"가 아니라 "재평가가 끝나는 시점"이어야 함** — 223명 4.4배 초과 신호는 트리거 발동을 명확히 했고, 그 자리에서 후속 결정(팀 합류 + cycle 모델 + Tier 1 셋업)까지 이루어져야 가속이 끊기지 않음. "조건 충족했네 → 다음에 결정하자"는 모드 전환의 가장 흔한 실패 패턴
- **PM 부트캠프 환경에서 외부 권위 정렬이 학습 가치를 극대화** — 4/24 Council의 "Shape Up 외부 권위 다층 배치"는 *팀에 강사님 7-layer 거부할 때*의 무기. 강사님 스타일 정렬 결정 시 그 무기 자체가 불필요. 결정의 *맥락 변경*이 일어나면 같은 결정도 재검토 필요
- **코딩 경험 0인 합류자 두 명에게 frontend/backend 분리는 부적합** — PM 부트캠프 환경에선 *기술축* 아니라 *기획축* 분리가 자연. 사용자 맥락(PM 부트캠프 + 코딩 0)을 충분히 가중하지 않은 첫 권장은 잘못된 축
- **Vercel vs EC2 보안 결정의 핵심은 "지키는 자산 × 막는 위협"** — PII 0건이라 위협 표면 작음. PaaS→IaaS 이전은 운영 책임 이전이지 보안 자동 향상 아님. 1인 운영에서 EC2는 보통 보안을 *떨어뜨림*. 호스팅 위치보다 코드 위생·데이터 위생이 99% 결정 요인
- **AI native 합의의 본질은 권한 위임 매트릭스** — "Claude 도입했어요"가 아니라 "어느 영역에선 Claude 산출물 그대로 신뢰, 어느 영역에선 인간 리뷰 필수"를 영역별로 박아두는 것. Delegation Levels L0~L3가 그 정형화. PR 템플릿 "AI assistance" 칸은 표시 자체가 아니라 *리뷰 강도 자동 조절 신호*가 의미
- **collaborator vs fork 차이의 결정적 요소** — Vercel Preview URL 자동 생성 + CI secrets 공유. 사내 팀 협업은 collaborator, 외부 기여는 fork. 부트캠프 9주 안에서 fork 모델은 QA 루프를 깸

### 2026-04-29
**Focus**: ga4-looker-analytics-setup close + 협업 결정 재브리핑 + wrap-up

- **`ga4-looker-analytics-setup` unit close** — 본 unit 핵심 목적(16개 KPI 측정 가능)은 `supabase-migration`에서 16/16 KPI 운영 진입으로 완전 흡수. 남은 3건(`time_on_result_sec` 별도 파라미터 / Looker 기간 컨트롤 UX / GA Debugger 확장)은 nice-to-have로 deferred. `superseded_by: supabase-migration` 명시
- **`tooling-rotation-and-rename-prep` 재확인** — 2026-04-28 unit으로 폴더 리네임 5단계 절차 보유. Pro/Max 합류 전 처리 권장 (메모리 디렉토리 동시 이전 필수 — 안 하면 `~/.claude/projects/...` 경로 깨져 메모리 못 읽음)
- **협업 중심 재브리핑**: 어제 결정 8개 영역(팀 구성 / Cycle 모델 / Git 협업 / Delegation Levels / 운영 정책 4종 / Tier 1 액션 / 정리된 학습부채 / 부수 결정)으로 재구조화. 사용자가 내일(2026-04-29) 팀과 skill 작성 들어가기 전 단일 진실의 원천 확보

**Learned**:
- **재브리핑은 작업 단위 아닌 *결정 종류*로 재구조화하는 게 효과적** — 시간순 나열은 어제 본 내용 반복이지만, "팀 구성 / Cycle / Git / AI native / 운영" 카테고리로 재배치하면 합류자에게 공유 가능한 자료로 자동 변환됨

## Pending

- [x] **(긴급)** 폴더 리네임 5단계 실행 ✔️ 2026-04-29 검증 (cwd · 메모리 디렉토리 · Vercel 프로젝트 이름 모두 `budgetroad`로 정합화 완료, 현재 세션이 정상 동작)
- [ ] 강사님 스타일 7-layer + 1+1 cycle용 skill 작성 (Pro·Max와 함께, 2026-04-29 예정). `.claude/skills/{name}/`에 git commit으로 자동 공유. 강사님이 1+1 cycle용 *경량 변형*을 명시 제시했는지 또는 본인이 7-layer를 줄일지 1회 confirm 권장 (부트캠프 평가 리스크 헤지)
- [ ] **Tier 1 (합류 직후 1주)**:
  - [ ] Branch protection 활성화 (GitHub Settings → Branches → main: PR + 1 review + CI 통과 + Restrict pushes)
  - [ ] README.md 재작성 (next-app 기본 → 30분 onboarding: 사전 요구·setup·운영 URL·AI native 합의 포인터·`/team-init` 안내·첫 PR 가이드)
  - [ ] `.github/PULL_REQUEST_TEMPLATE.md` 추가 (What/Why/AI assistance/Test plan/Related 5블록)
  - [ ] CLAUDE.md "AI 역할 분담 (Delegation Levels L0~L3)" 섹션 추가
  - [ ] CLAUDE.md "Skill 관리 정책" 섹션 추가 (글로벌/프로젝트/승격 기준)
  - [ ] 합류자 onboarding 메시지 1통 (collaborator 초대 + clone + `/team-init` 3단계)
- [ ] **Tier 2 (Cycle 2 안)**: Vitest 1개 함수 (`calculateBudget`) 도입. 부트캠프 안에선 풀 e2e 무리, 0→1 진보가 가장 큼
- [ ] **Tier 3 (부트캠프 후 / 필요 시)**: e2e (Playwright), Storybook, Husky 재고려, Renovate/Dependabot
- [ ] (선택) `package.json` name 정리: `fearnot-ai` → `budgetroad` (잔재)
- [ ] (선택) CLAUDE.md / `.omniscitus/history/...` 본문에 남은 `wedding-budget` 텍스트 잔재 정리
- [ ] **Cycle 2 Bet 후보 정식 결정**: "회귀 기대감 가설 — 결과 저장 기능" Pitch 작성(Max 영역). KPI #4 7일 재방문 1% 신호 직격

## Notes

- **Cycle 정렬**:
  - Cycle 1 (~5/17): 사실상 완료 직전 (223명 = 30명 목표 7배 초과). 정식 마무리는 Cool-down 1주 (5/11~5/17)
  - Cycle 2 (5/18~6/7): 단일 Bet 1개. 본인+Pro+Max 각자 영역 기여
  - Cycle 3 (6/8~6/28): 누적 데이터 기반 학습 가설 + 부트캠프 발표·회고
- **합류 후 Cycle 2 매핑 예시**:
  - 본인: `time_on_result_sec` 추가 + Supabase 인덱스 최적화 + Pro·Max PR 리뷰
  - Pro: 결과 페이지 카피 A/B 후보 3안 + 사용자 후기(인스타 DM·구글폼) 카드 정리
  - Max: Cycle 2 Pitch 작성 + KPI #4 원인 SQL 분석 + Cycle 3 후보 데이터 준비
- **관련 unit (closed 처리됨)**:
  - `product/2026-04-22-market-entry-pivot.md` — 시장 진입 모드 본 unit. 50명 트리거 충족으로 close, 본 unit이 후속
  - `devops/2026-04-19-ga4-looker-analytics-setup.md` — 16/16 KPI 운영 진입으로 close (`superseded_by: supabase-migration`)
- **관련 unit (active)**: `devops/2026-04-28-tooling-rotation-and-rename-prep.md` — 폴더 리네임 5단계 절차 보유. Pending에 핵심 액션
- **관련 메모리**:
  - `project_2026-04-22-council-decision` (RESOLVED 2026-04-28, 후속 결정 섹션 보유)
  - `feedback_doc_chaining` (CLAUDE.md 줄 수 한도 정책 근거 — 포인터만 남기기)
  - `feedback_design_workflow` (5단계 파이프라인, 이번 Cycle 모델과 직교 — 디자인 vs 운영)
- **Cycle 1 Bet 회고 자료** (참고용): KPI #4 7일 재방문 1% / #5 결과 후 재방문 1% / #6 공유 후 재방문 3% — 모두 한 자릿수. 한국 결혼=집단 의사결정 가설(린 지적, 4/22 Council)과 정합. Cycle 2 가설 "결과 저장 시 회귀 기대감 ↑ → #4·#5 상승" 직결
