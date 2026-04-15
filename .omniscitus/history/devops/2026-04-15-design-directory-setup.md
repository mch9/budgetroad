# 디자인 디렉토리 구조 세팅

## Summary
Pencil .pen 파일을 design/ 디렉토리에 shared/master/experiment 3계층으로 체계화. CLAUDE.md에 문서 체이닝 포인터 추가.

## Context
- **Background**: .pen 파일이 docs/prd/ 등에 흩어져 있거나 유실되어 디자인 산출물 관리가 안 되는 상태
- **Requirements**: 디자인 파일을 repo 안에서 체계적으로 관리, 개발자가 참조할 수 있는 구조
- **Decisions**: shared(토큰/공통)/master(확정)/experiment(실험) 3계층 채택; CLAUDE.md에는 세부사항 대신 design/README.md 포인터만 추가 (문서 체이닝 패턴)
- **Constraints**: shared/design-dna.pen, shared/components.pen은 아직 미생성 — 다음 Pencil 작업 시 생성 예정

## Timeline

### 2026-04-15
**Focus**: design/ 디렉토리 구조 생성 + 기존 파일 이동 + README 작성
- design/shared/, design/master/, design/experiment/ 디렉토리 생성
- docs/prd/budget-builder/budget-draft-wireframe.pen → design/master/budget-draft.pen 이동
- design/README.md 작성 (폴더 역할, 참조 가이드, .pen 파일 규칙)
- CLAUDE.md 프로젝트 구조에 design/ 추가 + 디자인 시스템 섹션에 README.md 포인터 추가
- main 푸시 → Vercel 배포

**Learned**: CLAUDE.md에 모든 세부사항을 쓰지 않고, 상황별로 참조할 문서의 포인터만 남기면 context를 아끼면서도 필요할 때 정확한 정보를 로드할 수 있음

## Pending
- [ ] shared/design-dna.pen 생성 (컬러, 폰트, 간격 등 디자인 토큰)
- [ ] shared/components.pen 생성 (버튼, 카드, 입력필드 등 공통 컴포넌트)
- [ ] master/home.pen 생성 (랜딩 페이지 확정 디자인)

## Notes
- 문서 체이닝 패턴은 feedback 메모리에도 저장됨
