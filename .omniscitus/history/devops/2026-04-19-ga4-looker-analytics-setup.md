# GA4 + Looker Studio 분석 파이프라인 구축

**Participants**: claude, mincheol.kim

## Summary
운영 분석 PRD의 자체 DB 경로를 **MVP용 GA4+Looker Studio 경량 경로로 피벗**. trackEvent 이벤트 파라미터 확장, GA4 커스텀 측정기준 16개 수동 등록, Looker Studio 첫 차트 구성. 16개 KPI 중 14~15개를 GA4만으로 관측 가능함을 검증.

## Context
- **Background**: `/follow-up` 리뷰에서 analytics-dashboard-prd의 pending 5개(Event 모델/API/trackEvent 병행/admin 대시보드/인증)가 입문자 단독 구현 부담 + MVP 단계 scope 과다로 진입 장벽 역할. 사용자가 "이렇게 할 일 많은 게 설계 잘못이냐"는 불안 표출 → GA4+Looker Studio 대안 경량화 경로 제안 → 채택
- **Requirements**:
  - 16개 KPI 전부 관측 가능성 담보
  - 개발 작업량 최소화 (DB/API/admin 페이지 스킵)
  - 데이터 보관 장기화 및 락인 방지
- **Decisions**:
  - **자체 DB + 자체 대시보드 → GA4 + Looker Studio로 전환**. 자체 DB는 Phase 2(공유 링크)/Phase 3(저장·마이페이지) 시 사용자 기능 구현 맥락에서 자연스럽게 합류 예정
  - trackEvent에 `back_clicked` 이벤트 추가(KPI #9), `result_viewed`에 선택 파라미터 11개 확장(KPI #16) — 나머지 이벤트는 기존 그대로
  - `SDM_MARKET_MULTIPLIER` 상수 도입은 step-flow-rebuild에 속함(여기서는 파라미터로 수집만)
  - Looker Studio에서 **GA4 native "신규/재방문" 차원 사용**(커스텀 `is_returning` 대신) — `TrackPageEnter`가 `/` 랜딩에만 붙어있어 다른 이벤트는 `(not set)` 다수 발생하는 문제
  - BigQuery export 활성화 권장 (14개월 retention 한계 극복)
- **Constraints**:
  - GA4 무료 플랜 이벤트 데이터 기본 2개월·최대 14개월 보관. 이후엔 집계 리포트만 남고 이벤트 원본 삭제
  - `debug_mode=1` URL 파라미터만으로는 GA4 DebugView에 반드시 잡히지 않음(gtag 설정에 따라 다름). 확실한 방법은 Chrome 확장 "Google Analytics Debugger" 설치
  - GA4 property당 커스텀 측정기준 50개 / 측정항목 50개 / 이벤트 종류 500개 / 이벤트당 파라미터 25개 한도. 현재 사용량(측정기준 12 / 측정항목 4 / 이벤트 7 / 최대 파라미터 12)은 여유 매우 큼

## Timeline

### 2026-04-19
**Focus**: 세션 전반에 걸쳐 설계 불안 해소 → 경량 경로 선택 → 실제 연결 검증 → 첫 차트 완성

- `/follow-up`으로 10개 open unit 26 pending 재확인 → "analytics pipeline이 3개 unit(neon-db-setup + analytics-dashboard-prd + visitor-tracking) 공통 블로커" 판단, 하지만 현 scope에 과함
- `trackEvent` 확장 (PR #16):
  - `back_clicked` 이벤트 + `from_step` 파라미터(1-indexed)
  - `result_viewed`에 `region`, `venue_type`, `season`, `studio_tier`, `dress_tier`, `makeup_tier`, `guest_count`, `meal_cost`, `yemul_tier`, `honeymoon_choice` 10개 파라미터 추가 (기존 `total_amount` 유지)
  - snake_case 통일 (기존 `is_returning`, `time_to_start_sec`와 맞춤)
- PR #16 merge → Vercel 프로덕션 배포
- 사용자가 GA4 커스텀 측정기준 12개 + 측정항목 4개 수동 등록 (`visitor_id`, `is_returning`, `method`, `from_step`, `region`, `venue_type`, `season`, `studio_tier`, `dress_tier`, `makeup_tier`, `yemul_tier`, `honeymoon_choice` + `time_to_start_sec`, `total_amount`, `guest_count`, `meal_cost`). 드롭다운 자동완성에 없던 3개는 **수동 타이핑**으로 등록(아직 데이터 미도착이어서)
- DebugView 초기 비어있음 진단 → `debug_mode=1` URL 파라미터만으로 불충분 판명. Network 탭 + `collect` 필터로 **204 응답 + `tid=G-B7F0E8527V`** 6건 확인 → GA 연결 정상 검증
- `result_viewed` 페이로드 확인 — `ep.region`, `ep.venue_type`, `ep.season`, `ep.studio_tier` 등 + `epn.total_amount` 전부 정상 전송 확인
- Looker Studio 첫 보고서 생성 (데이터 소스: Budgetroad GA4 property)
- 첫 차트 "일별 방문자 (신규 vs 재방문)" 구성 시도 — 커스텀 `is_returning` 사용 시 범례가 `(not set)` 1줄로만 나옴(TrackPageEnter가 `/` 랜딩에만 붙어 있어 다른 이벤트엔 파라미터 없음) → **GA4 native "신규/재방문" 차원**으로 교체하여 2줄 분기 성공
- 기간 필터 방법 3가지 정리(차트 개별 / 대시보드 상단 기간 컨트롤 / 보고서 기본값) — 운영은 상단 기간 컨트롤 권장

**Learned**:
- **GA4는 우리 서버를 경유하지 않는다**. 브라우저 → `google-analytics.com`으로 직접 HTTPS 요청. `/collect` 엔드포인트는 204 No Content가 정상 응답(응답 본문 불필요 → 네트워크 경제화). Neon DB에 이벤트 0건 쌓이는 게 맞음
- **GA4 파라미터 이름은 코드의 객체 key 문자열이 진실의 원천**. GA는 중립 수신자라 타입 검사/스키마 강제 없음 → 오타도 그대로 새 이름으로 쌓임. `eventParam 등록`은 "받은 데이터를 리포트에서 쓸 수 있게 해주는 별도 선언"으로 수집과 조회가 분리된 구조
- **등록 시점 이후 도착하는 데이터만 리포트에 잡힘** → 가능한 빨리 등록하는 게 이득. 드롭다운 자동완성은 "최근 수신된 파라미터"만 보여주므로, 첫 배포 직전에 **수동 타이핑 등록**이 바른 순서
- Looker Studio "세부 측정기준"(한글 용어) = English "Breakdown dimension". 커스텀 차원이 모든 이벤트에 안 붙으면 `(not set)` 다수 → 필터로 좁히거나 **GA4 native dim 사용이 더 정확**
- GA4 무료 플랜은 월 10M 이벤트/14개월 retention 한도 — MVP엔 여유 극심. 장기 보관은 **BigQuery export(무료) 원클릭**으로 해결. "락인" 걱정은 BigQuery export와 Data API 두 탈출 경로로 해소됨
- "자체 DB를 지금 만들어야 하는가?"의 올바른 질문 = **"GA4가 본질적으로 못하는 일이 필요한가?"**. 분석만 하려면 GA4+Looker로 충분. DB는 사용자 기능(마이페이지/저장/공유 복원)에서 자연스럽게 필요해짐 → Phase 2/3 시점에 통합

## Pending
- [ ] BigQuery export 활성화 (14개월 retention 극복 — 지금 안 켜면 과거 데이터 영영 회수 불가)
- [ ] Looker Studio 기간 컨트롤 상단 배치
- [ ] 🟢 쉬운 KPI 차트 6개 추가 (#8 공유 수 / #10 체류시간 / #11 스크롤 / #13 input 도달 시간 / #16 선택 분포 바차트 다수)
- [ ] 🟡 계산식 KPI 6개 (#1~#3, #7, #9, #12) — "계산된 필드" 수식 작성 필요
- [ ] 🔴 난이도 KPI 4개 (#4 7일 재진입 / #5, #6 결과·공유 후 재방문 / #14 First Action→Result 평균시간) — BigQuery SQL 또는 GA4 Explore Funnel 사용 고려
- [ ] 텔레그램 OG 캐시 `@WebpageBot` 갱신 (og-image unit에서 이전)
- [ ] GA4 DebugView 확인 원할 시 "Google Analytics Debugger" Chrome 확장 설치
- [ ] 배포된 환경에서 본인 테스트 1회(스텝 완주 + 이전 클릭 1회) → DebugView에 등록된 파라미터 노출 확인
- [ ] 프로덕션에서 PR #17 SDM 수정 결과 3케이스 재검증 (로컬 완료)

## Notes
- GA4 property ID: `G-B7F0E8527V`
- 관련 unit:
  - `analytics-dashboard-prd` (원래 자체 DB PRD — 이 세션에서 MVP는 GA4 경량 경로로 피벗, 자체 DB는 Phase 2/3 기능과 함께 부활)
  - `visitor-tracking` (GA visitor_id 커스텀 차원 등록 pending은 이 세션에서 해소)
  - `step-flow-rebuild` (trackEvent 호출 사이트 — `result_viewed` 파라미터 확장은 여기 코드에 직접 반영)
- 관련 PR: #16 (venue disable + analytics events), #17 (SDM fix — 분석 파이프라인과는 독립)
- 16 KPI 매핑표는 대화 맥락에만 존재(스킬 레벨링 및 Looker Studio 차트 설정). 필요 시 `/find-context "16 KPI Looker"`로 재호출
- 미 구현 자체 DB 경로는 `analytics-dashboard-prd` Pending에 여전히 살아있음 — Phase 2(공유 링크)/Phase 3(저장·마이페이지) 구현 시 Event 모델 재합류 예정
