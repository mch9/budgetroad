# 예산 초안 생성 기능 PRD

**Status**: closed (2026-04-24) — MVP PRD(v0)는 완료·구현까지 끝남. Phase 2/3 PRD(링크 공유·저장)는 1인 초안 대신 팀 합의 후 `/prd-collab`으로 재작성 방침. Pending의 Phase 2/3 작성 항목은 obsolete.

## Summary
결혼 예산 초안 자동 생성(budget-draft) 기능의 상세 PRD를 12단계 워크플로우로 완성.
경험 로드맵 분해(3개 경험) → MVP 경험의 요구사항, 화면 설계, 와이어프레임, UX Writing, 하이파이 디자인까지 전체 완료.

## Context
- **Background**: CLAUDE.md에 정의된 프로덕트 비전을 실제 구현 가능한 상세 기획으로 발전시키기 위해 시작
- **Requirements**: 결혼 유형 선택 → 통계 기반 예산 자동 생성 → 테이블+차트 결과 확인의 핵심 플로우
- **Decisions**: 입력/결과를 한 페이지(/budget-draft)에서 상태 전환으로 처리; 도넛 차트 선택; Geist Mono 폰트를 금액 표시에 사용; Primary #FF8400
- **Constraints**: MVP에서는 DB/API 없이 정적 데이터로 구현; 공유/저장 기능은 Phase 2/3으로 분리

## Timeline

### 2026-04-11
**Focus**: 경험 로드맵 분해 + budget-draft PRD 12단계 전체 완성
- /prd-split으로 3개 경험 분해 (MVP: 예산 초안, Phase 2: 공유, Phase 3: 저장)
- /prd-collab 12단계 워크플로우 실행 (Step 0~11 전체 완료)
- Pencil로 와이어프레임 6개 화면 (데스크톱+모바일 × 랜딩/입력/결과)
- 하이파이 디자인 적용 (그라디언트 배경, 그림자, Geist 폰트)
- UX Writing 전체 텍스트 확정

**Learned**: 와이어프레임 단계에서 이미 스타일을 적용해두면 하이파이 전환이 빠름

## Pending
- [ ] Phase 2 경험 (링크 공유) PRD 작성
- [ ] Phase 3 경험 (저장/마이페이지) PRD 작성

## Notes
- PRD 파일: `docs/prd/budget-builder/budget-draft-v0.md`
- 로드맵 파일: `docs/prd/ROADMAP.md`
- Pencil 와이어프레임/하이파이: `pencil-welcome-desktop.pen`
