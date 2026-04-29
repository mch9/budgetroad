# 학습·결정 워크플로우 (권장)

> **Status**: 권장 패턴 (강제 X — 상황에 맞게 선택)
> **Last updated**: 2026-04-29
> **Why**: KPI 결과가 *학습*과 *새 문제 정의*로 흘러 *결정·실행*에 닿게 하는 흐름. 각 단계에서 사용 가능한 skill 매핑.

## 전체 흐름

```
지표 결과
   ↓
[누적·기록]            ← 휘발 방지
   ↓
[새 문제 발견] ⭐      ← 직감을 *반복 가능*한 공정으로
   ↓
[정제]                 ← 모호한 신호 → 액션 가능
   ↓
[해결안 발산]
   ↓
[결정·plan 작성]
   ↓
[plan 검토] (선택)
   ↓
[실행·추적]
```

## 단계별 skill 매핑

### 1. 지표 해석
- 도구: GA4 / Looker Studio / Supabase MCP
- 산출물: KPI 표, 분포 차트
- 핵심 질문: *"무엇이 약한 신호인가? 무엇이 측정 안 되고 있나?"*

### 2. 누적·기록

| Skill | 출처 | 역할 |
|---|---|---|
| `omniscitus:wrap-up` | plugin | 세션 종료 시 *unit 단위* 기록 (시점별 사실) |
| `gstack-learn` | plugin | *반복 가능한 인사이트* 영구 누적 (일반화된 법칙) |

> 둘은 *역할이 다름*: wrap-up = 역사, learn = 법칙. 둘 다 입력하는 게 표준.

### 3. 새 문제 발견 ⭐

| Skill | 출처 | 메커니즘 |
|---|---|---|
| `clarify:unknown` | plugin | Known/Unknown 4분면 — *blind spots* 노출 |
| `feedback-council` | 프로젝트 | 5명 페르소나가 각자의 새 문제 제기 |
| `gstack-plan-ceo-review` | plugin | 전제 도전, 10-star 가설 |
| `gstack-office-hours` | plugin | YC 6 forcing questions (수요 현실 등) |

> 직감으로 발견한 것을 *팀이 돌릴 수 있게* 만드는 단계. 합류 후 표준 도구.

### 4. 정제

| Skill | 출처 | 역할 |
|---|---|---|
| `clarify:vague` | plugin | 모호한 문제 → *액션 가능*한 형태 |
| `find-context` | 프로젝트 | 과거 결정·교훈 회수 — 반복 회피 |

### 5. 해결안 발산

| Skill | 출처 | 역할 |
|---|---|---|
| `superpowers:brainstorming` | plugin | 의도·요구사항·디자인 탐색 |
| `feedback-council` | 프로젝트 | 솔루션 challenge (다중 관점) |

### 6. 결정·plan 작성

| Skill | 출처 | 역할 |
|---|---|---|
| `gstack-plan-eng-review` | plugin | 단일 plan 검증 (엔지니어링 관점) |
| `prd-split` | 프로젝트 | 큰 아이디어 → 경험 단위 분해 |
| `prd-collab` | 프로젝트 | 12-step PRD 작성 |
| `superpowers:writing-plans` | plugin | 멀티스텝 plan 작성 |

### 7. plan 검토 (선택)

| Skill | 출처 | 역할 |
|---|---|---|
| `gstack-autoplan` | plugin | CEO + Design + Eng + DX 4축 자동 review |

> Trade-off: 1-shot 빠른 review, 자동 결정 (취향 안 맞을 수 있음). plan이 *충분히 구체적*일 때만 가치. 단일 축이 결정적이면 개별 `gstack-plan-*-review`가 적합.

### 8. 실행·추적

| Skill | 출처 | 역할 |
|---|---|---|
| `superpowers:executing-plans` | plugin | plan 실행 + 검토 체크포인트 |
| `omniscitus:follow-up` | plugin | pending 추적, 코드 검증 |

## 사용 원칙

1. **각 단계 skill 1개씩 *전부* 돌릴 필요 없음** — 상황별 선택
2. **1인 작업**: 직감 + 핵심 skill 1~2개
3. **팀 작업** ★: 다중 관점 skill(`feedback-council`, `gstack-autoplan`) 가치 큼
4. **plugin vs 프로젝트 구분**:
   - **plugin** (`omniscitus:`, `gstack-`, `clarify:`, `superpowers:`): *각 노트북별 설치 필요*
   - **프로젝트** (`prd-*`, `find-context`, `cto-council`, `feedback-council`): git clone으로 자동 공유
5. **데이터 부재 시 조작 금지** — 측정 안 된 영역은 "데이터 부재"로 명시 (메모리: `feedback_missing_data_ux`)

## 관련 자산
- 16 KPI 매핑표: `.omniscitus/history/devops/2026-04-24-supabase-migration.md` (Notes)
- KPI Funnel Rates SQL: Looker Studio + Supabase `events` 테이블
- 메모리 경계 정책: `.omniscitus/history/product/2026-04-28-team-collab-setup.md`
- Skill 출처 비교: `.claude/skills/plugin-guide/SKILL.md`
