import { prisma } from '@/lib/db';

// 데이터 레이어 (visitor_id 기준).
// session_id는 운영 데이터의 85%가 NULL이라 세션 단위 집계는 폐기했다.
// 모든 퍼널 지표는 visitor_id로 묶고, 재방문은 service_entered의 is_returning 프로퍼티로 판별한다.
// 의도(Intent) = share_result ∪ share_action_clicked ∪ feedback_submitted.
// 모든 수치는 ::int / ::float 로 캐스팅한다 (BigInt 직렬화 금지).

export const ANALYTICS_EPOCH = '2026-04-25'; // 운영 이벤트 수집 시작일
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

function daysBetween(from: string, to: string): number {
  const a = Date.parse(from + 'T00:00:00Z');
  const b = Date.parse(to + 'T00:00:00Z');
  return Math.round((b - a) / 86400000) + 1; // inclusive
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
  const p = preset ?? (valid(from) && valid(to) ? 'custom' : '30d');
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
    case '90d':
      return { from: addDays(today, -89), to: today, today, preset: p };
    case 'all':
      return { from: ANALYTICS_EPOCH, to: today, today, preset: p };
    case 'custom':
      if (valid(from) && valid(to) && from <= to)
        return { from, to, today, preset: p };
      return null;
    default:
      return { from: addDays(today, -29), to: today, today, preset: '30d' };
  }
}

// 직전 동일 길이 기간 (델타 비교용)
function previousRange(from: string, to: string): { from: string; to: string } {
  const len = daysBetween(from, to);
  const prevTo = addDays(from, -1);
  const prevFrom = addDays(prevTo, -(len - 1));
  return { from: prevFrom, to: prevTo };
}

// ---- SQL ($1=from, $2=to) ----

// visitor 단위 퍼널 플래그 (모든 KPI/퍼널 차트의 단일 베이스)
const SQL_VISITOR_FUNNEL = `
WITH v AS (
  SELECT visitor_id,
    bool_or(event_name = 'service_entered') AS entered,
    bool_or(event_name = 'input_started')   AS started,
    bool_or(event_name = 'result_viewed')   AS resulted,
    bool_or(event_name IN ('share_result','share_action_clicked','feedback_submitted')) AS intent,
    bool_or(event_name = 'service_entered' AND properties->>'is_returning' = 'yes') AS is_returning
  FROM events
  WHERE is_dev = false
    AND (created_at AT TIME ZONE 'Asia/Seoul')::date BETWEEN $1 AND $2
  GROUP BY visitor_id
)
SELECT
  count(*) FILTER (WHERE entered)::int      AS entered,
  count(*) FILTER (WHERE started)::int      AS started,
  count(*) FILTER (WHERE resulted)::int     AS resulted,
  count(*) FILTER (WHERE intent)::int       AS intent,
  count(*) FILTER (WHERE is_returning)::int AS returning_visitors,
  count(*)::int                             AS total_visitors
FROM v
`;

// 입력 시작 소요시간 (진입 마찰) p50/p90, 초
const SQL_TIME_TO_START = `
SELECT
  coalesce(round((percentile_cont(0.5) WITHIN GROUP (
    ORDER BY (properties->>'time_to_start_sec')::numeric))::numeric, 1), 0)::float AS p50_sec,
  coalesce(round((percentile_cont(0.9) WITHIN GROUP (
    ORDER BY (properties->>'time_to_start_sec')::numeric))::numeric, 1), 0)::float AS p90_sec,
  count(*)::int AS n
FROM events
WHERE is_dev = false AND event_name = 'input_started'
  AND properties->>'time_to_start_sec' ~ '^[0-9.]+$'
  AND (created_at AT TIME ZONE 'Asia/Seoul')::date BETWEEN $1 AND $2
`;

// 차트 B: 일별 진입/결과 시계열 (visitor distinct)
const SQL_DAILY = `
SELECT
  to_char(date_trunc('day', created_at AT TIME ZONE 'Asia/Seoul'), 'YYYY-MM-DD') AS day,
  count(DISTINCT visitor_id) FILTER (WHERE event_name = 'service_entered')::int AS entered,
  count(DISTINCT visitor_id) FILTER (WHERE event_name = 'input_started')::int   AS input_started,
  count(DISTINCT visitor_id) FILTER (WHERE event_name = 'result_viewed')::int   AS resulted
FROM events
WHERE is_dev = false
  AND (created_at AT TIME ZONE 'Asia/Seoul')::date BETWEEN $1 AND $2
GROUP BY 1
ORDER BY 1
`;

// 차트 C: 예산 총액 분포 (만원 단위, 10개 버킷 0~20000만원).
// total_amount는 result_viewed 일부 이벤트에만 있고 persona와 동일 이벤트에 공존하지 않으므로
// 단일 시리즈 히스토그램으로만 집계한다 (persona 세그먼트는 별도 차트로).
const SQL_BUDGET_DIST = `
WITH amt AS (
  SELECT (properties->>'total_amount')::numeric AS total_amount
  FROM events
  WHERE is_dev = false AND event_name = 'result_viewed'
    AND properties->>'total_amount' ~ '^[0-9.]+$'
    AND (created_at AT TIME ZONE 'Asia/Seoul')::date BETWEEN $1 AND $2
)
SELECT
  least(width_bucket(total_amount, 0, 20000, 10), 10)::int AS bucket,
  count(*)::int AS n
FROM amt
GROUP BY 1
ORDER BY 1
`;

// 보조: 페르소나 분포 (visitor distinct) — total_amount와 공존하지 않아 분리 집계
const SQL_PERSONA_DIST = `
SELECT
  properties->>'persona' AS persona,
  count(DISTINCT visitor_id)::int AS visitors
FROM events
WHERE is_dev = false AND properties ? 'persona'
  AND (created_at AT TIME ZONE 'Asia/Seoul')::date BETWEEN $1 AND $2
GROUP BY 1
ORDER BY visitors DESC
`;

// ---- raw row 타입 ----
type FunnelRow = {
  entered: number;
  started: number;
  resulted: number;
  intent: number;
  returning_visitors: number;
  total_visitors: number;
};
type TimeToStartRow = { p50_sec: number; p90_sec: number; n: number };
type DailyRow = {
  day: string;
  entered: number;
  input_started: number;
  resulted: number;
};
type BudgetBucketRow = { bucket: number; n: number };
type PersonaRow = { persona: string; visitors: number };

// ---- 응답 타입 ----

/** 비율 KPI: pct(%, null=표본없음) + 직전 기간 대비 변화량(%p). */
export type RateKpi = {
  key: string;
  label: string;
  num: number;
  denom: number;
  pct: number | null;
  prevPct: number | null;
  deltaPct: number | null; // 현재 - 직전 (퍼센트포인트)
};

/** 시간(초) KPI: p50/p90 + 직전 기간 대비 p50 변화량. */
export type DurationKpi = {
  key: string;
  label: string;
  n: number;
  p50Sec: number;
  p90Sec: number;
  prevP50Sec: number | null;
  deltaP50Sec: number | null; // 현재 - 직전 (초)
};

export type FunnelStage = { key: string; label: string; visitors: number };
export type DailyPoint = {
  day: string;
  entered: number;
  inputStarted: number;
  resulted: number;
};
/** 예산 분포 버킷: [lower, upper) 만원 단위, n = visitor 결과 건수. */
export type BudgetBucket = { lower: number; upper: number; n: number };
export type PersonaSlice = { persona: string; visitors: number };

export type AnalyticsData = {
  window: {
    from: string;
    to: string;
    today: string;
    preset: string;
    prevFrom: string;
    prevTo: string;
    totalVisitors: number;
  };
  kpis: {
    inputRate: RateKpi; // P(Input | Entered)
    resultRate: RateKpi; // P(Result | Input)
    intentRate: RateKpi; // P(Intent | Result)
    overallIntentRate: RateKpi; // P(Intent | Entered)
    revisitRate: RateKpi; // 재방문 visitor 비율
    timeToStart: DurationKpi; // 입력 시작 소요시간 p50/p90
  };
  charts: {
    funnel: FunnelStage[]; // 차트 A
    daily: DailyPoint[]; // 차트 B
    budgetDistribution: BudgetBucket[]; // 차트 C
    personaDistribution: PersonaSlice[]; // 보조
  };
};

function one<T>(rows: T[], fallback: T): T {
  return rows[0] ?? fallback;
}

function pct(num: number, denom: number): number | null {
  if (!denom) return null;
  return Math.round((1000 * num) / denom) / 10; // 소수 1자리
}

function rateKpi(
  key: string,
  label: string,
  num: number,
  denom: number,
  prevNum: number,
  prevDenom: number,
): RateKpi {
  const p = pct(num, denom);
  const prevP = pct(prevNum, prevDenom);
  const delta =
    p === null || prevP === null ? null : Math.round((p - prevP) * 10) / 10;
  return { key, label, num, denom, pct: p, prevPct: prevP, deltaPct: delta };
}

const EMPTY_FUNNEL: FunnelRow = {
  entered: 0,
  started: 0,
  resulted: 0,
  intent: 0,
  returning_visitors: 0,
  total_visitors: 0,
};
const EMPTY_TTS: TimeToStartRow = { p50_sec: 0, p90_sec: 0, n: 0 };

export async function runAnalytics(range: Range): Promise<AnalyticsData> {
  const { from, to } = range;
  const prev = previousRange(from, to);

  const run = <T>(sql: string, f: string, t: string) =>
    prisma.$queryRawUnsafe<T[]>(sql, f, t);

  const [
    funnelRows,
    prevFunnelRows,
    ttsRows,
    prevTtsRows,
    dailyRows,
    budgetRows,
    personaRows,
  ] = await Promise.all([
    run<FunnelRow>(SQL_VISITOR_FUNNEL, from, to),
    run<FunnelRow>(SQL_VISITOR_FUNNEL, prev.from, prev.to),
    run<TimeToStartRow>(SQL_TIME_TO_START, from, to),
    run<TimeToStartRow>(SQL_TIME_TO_START, prev.from, prev.to),
    run<DailyRow>(SQL_DAILY, from, to),
    run<BudgetBucketRow>(SQL_BUDGET_DIST, from, to),
    run<PersonaRow>(SQL_PERSONA_DIST, from, to),
  ]);

  const f = one(funnelRows, EMPTY_FUNNEL);
  const pf = one(prevFunnelRows, EMPTY_FUNNEL);
  const tts = one(ttsRows, EMPTY_TTS);
  const ptts = one(prevTtsRows, EMPTY_TTS);

  const prevP50 = ptts.n > 0 ? ptts.p50_sec : null;
  const deltaP50 = prevP50 === null ? null : Math.round((tts.p50_sec - prevP50) * 10) / 10;

  // 예산 버킷: 0~20000만원을 10등분(버킷 폭 2000만원), 10번 버킷은 20000+ 오버플로
  const bucketWidth = 2000;
  const budgetDistribution: BudgetBucket[] = budgetRows.map((r) => ({
    lower: (r.bucket - 1) * bucketWidth,
    upper: r.bucket >= 10 ? Number.POSITIVE_INFINITY : r.bucket * bucketWidth,
    n: r.n,
  }));

  return {
    window: {
      from,
      to,
      today: range.today,
      preset: range.preset,
      prevFrom: prev.from,
      prevTo: prev.to,
      totalVisitors: f.total_visitors,
    },
    kpis: {
      inputRate: rateKpi(
        'inputRate',
        '입력 전환율',
        f.started,
        f.entered,
        pf.started,
        pf.entered,
      ),
      resultRate: rateKpi(
        'resultRate',
        '결과 도달률',
        f.resulted,
        f.started,
        pf.resulted,
        pf.started,
      ),
      intentRate: rateKpi(
        'intentRate',
        '의도 생성률',
        f.intent,
        f.resulted,
        pf.intent,
        pf.resulted,
      ),
      overallIntentRate: rateKpi(
        'overallIntentRate',
        '진입→의도 전환율',
        f.intent,
        f.entered,
        pf.intent,
        pf.entered,
      ),
      revisitRate: rateKpi(
        'revisitRate',
        '재방문율',
        f.returning_visitors,
        f.entered,
        pf.returning_visitors,
        pf.entered,
      ),
      timeToStart: {
        key: 'timeToStart',
        label: '입력 시작 소요시간',
        n: tts.n,
        p50Sec: tts.p50_sec,
        p90Sec: tts.p90_sec,
        prevP50Sec: prevP50,
        deltaP50Sec: deltaP50,
      },
    },
    charts: {
      funnel: [
        { key: 'entered', label: '진입', visitors: f.entered },
        { key: 'input_started', label: '입력 시작', visitors: f.started },
        { key: 'result_viewed', label: '결과 확인', visitors: f.resulted },
        { key: 'intent', label: '의도(저장/공유)', visitors: f.intent },
      ],
      daily: dailyRows.map((r) => ({
        day: r.day,
        entered: r.entered,
        inputStarted: r.input_started,
        resulted: r.resulted,
      })),
      budgetDistribution,
      personaDistribution: personaRows.map((r) => ({
        persona: r.persona,
        visitors: r.visitors,
      })),
    },
  };
}
