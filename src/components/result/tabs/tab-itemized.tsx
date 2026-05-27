'use client';

import type { ResultPayload } from '@/lib/budget-engine';

type Props = { result: ResultPayload };

export function TabItemized({ result }: Props) {
  return (
    <div className="flex flex-col gap-5 px-5 pb-6 pt-6">
      <p className="text-center text-sm text-[#6A7282]">
        탭 2 — 항목별 내역 (도넛 차트·드롭다운은 C6에서 추가됩니다)
      </p>
      <div className="flex flex-col gap-2">
        {(Object.entries(result.budget.categories) as Array<[string, number]>).map(([cat, amount]) => (
          <div
            key={cat}
            className="flex items-center justify-between rounded-2xl border border-[#E5E5E5] bg-white px-5 py-4"
          >
            <span className="text-base font-medium text-[#171717]">{cat}</span>
            <span className="text-base font-semibold tabular-nums text-[#7499BA]">
              {amount.toLocaleString()}만원
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
