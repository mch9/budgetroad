'use client';

// 분석 대시보드 차트 — recharts 기반. 데이터 레이어 응답 모양과 독립된 로컬 타입.
// 디자인: 세로 격자 제거, 축선 제거 + 옅은 라벨, monotone 곡선, 막대 상단 라운드,
// 커스텀 흰 카드 툴팁. 색은 데이터에만(브랜드 블루 단색 + 분포는 다색 팔레트).

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// ── 로컬 표시 타입 (queries에서 import 하지 않음) ──
export type DailyRow = {
  day: string;
  entered: number;
  inputStarted: number;
  resulted: number;
};
export type FunnelRow = { label: string; visitors: number };
export type BudgetRow = { label: string; n: number };
export type PersonaRow = { persona: string; visitors: number };

// 차트 다색 팔레트 (globals.css --c-1~6 과 정합)
const PALETTE = ['#7AA5CB', '#5B8DB8', '#9DB4C0', '#C4A77D', '#A8A29E', '#84B6A3'];
const SERIES_BLUE = '#7AA5CB';
const FAINT = '#9CA3AF';

const AXIS_TICK = { fill: FAINT, fontSize: 11 } as const;

// ── 커스텀 흰 카드 툴팁 ──
type TooltipEntry = {
  name?: string;
  dataKey?: string | number;
  value?: number | string;
  color?: string;
  payload?: Record<string, unknown>;
};

function DashTooltip({
  active,
  payload,
  label,
  formatValue,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  formatValue?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-white px-3 py-2 text-[12px] shadow-[0_4px_16px_rgba(16,24,40,0.12)] ring-1 ring-black/[0.06]">
      {label !== undefined && (
        <p className="mb-1 font-medium text-[#6B7280]">{label}</p>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((p, i) => {
          const v = typeof p.value === 'number' ? p.value : Number(p.value ?? 0);
          return (
            <div key={i} className="flex items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ background: p.color }}
              />
              <span className="text-[#373737]">{p.name}</span>
              <span className="ml-auto pl-3 font-semibold tabular-nums text-[#111827]">
                {formatValue ? formatValue(v) : v.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 차트 B: 일별 추이 (AreaChart, 진입/입력/결과 3 시리즈) ──
const DAILY_SERIES: { key: keyof DailyRow; label: string; color: string }[] = [
  { key: 'entered', label: '진입', color: '#5B8DB8' },
  { key: 'inputStarted', label: '입력 시작', color: '#7AA5CB' },
  { key: 'resulted', label: '결과 확인', color: '#9DB4C0' },
];

export function DailyTrendChart({ data }: { data: DailyRow[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart
        data={data}
        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
      >
        <defs>
          {DAILY_SERIES.map((s) => (
            <linearGradient
              key={s.key}
              id={`fill-${s.key}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={s.color} stopOpacity={0.18} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={AXIS_TICK}
          minTickGap={32}
          tickFormatter={(v: string) => (typeof v === 'string' ? v.slice(5) : v)}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={AXIS_TICK}
          width={40}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ stroke: 'rgba(0,0,0,0.12)', strokeWidth: 1 }}
          content={<DashTooltip />}
        />
        {DAILY_SERIES.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={2}
            fill={`url(#fill-${s.key})`}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff', fill: s.color }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function DailyTrendLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {DAILY_SERIES.map((s) => (
        <span
          key={s.key}
          className="flex items-center gap-1.5 text-[12px] text-[#6B7280]"
        >
          <span
            className="size-2 rounded-full"
            style={{ background: s.color }}
          />
          {s.label}
        </span>
      ))}
    </div>
  );
}

// ── 차트 A: 퍼널 단계 (BarChart, 단계별 진→연 그라데이션) ──
const FUNNEL_COLORS = ['#5B8DB8', '#7AA5CB', '#9DB4C0', '#C4A77D'];

export function FunnelChart({ data }: { data: FunnelRow[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={data}
        margin={{ top: 16, right: 8, left: -16, bottom: 0 }}
        barCategoryGap="30%"
      >
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={AXIS_TICK}
          interval={0}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={AXIS_TICK}
          width={40}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          content={
            <DashTooltip formatValue={(v) => `${v.toLocaleString()} visitor`} />
          }
        />
        <Bar
          dataKey="visitors"
          name="방문자"
          radius={[6, 6, 0, 0]}
          maxBarSize={64}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── 차트 C: 예산 총액 분포 (BarChart, 다색) ──
export function BudgetDistributionChart({ data }: { data: BudgetRow[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={data}
        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
        barCategoryGap="22%"
      >
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fill: FAINT, fontSize: 10 }}
          interval={0}
          angle={-30}
          textAnchor="end"
          height={48}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={AXIS_TICK}
          width={36}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          content={<DashTooltip formatValue={(v) => `${v.toLocaleString()}건`} />}
        />
        <Bar dataKey="n" name="결과 수" radius={[6, 6, 0, 0]} maxBarSize={32}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── 보조: 페르소나 분포 (가로 막대, 라벨 잘림 없음) ──
export function PersonaDistribution({ data }: { data: PersonaRow[] }) {
  const max = Math.max(...data.map((d) => d.visitors), 1);
  return (
    <div className="flex flex-col gap-3 pt-1">
      {data.map((d, i) => {
        const w = (d.visitors / max) * 100;
        return (
          <div key={d.persona} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-[#373737]">{d.persona}</span>
              <span className="font-semibold tabular-nums text-[#111827]">
                {d.visitors.toLocaleString()}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-black/[0.04]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${w}%`,
                  background: PALETTE[i % PALETTE.length],
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { SERIES_BLUE, PALETTE };
