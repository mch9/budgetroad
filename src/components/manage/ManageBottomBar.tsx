'use client';

import Link from 'next/link';

type Props = {
  totalEstimated: number;
  totalActual: number;
};

export function ManageBottomBar({ totalEstimated, totalActual }: Props) {
  const delta = totalActual - totalEstimated;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 bg-[#373737]"
      style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.18)' }}
    >
      <div className="mx-auto flex max-w-[576px] items-center justify-between gap-3 px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[11px] leading-4 text-white/60">
            예상 총 예산보다{' '}
            {totalActual > 0 && delta !== 0 && (
              <span className={`font-semibold ${delta > 0 ? 'text-[#F87171]' : 'text-[#AAC7E1]'}`}>
                {delta > 0 ? '+' : ''}
                {delta.toLocaleString()}만원
              </span>
            )}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[11px] text-white/60">실제 입력 금액</span>
            <span className="text-[22px] font-bold leading-7 tabular-nums text-white">
              {totalActual.toLocaleString()}
              <span className="ml-1 text-sm font-normal text-white/80">만원</span>
            </span>
          </div>
        </div>
        <Link
          href="/budget-draft"
          className="shrink-0 rounded-2xl bg-[#AAC7E1] px-5 py-[10px] text-sm font-semibold text-[#171717] transition-opacity active:opacity-80"
        >
          결과페이지로
        </Link>
      </div>
    </nav>
  );
}
