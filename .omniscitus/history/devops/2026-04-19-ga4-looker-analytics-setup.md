# GA4 + Looker Studio 분석 파이프라인 구축

**Participants**: claude, mincheol.kim

## Summary
운영 분석 PRD의 자체 DB 경로를 **MVP용 GA4+Looker Studio 경량 경로로 피벗**. trackEvent 이벤트 파라미터 확장, GA4 커스텀 측정기준 16개 수동 등록, Looker Studio 첫 차트 구성. 16개 KPI 중 14~15개를 GA4만으로 관측 가능함을 검증.
2026-04-21 세션에서 🟢 쉬운 KPI 4개(Scorecard 3 + Table 1) 구축하여 전체 5/6 진척, Pending 재정리하여 실제 필요 항목만 9개로 정돈.

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

### 2026-04-21
**Focus**: 🟢 쉬운 KPI 차트 4개 구축 (Scorecard 3 + Table 1) + Pending 정리

- `/follow-up` 리뷰로 14개 open unit pending 대조 → 2개 unit 체크박스 갱신 (`visitor-tracking`에서 GA visitor_id 커스텀 차원 등록 완료 마킹, `mobile-floating-ctas-and-favicon`에서 serif-B.bak 백업 정리 완료 마킹)
- **#8 공유 버튼 클릭 수 Scorecard** 완성 (14건, 2명 공유자). Looker 필터 UX의 **"차원 → 조건 → 값" 3단계 선택 구조** 학습: `share_result` 값이 자동완성 드롭다운에 안 떠 헤맸으나, 먼저 `이벤트 이름` 차원 선택 후 값 드롭다운에 정상 노출됨. 자동완성은 샘플링이라 저빈도 값 누락 가능 → 수동 타이핑 fallback 기억
- **#11 스크롤 이벤트 수 Scorecard** 완성 (~180건). `scroll`은 GA4 Enhanced Measurement 자동 수집이라 코드 무변경
- **#13 첫 입력까지 평균 시간 Scorecard** 완성 (`00:07:46` = 7분 46초). `time_to_start_sec`가 `소요 시간(Duration)` 타입이라 Looker가 `집계: 자동` 내부적으로 **AVERAGE 함수 자동 적용** — 별도 계산 필드 불필요 확인 (팝업 하단 "계산 실행: 실행 중인 AVERAGE 함수" 로 검증). 값이 큰 이유는 `Date.now()` 단순 경과라 백그라운드 탭 시간 포함 — 개선은 별도 이슈
- **#10 페이지별 체류시간 Table** 완성 (`평균 세션 시간` 메트릭, 7행). 리브랜딩 페이지 제목 화석 발견 (웨딩버젯 → 버젯로드 → 버짓로드 흔적이 별도 행으로 누적), 404 페이지 11분 34초 이상치는 백그라운드 탭 의심
- **Pending 재정리**: 삭제 3개(BigQuery export, 텔레그램 OG 캐시, SDM 재검증 — 실익 낮음/중복/무효화), 완료 체크 1개(본인 테스트), 신규 3개(`time_in_steps_sec` 파라미터 추가, `time_on_result_sec` 파라미터 추가, GA4 커스텀 측정항목 등록+Scorecard 2개). 🟢 5/6 진척 마커 `[~]` 적용하여 #16 선택 분포 바차트만 남음 명시
- **SPA 구조 한계 재확인**: `/budget-draft` 단일 URL에 6스텝+결과 상태 전환 → GA4 페이지 분리 불가. 설문 체류/결과 보는 시간 측정 요청 발생 → 델타 파라미터 2개(`time_in_steps_sec`, `time_on_result_sec`) 추가 방향 합의 (레벨 2 경로). 스텝별 완전 분리는 레벨 3(Virtual pageview) 작업 별도 필요

**Learned**:
- Looker Studio 베타 필터의 **"차원 → 조건 → 값" 3단계 UX**는 직관적이지 않음. 값 드롭다운에 `결과 없음` = 값이 없다는 신호가 아니라 **차원을 먼저 선택 안 했다는 신호**가 더 흔함. 차원 선택 후에야 값 드롭다운이 해당 차원의 샘플 값을 보여줌
- GA4 커넥터의 **Duration 타입 메트릭은 `집계: 자동`이 내부적으로 AVERAGE**로 해석됨. 사용자 관점에선 드롭다운이 비활성으로 보이지만, 팝업 하단 "계산 실행: 실행 중인 AVERAGE 함수" 문구가 실제 집계 함수 확인 수단
- Looker의 **"평균 세션 시간"(idle 포함) vs "세션당 평균 참여 시간"(idle 제외)** 구분. "체류시간" 직관에는 전자가 가까움. 페이지별 체류 테이블에서 404/이탈 탭이 이상치로 튀는 이유는 idle 포함 때문
- **SPA 단일 URL + state 전환**은 GA4의 페이지 기반 분석과 근본적으로 맞지 않음. 이벤트 기반 추적(이미 깔려있음)이 동급 데이터를 표현하지만 "페이지별 체류"라는 수치는 만들 수 없음. 델타 파라미터로 우회 가능하되, 완전 분리는 Virtual pageview 심는 아키텍처 변경 필요
- **Pending 정리는 삭제 > 완료 > 신규 순으로 효과 큼**. "실제로 안 할 것"을 삭제하는 순간 Pending의 체감 무게가 눈에 띄게 감소 (10 → 9는 숫자 이상의 효과). 🟡🔴 묶음은 묶음 단위로 두되 진척 마커로 세분

### 2026-04-22
**Focus**: #16 선택 분포 바차트 6개 완성(🟢 KPI 6/6) + Data Blending 365% 이상치 원인 규명 → **Neon Event 자체 수집 경로로 재피벗** + `event-pipeline.md` 원칙 문서 + Prisma Event 모델 정의

- `/follow-up` 리뷰 → 14 open unit / 37 pending 상태 재집계, 4건 소급 체크
- Looker Studio **#16 선택 분포 바차트 6개 일괄 구축** (region / venue_type / studio_tier / dress_tier / makeup_tier / yemul_tier) — 🟢 쉬운 KPI **6/6 완성**
  - 첫 차트 측정항목을 `조회수` → `이벤트 수`로 교체(GA4의 `조회수`는 `page_view` 전용, 커스텀 이벤트엔 0)
  - `(not set)` 90건 급증 원인 = PR #16(2026-04-19) 이전의 `result_viewed`에 `region` 파라미터 없음. `region != (not set)` 필터로 해결
  - 차트 복제 시 필터도 함께 복제되므로 차원 + 필터 둘 다 필드 교체
- **#1 전환율 Scorecard 시도**:
  - 단일 계산된 필드 `SUM(CASE WHEN 이벤트 이름 = 'X' THEN 이벤트 수 END)` → **"Aggregated and non-aggregated"** 에러 (GA4 `이벤트 수`가 AUT pre-aggregated)
  - `THEN 1 ELSE 0` 대체 → 결과 100% (GA4 커넥터가 이벤트별 1 row로 집계하는 구조라 SUM이 "이벤트 이름 존재 여부"만 셈)
  - **Data Blending**으로 재시도 (교차 조인, 양쪽 측정기준 없음, 각자 이벤트 이름 필터) → **365% 출력**(논리적으로 불가능)
  - 원인 잠정: GA 커넥터의 **암묵적 차원(날짜 등) 집계**가 혼합 후 값 부풀림. Looker Studio의 GUI 조인은 생성 SQL 확인 불가 → 디버깅 경로 부재
- **대안 경로 논의** (`/cto-council` + 사용자 주도):
  - GA4+BigQuery Export → MVP에 과함(GCP 셋업 + 결제 카드, 과거 데이터 소급 불가)
  - Neon Event 자체 수집 → 이미 프로비저닝 완료, Phase 2/3 자연 합류, Prisma Studio + SQL 직접 쿼리
  - **Neon 경로 채택**
- 관련 산출물:
  - `docs/prd/analytics/event-pipeline.md` 신규 (운영 원칙: 파이프라인·주의사항·용량 계획·Phase 2/3 합류 전략·확장 경로)
  - `CLAUDE.md`에 "## 데이터 수집" 섹션 추가 (Neon + GA 병행, 포인터 3줄)
  - `prisma/schema.prisma`에 **Event 모델 정의** — 옵션 A 기반 **조정 3가지** 반영:
    1. `timestamp` 제거, `createdAt` 단일화 (둘 다 서버 `now()`라 의미 중복)
    2. `@map`으로 snake_case 컬럼 매핑 (SQL/Looker 가독성)
    3. **`isDev` 플래그 추가** (GA4 `?debug_mode=1` 패턴과 병행, 개발 이벤트 격리)
  - `event-schema-options.md` 옵션 A 스키마 섹션 업데이트 (조정 3가지 반영 주석)
- 실제 `bun run db migrate` 실행은 **기획 확정 후로 보류** (사용자 판단: v1 STEP 플로우 완성도 감안 시 현재는 이벤트 파라미터 변동 가능성 남음)
- **팀 공유 경로 정리**: Neon Collaborators 초대 (프로젝트 단위 게스트), Vercel Marketplace 구조상 Neon `People page`는 Vercel로 위임됨 → Project Settings의 Collaborators 사용이 올바른 경로
- BigQuery 학습 셋업 제안 → 사용자 판단으로 중단 (GA4 14개월 retention이 1차 보험 역할, 만료 임박 시 재검토)

**Learned**:
- **GA4 Looker 커넥터의 pre-aggregated row 모델** — `이벤트 수`는 이미 SUM 내재한 AUT 메트릭. CASE WHEN 내부에 넣으면 이중 집계 에러, 상수 `1`로 대체 시엔 이벤트 단위 아닌 "이벤트 이름 row 존재 여부 0/1"로 집계됨 → 단일 소스 계산된 필드로 전환율 표현 불가
- **Looker Blend의 투명성 비용** — no-code GUI 조인은 생성 쿼리 확인 불가. 값 검증 필요한 국면(365% 같은)에선 SQL 직접 쓰기가 결정적 차별. 조인 옵션 중 "교차 조인(cross join)"이 양쪽 측정기준 없는 단일 숫자 비율 계산에 정공법
- **Vercel Marketplace 설치한 Neon은 권한 모델 이원화** — Neon Organization의 `People page`는 Vercel People로 위임(자동 동기화), 프로젝트 단위 외부 협업자는 Project Settings → Collaborators 사용. 쿼리 읽기 권한만 필요하면 Collaborators, Vercel 프로젝트 권한까지 필요하면 Vercel People
- **"기획 확정 전 구현"은 재작업 비용이 크다** — 이벤트 이름·파라미터는 UI 선택지에 종속되므로 UI 확정이 흔들리는 동안 이벤트 수집 코드 작성은 리팩토링 발생. 원칙 문서·스키마 정의는 선행 가능, 실제 migrate + API 구현은 후행
- **"보험용 투트랙" 세팅의 함정** — 1인 운영 맥락에서 BigQuery + Neon 병행은 유지 부담만 남고 실전에선 한 트랙만 쓰게 되는 케이스가 많음. 1차 보험(GA4 14개월 retention) 만료 임박 시점에 BigQuery 단독 도입이 실용적

## Pending
- [x] 🟢 쉬운 KPI 차트 6/6 완성 ✔️ 2026-04-22 (#16 분포 바차트 6개)
- [~] 🟡 계산식 KPI 6개 (#1~#3 전환율, #7, #9, #12) — **Neon Event 도입 후 SQL로 직접 계산** (Looker Blend 경로 폐기)
- [~] 🔴 난이도 KPI 4개 (#4, #5, #6, #14) — **Neon 경로 후 재개**
- [~] `result_viewed`·`share_result` 델타 파라미터 추가 — **Neon Event 구현 시 함께 진행**
- [ ] Looker Studio 기간 컨트롤 상단 배치 — 기존 🟢 차트 운영용으로만 유지
- [~] GA4 DebugView 확인 원할 시 "Google Analytics Debugger" Chrome 확장 — 선택사항
- [ ] **[재개 조건 충족 시]** Prisma `bun run db migrate dev --name init_events` 실행 + `src/lib/db.ts` + `src/app/api/events/route.ts` + `gtag.ts` 병행 호출 구현 (기획 확정 or Phase 2/3 진입 or 일 이벤트 > 100건)

## Notes
- GA4 property ID: `G-B7F0E8527V`
- 관련 unit:
  - `analytics-dashboard-prd` (원래 자체 DB PRD — 이 세션에서 MVP는 GA4 경량 경로로 피벗, 자체 DB는 Phase 2/3 기능과 함께 부활)
  - `visitor-tracking` (GA visitor_id 커스텀 차원 등록 pending은 이 세션에서 해소)
  - `step-flow-rebuild` (trackEvent 호출 사이트 — `result_viewed` 파라미터 확장은 여기 코드에 직접 반영)
- 관련 PR: #16 (venue disable + analytics events), #17 (SDM fix — 분석 파이프라인과는 독립)
- 16 KPI 매핑표는 대화 맥락에만 존재(스킬 레벨링 및 Looker Studio 차트 설정). 필요 시 `/find-context "16 KPI Looker"`로 재호출
- 미 구현 자체 DB 경로는 `analytics-dashboard-prd` Pending에 여전히 살아있음 — Phase 2(공유 링크)/Phase 3(저장·마이페이지) 구현 시 Event 모델 재합류 예정
