'use client';

import { trackEvent } from '@/lib/gtag';

type Props = {
  persona: string;
  totalBudget: number;
  onDone: () => void; // 답/닫기 모두 → 저장 모달로 진행 (세션 1회 처리는 부모)
};

export function SatisfactionModal({ persona, totalBudget, onDone }: Props) {
  function answer(matched: 'yes' | 'no') {
    trackEvent('satisfaction_answered', { matched, persona, total_budget: totalBudget });
    onDone();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onDone}>
      <div
        className="w-full rounded-t-3xl bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="pb-1 text-lg font-semibold leading-snug text-[#171717]">
            이 결과가 내가 원하는 결혼 스타일과
            <br />잘 맞는다고 느끼셨나요?
          </p>
          <button
            type="button"
            onClick={onDone}
            aria-label="닫기"
            className="shrink-0 rounded-full px-2 py-1 text-xl leading-none text-[#A1A1A1]"
          >
            ✕
          </button>
        </div>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => answer('no')}
            className="flex-1 rounded-xl border border-[#E5E5E5] bg-white py-3 text-sm font-semibold text-[#525252] active:scale-[0.99]"
          >
            아니요
          </button>
          <button
            type="button"
            onClick={() => answer('yes')}
            className="flex-1 rounded-xl bg-[#373737] py-3 text-sm font-bold text-white active:scale-[0.99]"
          >
            예
          </button>
        </div>
      </div>
    </div>
  );
}
