'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Eye,
  MousePointerClick,
  Repeat,
  RefreshCw,
  Inbox,
  Target,
  Timer,
  TrendingDown,
  type LucideIcon,
} from 'lucide-react';
import type {
  AnalyticsData,
  DurationKpi,
  RateKpi,
} from '@/lib/analytics/queries';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import {
  BudgetDistributionChart,
  DailyTrendChart,
  DailyTrendLegend,
  FunnelChart,
  PersonaDistribution,
} from './charts';

const PRESETS = [
  { k: '7d', label: '7일' },
  { k: '30d', label: '30일' },
  { k: '90d', label: '90일' },
];

// ── 포맷 헬퍼 ──
function fmtPct(p: number | null): string {
  return p === null ? '—' : `${p.toFixed(1)}%`;
}
function fmtSec(s: number): string {
  return s % 1 === 0 ? `${s}초` : `${s.toFixed(1)}초`;
}
function fmtBudgetLabel(lower: number, upper: number | null): string {
  // upper는 마지막 버킷에서 와이어상 null (서버 Infinity 직렬화) → "lower+ 이상"
  if (upper === null || !Number.isFinite(upper)) {
    return `${lower.toLocaleString()}+`;
  }
  return `${lower.toLocaleString()}–${upper.toLocaleString()}`;
}

// ── 델타 pill ──
function DeltaPill({
  value,
  unit,
  improveDown = false,
}: {
  value: number | null;
  unit: string;
  improveDown?: boolean; // true면 음수가 개선(시간 단축)
}) {
  if (value === null) {
    return (
      <span className="inline-flex items-center rounded-full bg-black/[0.04] px-1.5 py-0.5 text-[11px] font-medium text-[#9CA3AF]">
        —
      </span>
    );
  }
  if (value === 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-black/[0.04] px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-[#6B7280]">
        0{unit}
      </span>
    );
  }
  const improving = improveDown ? value < 0 : value > 0;
  const sign = value > 0 ? '+' : '';
  const Icon = value > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums',
        improving
          ? 'bg-emerald-50 text-emerald-600'
          : 'bg-rose-50 text-rose-600',
      )}
    >
      <Icon className="size-3" />
      {sign}
      {Math.abs(value).toFixed(1)}
      {unit}
    </span>
  );
}

const KPI_META: Record<string, { icon: LucideIcon; hint: string }> = {
  inputRate: { icon: MousePointerClick, hint: 'P(입력 | 진입)' },
  resultRate: { icon: Eye, hint: 'P(결과 | 입력)' },
  intentRate: { icon: Target, hint: 'P(의도 | 결과)' },
  overallIntentRate: { icon: TrendingDown, hint: 'P(의도 | 진입)' },
  revisitRate: { icon: Repeat, hint: '재방문 진입 visitor 비율' },
};

// ── 비율 KPI 카드 ──
function RateCard({ kpi }: { kpi: RateKpi }) {
  const meta = KPI_META[kpi.key];
  const Icon = meta?.icon ?? Eye;
  const lowSample = kpi.denom < 10;
  return (
    <Card
      className={cn(
        'gap-0 rounded-xl border-0 py-0 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)] ring-1 ring-black/[0.06] transition-shadow hover:shadow-[0_4px_12px_rgba(16,24,40,0.08)]',
      )}
    >
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-[#6B7280]">
            {kpi.label}
          </span>
          <Icon className="size-4 text-[#9CA3AF]" />
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              'text-[28px] font-semibold leading-none tracking-tight tabular-nums text-[#111827]',
              lowSample && 'opacity-50',
            )}
          >
            {fmtPct(kpi.pct)}
          </span>
          <DeltaPill value={kpi.deltaPct} unit="%p" />
        </div>
        <p className="text-[12px] tabular-nums text-[#9CA3AF]">
          {kpi.num.toLocaleString()} / {kpi.denom.toLocaleString()}
          {lowSample && (
            <span className="ml-1 text-[#9CA3AF]">· 표본 작음</span>
          )}
        </p>
      </div>
    </Card>
  );
}

// ── 시간 KPI 카드 ──
function DurationCard({ kpi }: { kpi: DurationKpi }) {
  const lowSample = kpi.n < 10;
  return (
    <Card
      className={cn(
        'gap-0 rounded-xl border-0 py-0 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)] ring-1 ring-black/[0.06] transition-shadow hover:shadow-[0_4px_12px_rgba(16,24,40,0.08)]',
      )}
    >
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-[#6B7280]">
            {kpi.label}
          </span>
          <Timer className="size-4 text-[#9CA3AF]" />
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              'text-[28px] font-semibold leading-none tracking-tight tabular-nums text-[#111827]',
              lowSample && 'opacity-50',
            )}
          >
            {kpi.n > 0 ? fmtSec(kpi.p50Sec) : '—'}
          </span>
          <DeltaPill value={kpi.deltaP50Sec} unit="초" improveDown />
        </div>
        <p className="text-[12px] tabular-nums text-[#9CA3AF]">
          p90 {fmtSec(kpi.p90Sec)} · n={kpi.n.toLocaleString()}
          {lowSample && <span className="ml-1">· 표본 작음</span>}
        </p>
      </div>
    </Card>
  );
}

// ── 차트 카드 셸 ──
function ChartCard({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        'gap-0 rounded-xl border-0 py-0 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)] ring-1 ring-black/[0.06]',
        className,
      )}
    >
      <div className="flex items-start justify-between p-5 pb-3">
        <div className="space-y-0.5">
          <h3 className="text-[15px] font-semibold tracking-tight text-[#373737]">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[12px] text-[#9CA3AF]">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      <div className="px-3 pb-4 pt-1">{children}</div>
    </Card>
  );
}

// ── 스켈레톤 ──
function CardSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div className="rounded-xl bg-white p-5 ring-1 ring-black/[0.06]">
      <div className="h-3 w-24 animate-pulse rounded bg-black/[0.06]" />
      <div
        className={cn(
          'mt-4 animate-pulse rounded bg-black/[0.06]',
          tall ? 'h-48 w-full' : 'h-8 w-20',
        )}
      />
      {!tall && (
        <div className="mt-4 h-3 w-16 animate-pulse rounded bg-black/[0.04]" />
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </section>
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CardSkeleton tall />
        </div>
        <div className="lg:col-span-1">
          <CardSkeleton tall />
        </div>
      </section>
      <CardSkeleton tall />
    </div>
  );
}

// ── 빈/에러 상태 ──
function StateMessage({
  icon: Icon,
  title,
  description,
  onRetry,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="gap-0 rounded-xl border-0 py-0 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)] ring-1 ring-black/[0.06]">
      <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <div className="flex size-11 items-center justify-center rounded-full bg-black/[0.04]">
          <Icon className="size-5 text-[#9CA3AF]" />
        </div>
        <div className="space-y-1">
          <p className="text-[15px] font-semibold text-[#373737]">{title}</p>
          <p className="text-[13px] text-[#9CA3AF]">{description}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[13px] font-medium text-[#373737] ring-1 ring-black/[0.08] transition hover:ring-black/[0.16]"
          >
            <RefreshCw className="size-3.5 text-[#9CA3AF]" />
            다시 시도
          </button>
        )}
      </div>
    </Card>
  );
}

// ── 메인 ──
export function AnalyticsDashboard() {
  const [preset, setPreset] = useState('30d');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [reloadKey, setReloadKey] = useState(0);
  const retry = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    (async () => {
      try {
        const r = await fetch(`/api/internal/analytics?preset=${preset}`);
        if (!r.ok) {
          const body = await r.json().catch(() => null);
          throw new Error(body?.detail || body?.error || `HTTP ${r.status}`);
        }
        const d = (await r.json()) as AnalyticsData;
        if (alive) setData(d);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [preset, reloadKey]);

  const w = data?.window;
  const kpis = data?.kpis;
  const charts = data?.charts;
  const hasData =
    !!charts &&
    (charts.funnel.some((s) => s.visitors > 0) ||
      charts.daily.length > 0 ||
      (w?.totalVisitors ?? 0) > 0);

  return (
    <>
      {/* 헤더 + 기간 세그먼트 컨트롤 */}
      <header className="mb-6 flex flex-col gap-4 border-b border-black/[0.06] pb-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-[#373737]">
            분석
          </h1>
          <p className="text-sm text-[#6B7280]">
            결혼 준비 예산 초안 퍼널 지표 · visitor 기준
            {w && (
              <span className="ml-1 tabular-nums text-[#9CA3AF]">
                ({w.from} ~ {w.to})
              </span>
            )}
          </p>
        </div>

        <div className="inline-flex w-fit rounded-lg bg-black/[0.04] p-0.5">
          {PRESETS.map((p) => {
            const active = preset === p.k;
            return (
              <button
                key={p.k}
                onClick={() => setPreset(p.k)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AAC7E1]',
                  active
                    ? 'bg-white text-[#373737] shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                    : 'text-[#6B7280] hover:text-[#373737]',
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </header>

      {loading && <LoadingState />}

      {!loading && error && (
        <StateMessage
          icon={Inbox}
          title="데이터를 불러오지 못했습니다"
          description={error}
          onRetry={retry}
        />
      )}

      {!loading && !error && !hasData && (
        <StateMessage
          icon={Inbox}
          title="이 기간엔 데이터가 없습니다"
          description="다른 기간을 선택해 보세요."
        />
      )}

      {!loading && !error && hasData && kpis && charts && (
        <div className="space-y-6">
          {/* KPI 그리드 — 비율 4 + 재방문/시간 2 */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <RateCard kpi={kpis.inputRate} />
            <RateCard kpi={kpis.resultRate} />
            <RateCard kpi={kpis.intentRate} />
            <RateCard kpi={kpis.overallIntentRate} />
            <RateCard kpi={kpis.revisitRate} />
            <DurationCard kpi={kpis.timeToStart} />
          </section>

          {/* 상단: 추이(2/3) + 분포(1/3) */}
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartCard
              title="진입 → 결과 추이"
              subtitle="일별 distinct visitor"
              action={<DailyTrendLegend />}
              className="lg:col-span-2"
            >
              {charts.daily.length > 0 ? (
                <DailyTrendChart data={charts.daily} />
              ) : (
                <EmptyChart label="추이 데이터 없음" />
              )}
            </ChartCard>

            <ChartCard
              title="예산 총액 분포"
              subtitle="result_viewed · 만원 단위"
              className="lg:col-span-1"
            >
              {charts.budgetDistribution.length > 0 ? (
                <BudgetDistributionChart
                  data={charts.budgetDistribution.map((b) => ({
                    label: fmtBudgetLabel(b.lower, b.upper as number | null),
                    n: b.n,
                  }))}
                />
              ) : (
                <EmptyChart label="예산 데이터 없음" />
              )}
            </ChartCard>
          </section>

          {/* 하단: 퍼널 풀폭 + 페르소나 분포 */}
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartCard
              title="핵심 퍼널"
              subtitle="진입 → 입력 → 결과 → 의도 (visitor)"
              className="lg:col-span-2"
            >
              <FunnelChart
                data={charts.funnel.map((s) => ({
                  label: s.label,
                  visitors: s.visitors,
                }))}
              />
            </ChartCard>

            <ChartCard
              title="페르소나 분포"
              subtitle="distinct visitor"
              className="lg:col-span-1"
            >
              {charts.personaDistribution.length > 0 ? (
                <div className="px-2">
                  <PersonaDistribution data={charts.personaDistribution} />
                </div>
              ) : (
                <EmptyChart label="페르소나 데이터 없음" />
              )}
            </ChartCard>
          </section>

          <p className="pt-2 text-center text-[12px] text-[#9CA3AF]">
            모든 수치는 visitor_id 기준 · 델타는 직전 동일 길이 기간(
            {w?.prevFrom} ~ {w?.prevTo}) 대비 · 분모 10 미만 KPI는 흐리게 표시.
          </p>
        </div>
      )}
    </>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-[#9CA3AF]">
      <Eye className="size-5" />
      <span className="text-[12px]">{label}</span>
    </div>
  );
}
