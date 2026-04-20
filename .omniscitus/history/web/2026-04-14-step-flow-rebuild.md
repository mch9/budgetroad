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
- 결과 카드 텍스트 크기 Figma 기준 조정 (제목 medium, 뱃지 regular, 금액 52px)
- main 푸시 → Vercel 프로덕션 배포 완료

**Learned**: CSS conic-gradient 파이차트는 세그먼트 간 구분선 표현이 어려움. SVG arc path + stroke로 전환하면 흰색 간격과 도넛(링) 형태 모두 자연스럽게 구현 가능

### 2026-04-16 (session 2)
**Focus**: 팀 조사 데이터 반영 + 예단 제거 + 입력 UI 통일
- budget-data.ts 전면 교체: 팀원(장동화와 아이들)이 조사한 실제 데이터(한국소비자원+공여사들 기반 Median/분위수)로 교체
- 대관료: 추정치 → 지역×유형별 Median 값 (강남 컨벤션 700→1360만 등 약 2배 상향)
- 스드메: 전국 공통 단일값 → 지역×시즌×등급(P10/P50/P90) 3차원 테이블
- 예식장 유형: 하우스 → 전통혼례 교체
- 예물: 300/650/1000 → 600/1800/3000만원
- 보증인원: 100~400 → 150~300, 식사비용: 5/7/10 → 6/9/12/15만원
- 표준 식사비 테이블 추가 (지역×유형별 Median), Step4에서 직접 입력 첫 항목으로 표준 가격 세팅
- 예단(yedan) 항목 Step5에서 완전 제거, 예물에 직접 입력 옵션 추가
- 모든 숫자 입력 필드 통일: type="number" 스피너 제거 → type="text" + inputMode="numeric"
- 입력 카드 레이아웃 통일: `라벨 왼쪽 — 입력(w-28)+단위 오른쪽` 패턴으로 4곳 정리
- 입력 필드 font-mono 제거 → 시스템 폰트 통일 (Geist Mono는 결과 페이지 금액 전용)

**Learned**: type="number"의 기본 스피너는 만원 단위 입력에서 UX를 해침. type="text" + inputMode="numeric"으로 변경하면 스피너 없이 모바일에서는 숫자 키패드가 뜸

### 2026-04-19
**Focus**: 데이터 없는 예식장 조합 UI 차단 + 스드메 가격 스왑 버그 수정 + 1.5x 시장 조정 계수 도입
- `isVenueDisabled(region, venueType)` 헬퍼 추가 (`VENUE_PRICES[region][venueType] === 0` sentinel 감지) — 강남+전통혼례 조합을 Step2에서 "데이터 없음" pill + muted 스타일 + `cursor-not-allowed`로 비활성
- `OptionCard`에 `disabled` prop 추가 (early return으로 `bg-[#F9FAFB]` + `border-[#F3F4F6]` + `text-[#9CA3AF]` 스타일 분기)
- `updateRegion` 핸들러 신설 — Step1에서 region 변경 시 현재 `venueType`이 새 region에서 disabled면 `convention`으로 자동 리셋
- 팀 스프레드시트와 코드 대조 결과 `STUDIO_PRICES` ↔ `MAKEUP_PRICES` 내용이 서로 뒤바뀐 버그 발견 (드레스는 일치). 변수명 유지, 객체 내용만 교체
- `SDM_MARKET_MULTIPLIER = 1.5` 상수 추가 + `calculateBudget`의 `sdm`/`sdmMin`/`sdmMax`에 적용 + `Math.round`로 소수점 제거
- PR #16 (venue disable + GA 이벤트 확장) + PR #17 (SDM 스왑/멀티플라이어) 각각 merge

**Learned**:
- "데이터 없음" 조합을 **UI에서 차단**하는 게 `0`/평균치로 임의 채워넣는 것보다 통계 기반 서비스 브랜드에 더 정합. 코드 계산 경로에서 sentinel을 만나지 않도록 방어선은 UI에 둔다
- 스왑 버그는 **"같은 등급 양쪽 선택" 시 우연히 총액이 맞아** 장기간 잠복 가능. 다른 등급 조합(예: 스튜디오 프리미엄 + 메이크업 실속)에서만 금액이 어긋남 → 개별 라인 아이템 표시가 없으면 한참 못 발견할 수 있음
- 가격 조정을 **데이터 교체가 아닌 명시적 상수(`SDM_MARKET_MULTIPLIER`)**로 처리하면 (a) 원본 조사 값 보존, (b) 되돌리기 1줄 수정, (c) "추후 사용자 선택 옵션"으로 확장 시 상수 → prop/state 교체만 하면 됨

## Pending
- [x] 한국소비자원 참가격 데이터로 가격 정밀도 보완 ✔️ 2026-04-16 (팀 조사 데이터로 교체)
- [x] 예식장 대관료에 지역별 차이 세분화 ✔️ 2026-04-16 (지역×유형별 Median 반영)
- [x] 드레스/메이크업 가격을 지역별로 분리 ✔️ 2026-04-16 (지역×시즌×등급 3차원 테이블)
- [x] 결과 공유 기능 구현 ✔️ 2026-04-17 (native share + clipboard fallback, og-image-social-sharing 유닛 참조)
- [x] 모바일 결과 페이지 레이아웃 세부 조정 (2컬럼→1컬럼 전환) ✔️ 2026-04-18 (page.tsx:595 `flex-col sm:flex-row` 확인)
- [x] 강남 전통혼례 데이터 보완 (현재 대관료 0원 — 데이터 없음) ✔️ 2026-04-19 (데이터 생성 대신 UI에서 해당 조합을 "데이터 없음" pill로 비활성 처리 + region 변경 시 venueType 자동 리셋 — `src/lib/budget-data.ts:isVenueDisabled`, `src/app/budget-draft/page.tsx:updateRegion`)

## Notes
- 디자인 파일: design/budget-draft-v1-step-flow.pen
- 스펙 문서: docs/prd/budget-builder/budget-draft-v1-step-flow.md
- PRs: #9 (SEO 메타데이터), #10 (STEP 플로우 재구축), #12 (Figma UI 전면 적용), #16 (venue disable + analytics events), #17 (SDM swap/multiplier)
- 팀 조사 데이터 원본: 장동화와 아이들 - 민철님은 봐라!.pdf (한국소비자원+공여사들 기반)
- SDM 1.5x 근거: "시장 조사 결과 반영해 MVP에서는 기존 금액 대비 1.5배 적용, 추후 사이클에서 선택 옵션으로 정교화 예정" (팀 결정)
