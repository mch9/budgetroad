# Design System

Pencil MCP로 관리하는 `.pen` 디자인 파일의 구조와 참조 가이드.

## 디렉토리 구조

```
design/
├── shared/          # 디자인 토큰 + 공통 컴포넌트
│   ├── design-dna.pen    — 컬러, 폰트, 간격, 그림자 등 디자인 토큰
│   └── components.pen    — 버튼, 카드, 입력필드 등 재사용 컴포넌트
├── master/          # 확정 디자인 (현재 배포 기준)
│   ├── home.pen          — 랜딩 페이지 (/)
│   └── budget-draft.pen  — 예산 초안 생성 (/budget-draft)
└── experiment/      # 실험 디자인 (A/B 테스트, 다음 버전 시안)
    └── {page-name}.pen   — 검증 중인 디자인 변형
```

## 각 폴더의 역할

| 폴더 | 목적 | 변경 시점 |
|------|------|----------|
| `shared/` | 디자인 토큰과 공통 컴포넌트 정의 | 브랜딩/디자인 시스템 변경 시 |
| `master/` | 배포 중인 화면의 확정 디자인 | 디자인 변경이 개발 완료되어 배포될 때 |
| `experiment/` | 검증 중인 시안, 새 버전 탐색 | 자유롭게 생성/삭제 가능 |

## 참조 가이드

### UI 구현/수정할 때
1. `master/{page}.pen`을 열어 확정 디자인 확인
2. 컬러/폰트 등 토큰이 필요하면 `shared/design-dna.pen` 참조
3. 공통 컴포넌트 스타일은 `shared/components.pen` 참조

### 새 디자인을 만들 때
1. `experiment/{page}.pen`에 시안 작성
2. 확정되면 `master/{page}.pen`으로 이동 (기존 파일 덮어쓰기)

### 디자인 토큰 변경할 때
1. `shared/design-dna.pen` 수정
2. 영향받는 `master/` 파일들도 함께 업데이트

## .pen 파일 규칙

- `.pen` 파일은 Pencil MCP 도구로만 읽고 쓸 수 있음 (Read/Grep 사용 불가)
- 파일명은 URL 경로와 매칭: `home.pen` → `/`, `budget-draft.pen` → `/budget-draft`
- experiment 파일이 master로 승격되면 experiment에서 삭제
