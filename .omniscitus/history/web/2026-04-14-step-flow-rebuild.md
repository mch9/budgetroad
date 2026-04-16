# 예산 초안 6단계 STEP 플로우 재구축

## Summary
기존 한 화면 입력 방식을 6단계 STEP 플로우로 전면 재구축. 새 데이터 모델(지역/예식장/시기/스드메 등급/식사/예물·예단/신혼여행)과 도넛 차트 + 항목별 바 차트 결과 페이지 구현.

## Context
- **Background**: 기존 체크박스 기반 입력이 너무 단순하여, 사용자별 조건을 세밀하게 반영한 예산 계산이 필요했음
- **Requirements**: 6단계 순서(지역→예식→스드메→식사→예물예단→신혼여행), 카드 기반 선택 UI, 생략 가능 항목, 직접 입력 옵션, 결과 도넛 차트 + 바 차트
- **Decisions**: 한국소비자원 + 공여사들 가격 데이터 기반; 스드메는 서울강남 기준 중간값 사용; 식사는 보증인원×1인당비용 동적 계산; 신혼여행 금액 수정은 카드 내부에 인라인 배치
- **Constraints**: 데이터는 MVP 수준 (나중에 한국소비자원 참가격 데이터로 보완 예정)

## Timeline

### 2026-04-14
**Focus**: 데이터 모델 재구축 + STEP 플로우 UI + 결과 페이지
- Pencil로 7개 화면 디자인 (STEP 1~6 + 결과) → design/budget-draft-v1-step-flow.pen 저장
- 스펙 문서 작성 → docs/prd/budget-builder/budget-draft-v1-step-flow.md
- budget-data.ts 전면 재작성: 새 Region(강남/강남외/경기), VenueType×Season 가격표, Tier별 스드메, 예물/예단/신혼여행
- page.tsx 전면 재작성: 6단계 STEP 상태 관리, OptionCard 재사용 컴포넌트, 프로그레스 바
- 결과 페이지: 200px 도넛 차트(총 예산 범위 포함) + 2열 범례 + 항목별 바 차트 + 미포함 표시
- 신혼여행 금액 수정 필드를 카드 내부 인라인으로 이동
- budget-draft/layout.tsx 추가 (페이지별 SEO 메타데이터)
- PR #9, #10 → main 머지 → Vercel 배포 완료

**Learned**: 'use client' 페이지에서는 metadata export가 불가하므로 같은 폴더에 layout.tsx를 두어 서버 컴포넌트로 메타데이터 설정

### 2026-04-16
**Focus**: Figma MVP UI 확정 기반 전면 스타일 리디자인 + 결과 페이지 재구축
- 오렌지(#FF8400) → 블루-그레이(#AAC7E1) 테마 전환
- 스텝 카드: 선택 시 rgba(170,199,225,0.3) 배경 + #AAC7E1 테두리, 체크 SVG 아이콘
- 프로그레스 바: "단계 X/Y" + "X% 완료" 라벨 추가, 8px 높이, #AAC7E1 채움
- 버튼: #373737 다크, border-radius 14px
- 콘텐츠 너비: max-w-[576px] 중앙 정렬 (데스크톱)
- 결과 페이지: 2컬럼 레이아웃(총액 카드 670px + 도넛 차트 320px)
- 도넛 차트: SVG arc 기반 링 형태, 흰색 구분선
- 항목별 바 차트: 카드 없이 border-bottom 구분, 24x24 컬러 사각형(radius 6px)
- 금액 단위: 만원 → 원 변환 (예: 4,815만 → 48,150,000원)
- 결과 카드: "결혼 예상 비용" + "총합" 뱃지, 선택 항목 요약 표시 (범위 텍스트 대체)
- sessionStorage로 결과 페이지 새로고침 시 데이터 + 선택값 보존
- 하단 버튼: 672px, 78px 높이, border-radius 24px
- 한글 세리프 로고(버짓로드) 네비바 적용

**Learned**: CSS conic-gradient 파이차트는 세그먼트 간 구분선 표현이 어려움. SVG arc path + stroke로 전환하면 흰색 간격과 도넛(링) 형태 모두 자연스럽게 구현 가능

## Pending
- [ ] 한국소비자원 참가격 데이터로 가격 정밀도 보완
- [ ] 예식장 대관료에 지역별 차이 세분화 (현재는 대략적 추정치)
- [ ] 드레스/메이크업 가격을 지역별로 분리 (현재는 전국 공통)
- [ ] 결과 공유 기능 구현 ("결과 공유하기" 버튼 현재 미연결)
- [ ] 모바일 결과 페이지 레이아웃 세부 조정 (2컬럼→1컬럼 전환)

## Notes
- 디자인 파일: design/budget-draft-v1-step-flow.pen
- 스펙 문서: docs/prd/budget-builder/budget-draft-v1-step-flow.md
- PRs: #9 (SEO 메타데이터), #10 (STEP 플로우 재구축), #12 (Figma UI 전면 적용)
