# Tooling 워크플로우 로테이션 + 폴더 리네임 준비

**Participants**: mincheol.kim, claude

## Summary
gstack 스킬 셋의 시장 진입 모드용 활용 전략을 정리해 사이클 단계별 주력 스킬 2~3개를 선정. 사용 안 하는 `/prd-onepager` 스킬 제거. 로컬 폴더(`wedding-budget` → `budgetroad`) 리네임의 영향 범위를 감사하고 5단계 안전 절차 설계.

## Context
- **Background**: 시장 진입 모드(2026-04-22 council 결정) 진입 후 워크플로우를 단순화하기 위해 어떤 스킬을 주력으로 쓸지 정리할 필요. GitHub 리포는 이미 `budgetroad`인데 로컬 폴더는 `wedding-budget`이라 정합성도 점검.
- **Requirements**: (1) gstack 일반 활용 가이드 (2) 새 기능 기획용 주력 스킬 2~3개 추천 (3) 사용 안 하는 스킬 정리 (4) 폴더 리네임 가능성·절차 검증.
- **Decisions**:
  - **gstack 일반 사이클 핵심 3개**: `/gstack-browse`(QA) → `/gstack-investigate`(디버깅) → `/gstack-ship`(배포). 보조: careful·canary·context-save.
  - **기획 단계 주력 2개**: `/gstack-office-hours`(WHY) + `/gstack-plan-eng-review`(HOW). `/gstack-plan-ceo-review`는 시장 진입 모드에서 SCOPE EXPANSION 함정 우려로 후순위(HOLD 모드만 사용).
  - `/prd-onepager` 제거: `/gstack-office-hours → /gstack-plan-eng-review` 흐름이 더 적합.
  - 폴더 리네임은 가능하나 **단순 `mv` 외에 메모리 디렉토리 이전(`~/.claude/projects/`)·Vercel 프로젝트 이름 변경 필요**. 현재 세션의 cwd가 변경 대상이라 직접 실행 불가 → 사용자가 별도 셸에서 수동 실행.
- **Constraints**:
  - 현재 세션 cwd가 변경 대상 폴더라 Claude Code 내에서 직접 `mv` 불가
  - Vercel 프로젝트 이름은 대시보드에서 별도 처리
  - `package.json` name이 `fearnot-ai` 잔재로 남아있음 — 별개 정리 필요

## Timeline

### 2026-04-28
**Focus**: gstack 워크플로우 정비 + 폴더 리네임 준비
- gstack 일반 활용 가이드 정리: browse · investigate · ship 3개 주력 + careful · canary · context-save 보조.
- 기획용 gstack 주력 스킬 추천: office-hours(WHY) + plan-eng-review(HOW). CEO review는 HOLD 모드만 권장(시장 진입 모드에서 SCOPE EXPANSION 함정).
- omniscitus vs gstack 역할 분담 표 정리: omniscitus는 기록·추적·기술 자문, gstack은 사이클 단계별 실행 도우미.
- `/prd-onepager` 스킬 제거 (commit `4689d90`, 1 file deleted).
- 폴더 리네임 영향 범위 감사: GitHub 리포 이미 `budgetroad` ✅ / Vercel 프로젝트 이름 `wedding-budget` ⚠️ / `package.json` name `fearnot-ai` 잔재 ⚠️ / Claude Code 메모리 디렉토리 경로 ⚠️.
- 리네임 5단계 절차 설계: ① wrap-up + commit → ② 세션 종료 → ③ `mv` 폴더 + 메모리 디렉토리 동시 이전 → ④ Vercel 대시보드에서 프로젝트 이름 변경 → ⑤ 새 폴더에서 Claude Code 재시작.
- 미커밋 omniscitus 히스토리 sync 일괄 커밋 (commit `79e6a97`).

**Learned**: omniscitus와 gstack은 역할이 자연스럽게 갈림 — omniscitus는 "무엇을 했고 왜 했는지"를 기록(follow-up·wrap-up·cto-council), gstack은 "지금 무엇을 어떻게 할지"의 사이클 도우미(browse·ship·investigate). 두 시스템을 겹치지 않게 운영하면 단순함을 유지할 수 있음.

## Pending
- [ ] 폴더 리네임 실행 (별도 셸): `mv ~/Documents/GitHub/wedding-budget ~/Documents/GitHub/budgetroad` + `~/.claude/projects/-Users-mch-Documents-GitHub-wedding-budget` → `...-budgetroad` 동시 이전
- [ ] Vercel 프로젝트 이름 변경 (`wedding-budget` → `budgetroad`)
- [ ] 새 폴더에서 Claude Code 재시작
- [ ] (선택) `package.json` name 정리: `fearnot-ai` → `budgetroad`
- [ ] (선택) `CLAUDE.md`·`.omniscitus/history/...` 본문에 남은 `wedding-budget` 텍스트 잔재 정리

## Notes
- 관련 unit: `devops/2026-04-14-rebrand-budgetroad` — 도메인·서비스 이름 리브랜딩 시 폴더 이름은 유보. 이번 세션에서 그 후속으로 폴더 이름까지 정합화 준비.
- 관련 unit: `product/2026-04-22-market-entry-pivot` — 시장 진입 모드 전환의 일환으로 워크플로우 단순화.
