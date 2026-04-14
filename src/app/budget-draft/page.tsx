'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/gtag';
import {
  type Region,
  type ItemId,
  type SelectedItem,
  type BudgetResult,
  REGIONS,
  BUDGET_ITEMS,
  VENUE_OPTIONS,
  HONEYMOON_OPTIONS,
  calculateBudget,
  getDefaultSubOption,
} from '@/lib/budget-data';

type Phase = 'input' | 'result';

export default function BudgetDraftPage() {
  const [phase, setPhase] = useState<Phase>('input');
  const [region, setRegion] = useState<Region>('seoul');
  const [selectedIds, setSelectedIds] = useState<Set<ItemId>>(new Set());
  const [venueType, setVenueType] = useState('wedding-hall');
  const [honeymoonType, setHoneymoonType] = useState('southeast-asia');
  const [results, setResults] = useState<BudgetResult[]>([]);

  const enteredAt = useRef<number>(0);
  const inputStarted = useRef(false);

  useEffect(() => {
    enteredAt.current = Date.now();
    trackEvent('budget_draft_entered');
  }, []);

  function trackFirstInput() {
    if (inputStarted.current) return;
    inputStarted.current = true;
    const elapsed = Math.round((Date.now() - enteredAt.current) / 1000);
    trackEvent('input_started', { time_to_start_sec: elapsed });
  }

  function toggleItem(id: ItemId) {
    trackFirstInput();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleSubmit() {
    const items: SelectedItem[] = Array.from(selectedIds).map((id) => ({
      id,
      subOption: getDefaultSubOption(id)
        ? id === 'venue'
          ? venueType
          : honeymoonType
        : undefined,
    }));
    const budgetResults = calculateBudget(region, items);
    const totalAmount = budgetResults.reduce((sum, r) => sum + r.amount, 0);
    trackEvent('result_viewed', {
      region,
      item_count: budgetResults.length,
      total_amount: totalAmount,
    });
    setResults(budgetResults);
    setPhase('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleReset() {
    setPhase('input');
    setResults([]);
  }

  const totalAmount = results.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border/50 bg-white/80 px-6 backdrop-blur-sm sm:px-10">
        <Link href="/" className="text-lg font-extrabold text-primary">
          버젯로드
        </Link>
        {phase === 'result' && (
          <button
            onClick={handleReset}
            className="text-sm font-medium text-primary hover:underline"
          >
            ← 다시 선택하기
          </button>
        )}
      </header>

      <main className="flex flex-1 flex-col items-center px-4 py-8 sm:px-6 sm:py-12">
        {phase === 'input' ? (
          <InputPhase
            region={region}
            onRegionChange={(r) => {
              trackFirstInput();
              setRegion(r);
            }}
            selectedIds={selectedIds}
            onToggleItem={toggleItem}
            venueType={venueType}
            onVenueTypeChange={setVenueType}
            honeymoonType={honeymoonType}
            onHoneymoonTypeChange={setHoneymoonType}
            onSubmit={handleSubmit}
          />
        ) : (
          <ResultPhase
            region={region}
            results={results}
            totalAmount={totalAmount}
          />
        )}
      </main>
    </div>
  );
}

function InputPhase({
  region,
  onRegionChange,
  selectedIds,
  onToggleItem,
  venueType,
  onVenueTypeChange,
  honeymoonType,
  onHoneymoonTypeChange,
  onSubmit,
}: {
  region: Region;
  onRegionChange: (r: Region) => void;
  selectedIds: Set<ItemId>;
  onToggleItem: (id: ItemId) => void;
  venueType: string;
  onVenueTypeChange: (v: string) => void;
  honeymoonType: string;
  onHoneymoonTypeChange: (v: string) => void;
  onSubmit: () => void;
}) {
  const hasSelection = selectedIds.size > 0;

  return (
    <div className="w-full max-w-xl space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          어떤 결혼을 계획하고 계세요?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          해당하는 항목을 선택해주세요. 선택한 항목에 맞는 예산 초안을
          만들어드릴게요.
        </p>
      </div>

      {/* Region */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">지역</h2>
        <div className="flex gap-3">
          {REGIONS.map((r) => (
            <button
              key={r.value}
              onClick={() => onRegionChange(r.value)}
              className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                region === r.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </section>

      {/* Items */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">결혼 준비 항목</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {BUDGET_ITEMS.map((item) => {
            const selected = selectedIds.has(item.id);
            return (
              <button
                key={item.id}
                onClick={() => onToggleItem(item.id)}
                className={`rounded-lg border px-3 py-3 text-sm font-medium transition-colors ${
                  selected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                {selected ? '✓ ' : ''}
                {item.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Sub Options */}
      {(selectedIds.has('venue') || selectedIds.has('honeymoon')) && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold">세부 조건</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {selectedIds.has('venue') && (
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">
                  식장 종류
                </label>
                <select
                  value={venueType}
                  onChange={(e) => onVenueTypeChange(e.target.value)}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
                >
                  {VENUE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {selectedIds.has('honeymoon') && (
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">
                  신혼여행 지역
                </label>
                <select
                  value={honeymoonType}
                  onChange={(e) => onHoneymoonTypeChange(e.target.value)}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
                >
                  {HONEYMOON_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Submit */}
      <button
        onClick={onSubmit}
        disabled={!hasSelection}
        className="w-full rounded-xl bg-primary py-3.5 text-base font-semibold text-primary-foreground shadow-[0_4px_12px_rgba(255,132,0,0.2)] transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-40 disabled:shadow-none"
      >
        {hasSelection ? '예산 초안 만들기' : '항목을 1개 이상 선택해주세요'}
      </button>
    </div>
  );
}

const CHART_COLORS = [
  '#FF8400',
  '#FF9F33',
  '#FFB74D',
  '#FFCC80',
  '#FFE0B2',
  '#FFF3E0',
  '#E8A35E',
  '#D4894A',
  '#C07038',
  '#A85828',
];

function ResultPhase({
  region,
  results,
  totalAmount,
}: {
  region: Region;
  results: BudgetResult[];
  totalAmount: number;
}) {
  const regionLabel = REGIONS.find((r) => r.value === region)?.label ?? '';
  const itemSummary = results.map((r) => r.label).join(' + ');

  // Donut chart calculations
  const segments = results.reduce<
    Array<BudgetResult & { pct: number; startDeg: number; color: string }>
  >((acc, r, i) => {
    const pct = totalAmount > 0 ? r.amount / totalAmount : 0;
    const startDeg = acc.length > 0 ? acc[acc.length - 1].startDeg + acc[acc.length - 1].pct * 360 : 0;
    acc.push({ ...r, pct, startDeg, color: CHART_COLORS[i % CHART_COLORS.length] });
    return acc;
  }, []);

  const conicGradient = segments
    .map((s) => `${s.color} ${s.startDeg}deg ${s.startDeg + s.pct * 360}deg`)
    .join(', ');

  return (
    <div className="w-full max-w-3xl space-y-8">
      {/* Total */}
      <div className="rounded-2xl bg-orange-50/60 px-6 py-8 text-center">
        <p className="text-sm text-muted-foreground">총 예상 예산</p>
        <p className="mt-2 font-mono text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">
          약 {totalAmount.toLocaleString()}만원
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {regionLabel} · {itemSummary} 기준
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Table */}
        <div className="flex-1 space-y-3">
          <h2 className="text-lg font-semibold">항목별 예상 금액</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                    항목
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                    세부조건
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">
                    예상 금액
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.itemId} className="border-t border-border">
                    <td className="px-4 py-3">{r.label}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.subOptionLabel}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium">
                      {r.amount.toLocaleString()}만원
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart */}
        <div className="space-y-3 lg:w-72">
          <h2 className="text-lg font-semibold">항목별 비율</h2>
          <div className="flex items-center gap-6 lg:flex-col lg:items-start">
            <div
              className="h-36 w-36 shrink-0 rounded-full sm:h-44 sm:w-44"
              style={{
                background: `conic-gradient(${conicGradient})`,
                WebkitMask:
                  'radial-gradient(circle, transparent 40%, black 41%)',
                mask: 'radial-gradient(circle, transparent 40%, black 41%)',
              }}
            />
            <div className="flex flex-col gap-2">
              {segments.map((s) => (
                <div key={s.itemId} className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-sm"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-sm">
                    {s.label} {Math.round(s.pct * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Source */}
      <p className="text-center text-xs text-muted-foreground/70">
        * 통계 출처: 2025년 결혼비용 실태조사 (듀오) 기준, 실제 금액은
        업체/조건에 따라 달라질 수 있습니다.
      </p>
    </div>
  );
}
