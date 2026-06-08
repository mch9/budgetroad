'use client';

import type { ResultPayload } from '@/lib/budget-engine';

type Props = {
  result: ResultPayload;
  onShareClick: () => void;
};

// 결과 화면 하단 다크 요약바. 고정 위치·safe-area·하단 탭바와의 스택은 부모 dock이 담당.
export function ResultFooter({ result, onShareClick }: Props) {
  const total = result.budget.total;
  const delta = result.budget.toggleDelta;

  return (
    <div className="bg-[#373737]">
      <div className="mx-auto flex max-w-[576px] items-center justify-between gap-3 px-5 py-3">
        <div className="flex min-w-0 flex-col">
          <span className="text-[11px] leading-4 text-white/60">
            예상 총 예산{' '}
            <span className="font-semibold text-[#AAC7E1]">+{delta.toLocaleString()}만원</span>
          </span>
          <span className="text-[22px] font-bold leading-7 tabular-nums text-white">
            {total.toLocaleString()}
            <span className="ml-1 text-sm font-normal text-white/80">만원</span>
          </span>
        </div>
        <button
          type="button"
          onClick={onShareClick}
          className="shrink-0 rounded-2xl bg-[#AAC7E1] px-5 py-[10px] text-sm font-semibold text-[#171717] transition-opacity active:opacity-80"
        >
          저장 & 공유
        </button>
      </div>
    </div>
  );
}
