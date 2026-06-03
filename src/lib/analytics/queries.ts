import { prisma } from '@/lib/db';

// 모든 지표는 [from, to] (KST date) 윈도우로만 집계된다. 누적(전기간) 집계 없음.
// v_session_metrics 뷰(세션 1행, is_dev=false 사전필터)를 우선 사용하고,
// 뷰에 없는 항목만 events 테이블을 직접 쿼리한다.

export const ANALYTICS_EPOCH = '2026-06-01'; // 세션 추적 시작일
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export type Range = { from: string; to: string; today: string; preset: string };

function todayKst(): string {
  const now = new Date();
  return new Date(now.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

function addDays(date: string, n: number): string {
  const d = new Date(date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function valid(d: string | null): d is string {
  return !!d && DATE_RE.test(d) && !Number.isNaN(Date.parse(d + 'T00:00:00Z'));
}

export function resolveRange(
  preset: string | null,
  from: string | null,
  to: string | null,
): Range | null {
  const today = todayKst();
  const p = preset ?? (valid(from) && valid(to) ? 'custom' : '7d');
  switch (p) {
    case 'today':
      return { from: today, to: today, today, preset: p };
    case 'yesterday': {
      const y = addDays(today, -1);
      return { from: y, to: y, today, preset: p };
    }
    case '7d':
      return { from: addDays(today, -6), to: today, today, preset: p };
    case '30d':
      return { from: addDays(today, -29), to: today, today, preset: p };
    case 'all':
      return { from: ANALYTICS_EPOCH, to: today, today, preset: p };
    case 'custom':
      if (valid(from) && valid(to) && from <= to)
        return { from, to, today, preset: p };
      return null;
    default:
      return { from: addDays(today, -6), to: today, today, preset: '7d' };
  }
}

// 목표치 (스펙 기준, %)
export const TARGETS = {
  kpi1_result: 60,
  kpi2_save: 30,
  kpi3_reedit: 30,
  kpi4_reset: 30,
  r1a_mapping: 80,
  r1b_comprehensive: 80,
  r2a_open: 50,
  r2b_dwell15: 40,
  r3_explore: 30,
  r4_save: 60,
} as const;

// ---- 쿼리 정의 (전부 $1=from, $2=to) ----

const SQL_SCALARS = `
SELECT
  count(*)::int AS sessions,
  count(DISTINCT visitor_id)::int AS visitors,
  count(*) FILTER (WHERE svc_entered=1)::int AS svc_entered,
  count(*) FILTER (WHERE entered_any=1)::int AS entered_any,
  count(*) FILTER (WHERE draft_entered=1)::int AS draft_entered,
  count(*) FILTER (WHERE input_started=1)::int AS input_started,
  count(*) FILTER (WHERE result_viewed=1)::int AS result_viewed,
  count(*) FILTER (WHERE saved_shared=1)::int AS saved_shared,
  count(*) FILTER (WHERE toggled=1)::int AS toggled,
  count(*) FILTER (WHERE reset_clicked=1)::int AS reset_clicked,
  count(*) FILTER (WHERE via_share_link=1)::int AS via_share_link,
  count(*) FILTER (WHERE svc_entered=1 AND result_viewed=1)::int AS svc_result,
  count(*) FILTER (WHERE svc_entered=1 AND saved_shared=1)::int AS svc_saved,
  count(*) FILTER (WHERE svc_entered=1 AND toggled=1)::int AS svc_toggled,
  count(*) FILTER (WHERE svc_entered=1 AND reset_clicked=1)::int AS svc_reset,
  count(*) FILTER (WHERE svc_entered=1 AND tab_care=1)::int AS svc_tab_care,
  count(*) FILTER (WHERE input_started=1 AND result_viewed=1)::int AS is_result,
  count(*) FILTER (WHERE result_viewed=1 AND tab_itemized=1)::int AS rv_tab_itemized,
  count(*) FILTER (WHERE result_viewed=1 AND tab_care=1)::int AS rv_tab_care,
  count(*) FILTER (WHERE result_viewed=1 AND tab_comprehensive=1)::int AS rv_tab_comprehensive,
  count(*) FILTER (WHERE result_viewed=1 AND scroll_comprehensive=1)::int AS rv_scroll_comprehensive,
  count(*) FILTER (WHERE result_viewed=1 AND scroll_itemized=1)::int AS rv_scroll_itemized,
  count(*) FILTER (WHERE result_viewed=1 AND scroll_care=1)::int AS rv_scroll_care,
  count(*) FILTER (WHERE result_viewed=1 AND saved_shared=1)::int AS rv_saved,
  count(*) FILTER (WHERE result_viewed=1 AND share_pdf=1)::int AS rv_pdf,
  count(*) FILTER (WHERE result_viewed=1 AND share_link=1)::int AS rv_link,
  count(*) FILTER (WHERE result_viewed=1 AND share_image=1)::int AS rv_image,
  count(*) FILTER (WHERE result_viewed=1 AND share_expert=1)::int AS rv_expert,
  count(*) FILTER (WHERE result_viewed=1 AND (toggled=1 OR reset_clicked=1))::int AS rv_reedit,
  count(*) FILTER (WHERE dwell_sec IS NOT NULL)::int AS n_dwell,
  coalesce(round(avg(dwell_sec) FILTER (WHERE dwell_sec IS NOT NULL), 1), 0)::float AS avg_dwell,
  coalesce(round((percentile_cont(0.5) WITHIN GROUP (ORDER BY dwell_sec) FILTER (WHERE dwell_sec IS NOT NULL))::numeric, 1), 0)::float AS median_dwell
FROM v_session_metrics
WHERE day BETWEEN $1 AND $2
`;

const SQL_DAILY = `
SELECT
  to_char(day, 'YYYY-MM-DD') AS day,
  count(*)::int AS sessions,
  count(*) FILTER (WHERE svc_entered=1)::int AS entered,
  count(*) FILTER (WHERE input_started=1)::int AS input_started,
  count(*) FILTER (WHERE result_viewed=1)::int AS result_viewed,
  count(*) FILTER (WHERE saved_shared=1)::int AS saved_shared
FROM v_session_metrics
WHERE day BETWEEN $1 AND $2
GROUP BY day
ORDER BY day
`;

const SQL_ONBOARDING = `
SELECT
  properties->>'question_id' AS question_id,
  count(DISTINCT session_id)::int AS sessions,
  count(*)::int AS answers
FROM events
WHERE is_dev=false AND event_name='onboarding_question_answered'
  AND properties ? 'question_id'
  AND (created_at AT TIME ZONE 'Asia/Seoul')::date BETWEEN $1 AND $2
GROUP BY properties->>'question_id'
ORDER BY question_id
`;

const SQL_SCROLL_DEPTH = `
SELECT
  (properties->>'depth_pct')::int AS depth_pct,
  count(*)::int AS events,
  count(DISTINCT session_id)::int AS sessions
FROM events
WHERE is_dev=false AND event_name='result_scroll_depth'
  AND properties->>'tab'='comprehensive'
  AND properties ? 'depth_pct'
  AND (created_at AT TIME ZONE 'Asia/Seoul')::date BETWEEN $1 AND $2
GROUP BY (properties->>'depth_pct')::int
ORDER BY depth_pct
`;

const SQL_DWELL15 = `
WITH ex AS (
  SELECT session_id, max((properties->>'dwell_comprehensive_sec')::numeric) AS dwell_comp
  FROM events
  WHERE is_dev=false AND event_name='result_exited'
    AND properties ? 'dwell_comprehensive_sec'
    AND (created_at AT TIME ZONE 'Asia/Seoul')::date BETWEEN $1 AND $2
  GROUP BY session_id
)
SELECT
  count(*) FILTER (WHERE dwell_comp > 0)::int AS denom,
  count(*) FILTER (WHERE dwell_comp >= 15)::int AS num
FROM ex
`;

const SQL_ADJUST_COMPARE = `
SELECT
  (toggled=1) AS adjusted,
  count(*)::int AS n,
  count(*) FILTER (WHERE tab_itemized=1)::int AS budget_recheck,
  count(*) FILTER (WHERE saved_shared=1)::int AS saved_shared
FROM v_session_metrics
WHERE day BETWEEN $1 AND $2 AND result_viewed=1
GROUP BY (toggled=1)
`;

const SQL_DEPTH_COMPARE = `
SELECT
  (CASE WHEN toggle_count=0 THEN '0' WHEN toggle_count=1 THEN '1' ELSE '2+' END) AS depth,
  count(*)::int AS n,
  count(*) FILTER (WHERE saved_shared=1)::int AS saved_shared,
  count(*) FILTER (WHERE dwell_sec IS NOT NULL)::int AS exited
FROM v_session_metrics
WHERE day BETWEEN $1 AND $2 AND result_viewed=1
GROUP BY (CASE WHEN toggle_count=0 THEN '0' WHEN toggle_count=1 THEN '1' ELSE '2+' END)
ORDER BY depth
`;

const SQL_CARE_ADJUST = `
WITH bulk AS (
  SELECT DISTINCT session_id
  FROM events
  WHERE is_dev=false AND event_name='care_bulk_toggled'
    AND (created_at AT TIME ZONE 'Asia/Seoul')::date BETWEEN $1 AND $2
)
SELECT
  count(*) FILTER (WHERE v.tab_care=1)::int AS denom,
  count(*) FILTER (WHERE v.tab_care=1 AND (v.toggled=1 OR v.session_id IN (SELECT session_id FROM bulk)))::int AS num
FROM v_session_metrics v
WHERE v.day BETWEEN $1 AND $2
`;

const SQL_REVISIT = `
WITH per_visitor AS (
  SELECT visitor_id,
    count(DISTINCT session_id) AS sess_cnt,
    max(saved_shared) AS ever_saved,
    max(result_viewed) AS ever_result
  FROM v_session_metrics
  WHERE day BETWEEN $1 AND $2
  GROUP BY visitor_id
)
SELECT
  (ever_saved=1) AS saved,
  count(*)::int AS visitors,
  count(*) FILTER (WHERE sess_cnt >= 2)::int AS revisited
FROM per_visitor
WHERE ever_result=1
GROUP BY (ever_saved=1)
`;

const SQL_SATISFACTION = `
SELECT
  count(*)::int AS total,
  count(*) FILTER (WHERE properties->>'matched'='yes')::int AS matched_yes
FROM events
WHERE is_dev=false AND event_name='satisfaction_answered'
  AND (created_at AT TIME ZONE 'Asia/Seoul')::date BETWEEN $1 AND $2
`;

// ---- raw row 타입 ----
type ScalarRow = Record<string, number>;
type DailyRow = {
  day: string;
  sessions: number;
  entered: number;
  input_started: number;
  result_viewed: number;
  saved_shared: number;
};
type OnboardingRow = { question_id: string; sessions: number; answers: number };
type ScrollRow = { depth_pct: number; events: number; sessions: number };
type Dwell15Row = { denom: number; num: number };
type AdjustRow = {
  adjusted: boolean;
  n: number;
  budget_recheck: number;
  saved_shared: number;
};
type DepthRow = { depth: string; n: number; saved_shared: number; exited: number };
type CareAdjustRow = { denom: number; num: number };
type RevisitRow = { saved: boolean; visitors: number; revisited: number };
type SatisfactionRow = { total: number; matched_yes: number };

// ---- 응답 타입 ----
export type Ratio = { num: number; denom: number };
export type NamedRatio = Ratio & { name: string };
export type Kpi = Ratio & { name: string; target: number };

export type AnalyticsData = {
  window: {
    from: string;
    to: string;
    today: string;
    preset: string;
    sessions: number;
    visitors: number;
  };
  overview: {
    scorecards: { label: string; value: number }[];
    funnel: { label: string; value: number }[];
    daily: DailyRow[];
    onboarding: OnboardingRow[];
  };
  decisionLog: {
    kpis: Kpi[];
    careTabRate: Ratio;
    dwell: { n: number; avg: number; median: number };
    explore: NamedRatio[];
    saveShare: NamedRatio[];
    scrollDepth: ScrollRow[];
  };
  strategyOkr: Kpi[];
  executionOkr: {
    careAdjust: Ratio;
    adjustComparison: { group: string; n: number; budget_recheck: number; saved_shared: number }[];
    depthComparison: DepthRow[];
    revisit: { group: string; visitors: number; revisited: number }[];
    satisfaction: SatisfactionRow;
    viaShareLink: number;
  };
};

function one<T>(rows: T[]): T {
  return rows[0] ?? ({} as T);
}

export async function runAnalytics(range: Range): Promise<AnalyticsData> {
  const { from, to } = range;
  const run = <T>(sql: string) => prisma.$queryRawUnsafe<T[]>(sql, from, to);

  const [
    scalarRows,
    daily,
    onboarding,
    scrollDepth,
    dwell15Rows,
    adjustRows,
    depthRows,
    careAdjustRows,
    revisitRows,
    satisfactionRows,
  ] = await Promise.all([
    run<ScalarRow>(SQL_SCALARS),
    run<DailyRow>(SQL_DAILY),
    run<OnboardingRow>(SQL_ONBOARDING),
    run<ScrollRow>(SQL_SCROLL_DEPTH),
    run<Dwell15Row>(SQL_DWELL15),
    run<AdjustRow>(SQL_ADJUST_COMPARE),
    run<DepthRow>(SQL_DEPTH_COMPARE),
    run<CareAdjustRow>(SQL_CARE_ADJUST),
    run<RevisitRow>(SQL_REVISIT),
    run<SatisfactionRow>(SQL_SATISFACTION),
  ]);

  const s = one(scalarRows);
  const dwell15 = one(dwell15Rows);
  const careAdjust = one(careAdjustRows);
  const satisfaction = one(satisfactionRows);

  const v = (k: string) => Number(s[k] ?? 0);
  const svc = v('svc_entered');
  const rv = v('result_viewed');

  const adjusted = adjustRows.find((r) => r.adjusted);
  const notAdjusted = adjustRows.find((r) => !r.adjusted);

  return {
    window: {
      from,
      to,
      today: range.today,
      preset: range.preset,
      sessions: v('sessions'),
      visitors: v('visitors'),
    },
    overview: {
      scorecards: [
        { label: '운영 세션', value: v('sessions') },
        { label: '랜딩 진입(svc)', value: svc },
        { label: '진입(any)', value: v('entered_any') },
        { label: '드래프트 직진입', value: v('draft_entered') },
      ],
      funnel: [
        { label: '랜딩 진입', value: svc },
        { label: '입력 시작', value: v('input_started') },
        { label: '결과 확인', value: rv },
        { label: '저장/공유', value: v('saved_shared') },
      ],
      daily,
      onboarding,
    },
    decisionLog: {
      kpis: [
        { name: '결과 확인 전이율', num: v('svc_result'), denom: svc, target: TARGETS.kpi1_result },
        { name: '저장(공유) 비율', num: v('svc_saved'), denom: svc, target: TARGETS.kpi2_save },
        { name: '선택 답변 재수정률', num: v('svc_toggled'), denom: svc, target: TARGETS.kpi3_reedit },
        { name: '시나리오 재생성률', num: v('svc_reset'), denom: svc, target: TARGETS.kpi4_reset },
      ],
      careTabRate: { num: v('svc_tab_care'), denom: svc },
      dwell: { n: v('n_dwell'), avg: v('avg_dwell'), median: v('median_dwell') },
      explore: [
        { name: '항목별 내역 탭', num: v('rv_tab_itemized'), denom: rv },
        { name: '추가금 케어 탭', num: v('rv_tab_care'), denom: rv },
        { name: '종합설계서 스크롤', num: v('rv_scroll_comprehensive'), denom: rv },
        { name: '항목별 내역 스크롤', num: v('rv_scroll_itemized'), denom: rv },
        { name: '추가금 케어 스크롤', num: v('rv_scroll_care'), denom: rv },
      ],
      saveShare: [
        { name: '저장/공유 전체', num: v('rv_saved'), denom: rv },
        { name: 'PDF 저장', num: v('rv_pdf'), denom: rv },
        { name: '카카오/링크', num: v('rv_link'), denom: rv },
        { name: '이미지 저장', num: v('rv_image'), denom: rv },
        { name: '전문가 상담', num: v('rv_expert'), denom: rv },
      ],
      scrollDepth,
    },
    strategyOkr: [
      { name: 'R1a 매핑 완료→결과 확인', num: v('is_result'), denom: v('input_started'), target: TARGETS.r1a_mapping },
      { name: 'R1b 종합설계서 도달', num: v('rv_tab_comprehensive'), denom: rv, target: TARGETS.r1b_comprehensive },
      { name: 'R2a 종합설계서 탭 오픈', num: v('rv_tab_comprehensive'), denom: rv, target: TARGETS.r2a_open },
      { name: 'R2b 15초+ 체류율', num: Number(dwell15.num ?? 0), denom: Number(dwell15.denom ?? 0), target: TARGETS.r2b_dwell15 },
      { name: 'R3 추가옵션 탐색 재수정/재생성', num: v('rv_reedit'), denom: rv, target: TARGETS.r3_explore },
      { name: 'R4 저장/공유 완료', num: v('rv_saved'), denom: rv, target: TARGETS.r4_save },
    ],
    executionOkr: {
      careAdjust: { num: Number(careAdjust.num ?? 0), denom: Number(careAdjust.denom ?? 0) },
      adjustComparison: [
        {
          group: '조정함',
          n: adjusted?.n ?? 0,
          budget_recheck: adjusted?.budget_recheck ?? 0,
          saved_shared: adjusted?.saved_shared ?? 0,
        },
        {
          group: '미조정',
          n: notAdjusted?.n ?? 0,
          budget_recheck: notAdjusted?.budget_recheck ?? 0,
          saved_shared: notAdjusted?.saved_shared ?? 0,
        },
      ],
      depthComparison: depthRows,
      revisit: [
        {
          group: '저장/공유',
          visitors: revisitRows.find((r) => r.saved)?.visitors ?? 0,
          revisited: revisitRows.find((r) => r.saved)?.revisited ?? 0,
        },
        {
          group: '미저장',
          visitors: revisitRows.find((r) => !r.saved)?.visitors ?? 0,
          revisited: revisitRows.find((r) => !r.saved)?.revisited ?? 0,
        },
      ],
      satisfaction,
      viaShareLink: v('via_share_link'),
    },
  };
}
