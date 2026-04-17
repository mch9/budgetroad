# 디자인 디렉토리 구조 세팅

## Summary
Pencil .pen 파일을 design/ 디렉토리에 shared/master/experiment 3계층으로 체계화. 피그마 API로 새 디자인 시스템을 분석하고 Pencil로 이전 시도. .pen 파일의 repo 저장 문제 발견.

## Context
- **Background**: .pen 파일이 docs/prd/ 등에 흩어져 있거나 유실되어 디자인 산출물 관리가 안 되는 상태
- **Requirements**: 디자인 파일을 repo 안에서 체계적으로 관리, 개발자가 참조할 수 있는 구조
- **Decisions**: shared(토큰/공통)/master(확정)/experiment(실험) 3계층 채택; CLAUDE.md에는 세부사항 대신 design/README.md 포인터만 추가 (문서 체이닝 패턴)
- **Constraints**: Pencil MCP가 filePath로 지정해도 실제 repo 파일시스템에 .pen을 저장하지 않는 문제 발견. 에디터 내부에만 존재. 저장 방법 해결 필요

## Timeline

### 2026-04-15
**Focus**: design/ 디렉토리 구조 생성 + 기존 파일 이동 + README 작성
- design/shared/, design/master/, design/experiment/ 디렉토리 생성
- docs/prd/budget-builder/budget-draft-wireframe.pen → design/master/budget-draft.pen 이동
- design/README.md 작성 (폴더 역할, 참조 가이드, .pen 파일 규칙)
- CLAUDE.md 프로젝트 구조에 design/ 추가 + 디자인 시스템 섹션에 README.md 포인터 추가
- main 푸시 → Vercel 배포

**Learned**: CLAUDE.md에 모든 세부사항을 쓰지 않고, 상황별로 참조할 문서의 포인터만 남기면 context를 아끼면서도 필요할 때 정확한 정보를 로드할 수 있음

### 2026-04-15 (session 2)
**Focus**: 피그마 API로 디자인 토큰 추출 + Pencil로 화면 이전 시도
- Figma REST API로 파일 구조, 컬러(#F9FAFB, #AAC7E1, #373737 등), 폰트(Pretendard, Geist) 추출
- 15개 화면 이미지 다운로드 및 분석 (인트로 v1~v4, 시뮬레이션, 결과)
- Pencil MCP로 design-dna.pen(토큰), home.pen(인트로), budget-draft.pen(시뮬/결과) 생성
- 파일 분리 과정에서 Pencil 단일 문서 상태 공유 문제 발견 → 삭제 시 전체 소실
- 재생성 후 확인 — Pencil 에디터 내부에서는 정상이나 repo 파일시스템에 미저장 확인

**Learned**: Pencil MCP는 에디터 내부 문서 공간에서 작업하며, filePath 파라미터가 실제 파일시스템에 .pen을 저장하지 않음. 별도 저장 메커니즘 필요

## Pending
- [x] Pencil .pen 파일을 repo 파일시스템에 저장하는 방법 해결 ✔️ 2026-04-17 (design/shared/design-dna.pen, design/master/home.pen, budget-draft.pen 저장 확인)
- [ ] 피그마 라인아트 일러스트를 Pencil로 이전 (현재 placeholder)
- [ ] shared/components.pen 생성 (공통 컴포넌트)
- [ ] 로고&타이틀 페이지 Pencil 이전

## Notes
- 문서 체이닝 패턴은 feedback 메모리에도 저장됨
- 피그마 파일: File Key ln357t0WYrrMCjyQ9ncQ0N (UI Design)
- 새 디자인 시스템: #FF8400 오렌지 → #AAC7E1 블루, Geist → Pretendard
