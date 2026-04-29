# 팀 공유 기준선 — Value Proposition + 학습·결정 워크플로우

**Participants**: mincheol.kim, claude

## Summary
Pro·Max 합류 후 팀이 공유할 두 기준선 문서 정착. (1) Value Proposition Workshop 4-step 결과를 `docs/VALUE_PROPOSITION.md`로 doc화 — Statement 1~2 문장 + 5 Layer + Position vs Alternatives + Philosophy boundary. (2) 학습·결정 8단계 워크플로우를 `docs/WORKFLOW.md`로 doc화 — 지표→누적→문제→정제→발산→결정→검토→실행 + 단계별 skill 매핑.

## Context

- **Background**:
  - team-collab-setup unit 결정(Pro·Max 합류 + Cycle 모델 + Delegation Levels)은 *체제*는 정의했으나 *무엇을 만드는가(VP)*와 *어떻게 결정하는가(Workflow)*는 미정리
  - 합류자 1순위 학습 자료가 필요한 시점 — Statement 외우기 + 단계별 도구 사용법
- **Requirements**:
  - VP: 합류자가 외울 수 있는 Statement 1~2 문장 + 의사결정 가이드(Roadmap scope·카피·구현 결정에 직접 활용)
  - Workflow: 8단계 흐름 + 각 단계별 사용 가능 skill 명시(plugin vs 프로젝트 구분)
- **Decisions**:
  - **VP 5 Layer 구조 채택**: Target / Before / After / Position / Philosophy. After State는 Transformation arc(레퍼런스 → 인지 → 통제 → 자기 기준 → **확신**)로 정서 호 명시
  - **3축 동시 차별화 명시**: 비용 0 + 즉시 + 통계 기반. Google Sheet·플래너·SNS 등 6개 대체 도구 갭 비교표
  - **Philosophy boundary 명문화**: "사람 역할 대체 X, 데이터·기능 자동화만 제공". AI 컨설팅 챗봇·플래너 매칭은 *우리 scope 외*로 사전 고정
  - **Workflow 8단계 + skill 매핑**: 지표(GA4/Looker/Supabase) → 누적(`omniscitus:wrap-up` + `gstack-learn` 양립) → 문제 발견(`clarify:unknown` / `feedback-council` / `gstack-plan-ceo-review` / `gstack-office-hours`) → 정제(`clarify:vague` / `find-context`) → 발산(`superpowers:brainstorming`) → 결정(`gstack-plan-eng-review` / `prd-collab` / `superpowers:writing-plans`) → 검토(`gstack-autoplan`, 선택) → 실행(`superpowers:executing-plans` / `omniscitus:follow-up`)
  - **plugin vs 프로젝트 skill 구분 명시**: plugin은 노트북별 설치, 프로젝트는 git clone으로 자동 공유. 합류자에게 어떤 도구가 즉시 사용 가능한지 가시화
- **Constraints**:
  - 두 문서 모두 untracked 상태 → 합류 전 main 반영 필요
  - WORKFLOW의 skill 매핑은 *현재 사용 중* 도구만 — 합류 후 `feedback-council`·`gstack-codex` 등 활용 사례는 추후 보강

## Timeline

### 2026-04-29
**Focus**: 학습·결정 워크플로우 문서화 (`docs/WORKFLOW.md`)

- 8단계 흐름 + 단계별 skill 표 작성. 각 표에 출처(plugin vs 프로젝트) 명시
- "지표 결과 → 새 문제 발견" 단계를 ⭐ 핵심 단계로 표시 — 직감을 *반복 가능한* 공정으로 전환
- 사용 원칙 5개: 전부 안 돌려도 됨 / 1인 vs 팀 / plugin vs 프로젝트 / 데이터 부재 시 조작 금지
- 관련 자산 포인터: 16 KPI 매핑표·Looker SQL·메모리 경계 정책·Skill 비교 가이드

**Learned**: skill을 *역할 분담* 관점으로 묶으면 합류자에게 도구 풀 자체가 단계별 의사결정 트리로 변환됨 — "어느 skill을 언제 쓰나"가 자연스러워짐

### 2026-04-30
**Focus**: Value Proposition Workshop 결과 문서화 (`docs/VALUE_PROPOSITION.md`)

- 4-step 워크숍(Before / After / Position / Statement) 결과를 5 Layer 구조로 정착
- Statement 1~2 문장 본문화 — "결혼 막 결정한 사람이 3분 안에 첫 예산 그림을 손에 쥐도록, 웨딩 플래너 컨설팅 중 데이터·기능 영역만 무료로 떼어낸 도구. 사람 역할은 그대로 둠"
- Before State 정서 구성(정보 결핍·절차 결핍·사회적 비교 갈증·사회적 학습 욕구·스트레스) + After State Transformation arc 5단계 분해
- Position: 6개 대체 도구 갭 표 + 3축 동시 차별화(비용 0 + 즉시 + 통계 기반)
- Philosophy boundary로 *안 할 것* 자동 필터: AI 챗봇·플래너 매칭 사전 제외
- 의사결정 가이드 4항목: Cycle 2 결정 검증 / 카피 일관성 / Roadmap scope / 합류자 onboarding 1순위

**Learned**: VP를 *저장*해두면 매 결정마다 정서 호("막막함 → 확신")로 sanity check 가능 — *방향 자체*에 대한 의심을 줄여 결정 속도 ↑

## Pending
- [ ] PR 머지 후 CLAUDE.md "팀 운영" 섹션에 두 문서 포인터 추가 (현재 CLAUDE.md에 `docs/*` 운영 문서 참조 없음)
- [ ] WORKFLOW.md 미매핑 단계 보강 — `feedback-council`·`gstack-codex` 활용 사례 추후 추가
- [ ] VP Statement 한 줄 외우기를 합류자 onboarding 1순위로 — `team-collab-setup` Tier 1 자료 묶음에 반영

## Notes
- **선행 unit**: `product/2026-04-28-team-collab-setup.md` — 두 문서 모두 합류 전 베이스라인 자료로 직접 연결
- **관련 자산**:
  - `.omniscitus/history/devops/2026-04-24-supabase-migration.md` — 16 KPI 매핑표 (WORKFLOW 1단계 지표 해석 근거)
  - `.claude/skills/plugin-guide/SKILL.md` — Skill 출처 비교 (WORKFLOW 사용 원칙 #4)
- **Workshop 진행 기록**: VP 워크숍 자체의 step별 진행은 별도 unit으로 미정리 — 필요 시 향후 분리 가능
