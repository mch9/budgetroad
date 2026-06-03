'use client';

import { useState } from 'react';
import type { BudgetItem, ActualAmounts } from '@/hooks/useBudgetTrackingState';
import { BudgetSummary } from './BudgetSummary';
import { BudgetCategoryFilter, type FilterCategory } from './BudgetCategoryFilter';
import { BudgetItemCard } from './BudgetItemCard';

type Props = {
  items: BudgetItem[];
  actual: ActualAmounts;
  setActualAmount: (itemId: string, amount: number | undefined) => void;
  totalEstimated: number;
  totalActual: number;
};

export function BudgetTab({ items, actual, setActualAmount, totalEstimated, totalActual }: Props) {
  const [filter, setFilter] = useState<FilterCategory>('all');

  const filtered =
    filter === 'all' ? items : items.filter((item) => item.filterCategory === filter);

  return (
    <div className="pb-4">
      <BudgetSummary totalEstimated={totalEstimated} totalActual={totalActual} />

      {/* 지출 추가 버튼 */}
      <div className="px-5 py-3">
        <button
          type="button"
          className="w-full rounded-2xl border-2 border-[#E5E7EB] py-3 text-sm font-medium text-[#364153] transition-colors hover:border-[#AAC7E1]"
        >
          + 지출 추가하기
        </button>
      </div>

      <div className="mb-3 mt-1">
        <BudgetCategoryFilter active={filter} onChange={setFilter} />
      </div>

      {items.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-[#99A1AF]">
          <p>예산 데이터가 없어요.</p>
          <p className="mt-1">결과 페이지에서 준비 시작하기를 눌러주세요.</p>
        </div>
      ) : (
        <div className="space-y-3 px-5">
          {filtered.map((item) => (
            <BudgetItemCard
              key={item.id}
              item={item}
              actualAmount={actual[item.id]}
              onSetActual={setActualAmount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
