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
  addCustomItem: (name: string, filterCategory: 'venue' | 'studio' | 'dress' | 'makeup' | 'other', amount: number) => void;
  removeItem: (itemId: string) => void;
  totalEstimated: number;
  totalActual: number;
};

const CATEGORY_OPTIONS: { label: string; value: 'venue' | 'studio' | 'dress' | 'makeup' | 'other' }[] = [
  { label: '예식장', value: 'venue' },
  { label: '스튜디오', value: 'studio' },
  { label: '드레스', value: 'dress' },
  { label: '메이크업', value: 'makeup' },
  { label: '기타', value: 'other' },
];

export function BudgetTab({ items, actual, setActualAmount, addCustomItem, removeItem, totalEstimated, totalActual }: Props) {
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState<'venue' | 'studio' | 'dress' | 'makeup' | 'other'>('other');

  const filtered =
    filter === 'all' ? items : items.filter((item) => item.filterCategory === filter);

  function openModal() {
    setNewName('');
    setNewAmount('');
    setNewCategory('other');
    setShowModal(true);
  }

  function submitCustomItem() {
    const parsed = parseInt(newAmount, 10);
    if (!newName.trim() || isNaN(parsed) || parsed <= 0) return;
    addCustomItem(newName.trim(), newCategory, parsed);
    setFilter('all');
    setShowModal(false);
  }

  return (
    <div className="pb-4">
      <BudgetSummary
        totalEstimated={totalEstimated}
        totalActual={totalActual}
      />

      <div className="px-5 py-3">
        <button
          type="button"
          onClick={openModal}
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
          <p className="mt-1">먼저 예산 결과를 만들어 주세요.</p>
        </div>
      ) : (
        <div className="space-y-3 px-5">
          {filtered.map((item) => (
            <BudgetItemCard
              key={item.id}
              item={item}
              actualAmount={actual[item.id]}
              onSetActual={setActualAmount}
              onDelete={removeItem}
            />
          ))}
        </div>
      )}

      {/* 지출 추가 모달 */}
      {showModal && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/40"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-[576px] rounded-t-3xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="pb-5 text-lg font-semibold text-[#171717]">지출 추가하기</p>

            <div className="space-y-4">
              {/* 항목명 */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#6A7282]">항목명</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="예: 스드메 추가 옵션"
                  className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm outline-none focus:border-[#AAC7E1]"
                  autoFocus
                />
              </div>

              {/* 카테고리 */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#6A7282]">카테고리</label>
                <div className="flex gap-2">
                  {CATEGORY_OPTIONS.map(({ label, value }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setNewCategory(value)}
                      className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                        newCategory === value
                          ? 'border-[#AAC7E1] bg-[rgba(170,199,225,0.15)] text-[#373737]'
                          : 'border-[#E5E7EB] text-[#6A7282]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 금액 */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#6A7282]">금액</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="0"
                    className="flex-1 rounded-xl border border-[#E5E7EB] px-4 py-3 text-right text-sm tabular-nums outline-none focus:border-[#AAC7E1]"
                  />
                  <span className="text-sm text-[#6A7282]">만원</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-xl bg-[#F5F5F5] py-3 text-sm font-medium text-[#666666]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={submitCustomItem}
                disabled={!newName.trim() || !newAmount || parseInt(newAmount) <= 0}
                className="flex-1 rounded-xl bg-[#373737] py-3 text-sm font-semibold text-white disabled:opacity-40"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
