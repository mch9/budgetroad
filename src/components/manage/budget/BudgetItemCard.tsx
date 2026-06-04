'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { BudgetItem } from '@/hooks/useBudgetTrackingState';

type Props = {
  item: BudgetItem;
  actualAmount: number | undefined;
  onSetActual: (id: string, amount: number | undefined) => void;
  onDelete: (id: string) => void;
};

export function BudgetItemCard({ item, actualAmount, onSetActual, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const isDone = actualAmount !== undefined;
  const diff = isDone ? actualAmount - item.estimatedAmount : undefined;

  function startEdit() {
    setInputValue(actualAmount?.toString() ?? '');
    setEditing(true);
  }

  function commitEdit() {
    const parsed = parseInt(inputValue.replace(/,/g, ''), 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onSetActual(item.id, parsed); // 만원 단위 그대로 저장
    } else if (inputValue.trim() === '') {
      onSetActual(item.id, undefined);
    }
    setEditing(false);
  }

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
      {/* 헤더: 상태 배지 + 카테고리 + 항목명 + 삭제 */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-[4px] px-2 py-px text-[11px] ${
                isDone ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#DCE9FF] text-[#1E293B]'
              }`}
            >
              {isDone ? '완료' : '준비'}
            </span>
            <span className="text-xs font-light text-[#1E293B]">{item.category}</span>
          </div>
          <p className="text-xl font-semibold text-[#1E293B]">{item.name}</p>
        </div>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="shrink-0 rounded-lg p-1.5 text-[#C4C9D4] transition-colors hover:bg-red-50 hover:text-red-400"
          aria-label="항목 삭제"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="mt-4 h-px bg-[#F4F4F4]" />

      {/* 금액 내역 — 전체 만원 단위로 통일 */}
      <div className="mt-4 rounded-xl bg-[rgba(217,217,217,0.3)] p-3">
        {!item.custom && (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#45474C]">예상 금액</span>
              <span className="tabular-nums text-[#1E293B]">
                {item.estimatedAmount.toLocaleString()}만원
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-[#45474C]">차이 금액</span>
              <span
                className={`tabular-nums ${
                  diff === undefined
                    ? 'text-[#1E293B]'
                    : diff > 0
                      ? 'text-red-500'
                      : diff < 0
                        ? 'text-emerald-600'
                        : 'text-[#1E293B]'
                }`}
              >
                {diff === undefined
                  ? '-'
                  : diff === 0
                    ? '±0'
                    : `${diff > 0 ? '+' : '-'}${Math.abs(diff).toLocaleString()}만원`}
              </span>
            </div>
          </>
        )}

        <div className={`${!item.custom ? 'mt-2 border-t border-[#DBDBDB] pt-2' : ''}`}>
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-[#1E293B]">실제 금액</span>
            {editing ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e) => e.key === 'Enter' && commitEdit()}
                  className="w-28 rounded border border-[#AAC7E1] px-2 py-0.5 text-right text-sm tabular-nums outline-none focus:border-[#7499BA]"
                  placeholder="0"
                  autoFocus
                />
                <span className="text-xs text-[#6A7282]">만원</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={startEdit}
                className={`tabular-nums underline-offset-2 hover:underline ${
                  isDone ? 'font-semibold text-[#1E293B]' : 'text-[#99A1AF]'
                }`}
              >
                {actualAmount !== undefined ? `${actualAmount.toLocaleString()}만원` : '탭해서 입력'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
