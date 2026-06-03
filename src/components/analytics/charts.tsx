// 분석 대시보드 프리미티브 — 전부 순수 SVG/Tailwind, 외부 차트 라이브러리 없음.
import type { Kpi, NamedRatio, Ratio } from '@/lib/analytics/queries';

const ACCENT = '#AAC7E1';
const SECONDARY = '#7499BA';
const DARK = '#373737';
const MUTED = '#D9D9D9';

export function pct(num: number, denom: number): number | null {
  return denom > 0 ? (num / denom) * 100 : null;
}

function fmtPct(p: number | null): string {
  return p === null ? '—' : `${p.toFixed(1)}%`;
}

function statusColor(p: number | null, target: number): string {
  if (p === null) return MUTED;
  if (p >= target) return SECONDARY;
  if (p >= target * 0.8) return ACCENT;
  return MUTED;
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 mt-8 border-l-4 border-[#373737] pl-2 text-base font-bold text-[#373737]">
      {children}
    </h2>
  );
}

// 분자/분모 + 비율. 분모<10이면 흐리게(표본 경고).
export function RateText({ num, denom }: Ratio) {
  const p = pct(num, denom);
  const dim = denom < 10;
  return (
    <span className={`tabular-nums ${dim ? 'opacity-50' : ''}`}>
      <span className="font-semibold">{fmtPct(p)}</span>
      <span className="ml-1 text-xs text-[#737373]">
        ({num}/{denom})
      </span>
    </span>
  );
}

export function ScoreCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-3">
      <div className="text-xs text-[#737373]">{label}</div>
      <div className="mt-1 text-2xl font-bold tabular-nums text-[#171717]">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-3">
      <div className="text-xs text-[#737373]">{label}</div>
      <div className="mt-1 text-xl font-bold tabular-nums text-[#171717]">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-[#737373]">{sub}</div>}
    </div>
  );
}

// 목표 대비 게이지 + 마커
export function KpiCard({ name, num, denom, target }: Kpi) {
  const p = pct(num, denom);
  const color = statusColor(p, target);
  const width = p === null ? 0 : Math.min(p, 100);
  const met = p !== null && p >= target;
  const dim = denom < 10;
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-3">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-[#373737]">{name}</span>
        <span className={`text-xs ${met ? 'text-[#7499BA]' : 'text-[#737373]'}`}>
          목표 {target}%
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span
          className={`text-xl font-bold tabular-nums ${dim ? 'opacity-50' : ''}`}
          style={{ color }}
        >
          {fmtPct(p)}
        </span>
        <span className="text-xs tabular-nums text-[#737373]">
          {num}/{denom}
        </span>
      </div>
      <div className="relative mt-2 h-2 w-full rounded-full bg-[#F3F4F6]">
        <div
          className="h-2 rounded-full"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
        <div
          className="absolute top-[-2px] h-3 w-[2px] bg-[#373737]"
          style={{ left: `${Math.min(target, 100)}%` }}
          title={`목표 ${target}%`}
        />
      </div>
    </div>
  );
}

// 가로 퍼널 — 단계별 폭 + 전이율
export function FunnelBar({ steps }: { steps: { label: string; value: number }[] }) {
  const max = Math.max(...steps.map((s) => s.value), 1);
  return (
    <div className="space-y-2">
      {steps.map((s, i) => {
        const prev = i > 0 ? steps[i - 1].value : null;
        const conv = prev && prev > 0 ? (s.value / prev) * 100 : null;
        return (
          <div key={s.label}>
            <div className="flex items-center justify-between text-xs text-[#737373]">
              <span>{s.label}</span>
              <span className="tabular-nums">
                {s.value.toLocaleString()}
                {conv !== null && (
                  <span className="ml-2 text-[#7499BA]">↓ {conv.toFixed(0)}%</span>
                )}
              </span>
            </div>
            <div className="mt-1 h-6 rounded bg-[#F3F4F6]">
              <div
                className="flex h-6 items-center rounded pl-2 text-xs font-medium text-white"
                style={{
                  width: `${Math.max((s.value / max) * 100, 6)}%`,
                  backgroundColor: i === 0 ? DARK : SECONDARY,
                }}
              >
                {s.value > 0 ? s.value : ''}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 세로 막대 — 비율 항목들 (분자/분모 → %)
export function RatioBars({ items }: { items: NamedRatio[] }) {
  const W = 320;
  const H = 140;
  const barW = W / items.length;
  return (
    <div className="overflow-x-auto">
      <svg width={W} height={H + 36} viewBox={`0 0 ${W} ${H + 36}`} className="max-w-full">
        {items.map((it, i) => {
          const p = pct(it.num, it.denom) ?? 0;
          const h = (p / 100) * H;
          const x = i * barW + barW * 0.2;
          const w = barW * 0.6;
          return (
            <g key={it.name}>
              <rect x={x} y={H - h} width={w} height={h} rx={3} fill={ACCENT} />
              <text
                x={x + w / 2}
                y={H - h - 4}
                textAnchor="middle"
                className="fill-[#373737] text-[10px] tabular-nums font-semibold"
              >
                {p.toFixed(0)}%
              </text>
              <text
                x={x + w / 2}
                y={H + 14}
                textAnchor="middle"
                className="fill-[#737373] text-[9px]"
              >
                {it.name.length > 7 ? it.name.slice(0, 6) + '…' : it.name}
              </text>
              <text
                x={x + w / 2}
                y={H + 26}
                textAnchor="middle"
                className="fill-[#9CA3AF] text-[8px] tabular-nums"
              >
                {it.num}/{it.denom}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// 비교 막대 — 그룹 2개 × 1지표 (조정 vs 미조정 등)
export function CompareBars({
  groups,
}: {
  groups: { label: string; num: number; denom: number }[];
}) {
  return (
    <div className="space-y-3">
      {groups.map((g) => {
        const p = pct(g.num, g.denom);
        return (
          <div key={g.label}>
            <div className="flex justify-between text-xs text-[#373737]">
              <span>{g.label}</span>
              <RateText num={g.num} denom={g.denom} />
            </div>
            <div className="mt-1 h-3 w-full rounded bg-[#F3F4F6]">
              <div
                className="h-3 rounded bg-[#7499BA]"
                style={{ width: `${p === null ? 0 : Math.min(p, 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

type Series = { key: string; label: string; color: string };

// 일자별 추이 (멀티 라인)
export function LineChart({
  rows,
  series,
}: {
  rows: Record<string, number | string>[];
  series: Series[];
}) {
  const W = 340;
  const H = 160;
  const pad = { l: 28, r: 8, t: 10, b: 22 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const n = rows.length;
  const maxVal =
    Math.max(
      1,
      ...rows.flatMap((r) => series.map((s) => Number(r[s.key] ?? 0))),
    ) || 1;
  const x = (i: number) => pad.l + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (val: number) => pad.t + innerH - (val / maxVal) * innerH;

  if (n === 0) {
    return <div className="py-6 text-center text-xs text-[#9CA3AF]">데이터 없음</div>;
  }

  return (
    <div className="overflow-x-auto">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="max-w-full">
        <line x1={pad.l} y1={pad.t + innerH} x2={W - pad.r} y2={pad.t + innerH} stroke="#E5E7EB" />
        {series.map((s) => {
          const pts = rows
            .map((r, i) => `${x(i)},${y(Number(r[s.key] ?? 0))}`)
            .join(' ');
          return (
            <g key={s.key}>
              <polyline points={pts} fill="none" stroke={s.color} strokeWidth={2} />
              {rows.map((r, i) => (
                <circle
                  key={i}
                  cx={x(i)}
                  cy={y(Number(r[s.key] ?? 0))}
                  r={2.5}
                  fill={s.color}
                />
              ))}
            </g>
          );
        })}
        {rows.map((r, i) => (
          <text
            key={i}
            x={x(i)}
            y={H - 6}
            textAnchor="middle"
            className="fill-[#9CA3AF] text-[8px]"
          >
            {String(r.day).slice(5)}
          </text>
        ))}
      </svg>
      <div className="mt-1 flex flex-wrap gap-3">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-1 text-[10px] text-[#737373]">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function DataTable({
  columns,
  rows,
}: {
  columns: { key: string; label: string; align?: 'left' | 'right' }[];
  rows: Record<string, string | number>[];
}) {
  if (rows.length === 0) {
    return <div className="py-4 text-center text-xs text-[#9CA3AF]">데이터 없음</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[#E5E7EB] text-[#737373]">
            {columns.map((c) => (
              <th
                key={c.key}
                className={`py-1.5 px-2 font-medium ${c.align === 'right' ? 'text-right' : 'text-left'}`}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-[#F3F4F6]">
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`py-1.5 px-2 tabular-nums text-[#373737] ${c.align === 'right' ? 'text-right' : 'text-left'}`}
                >
                  {r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-[#373737]">{title}</h3>
      {children}
    </div>
  );
}
