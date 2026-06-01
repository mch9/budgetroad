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

  // 예/아니요 동일 스타일 — 측정용 설문이라 어느 쪽도 강조하지 않아 응답 편향 제거
  const buttonClass =
    'flex-1 rounded-xl border border-[rgba(170,199,225,0.4)] bg-white py-3.5 text-base font-semibold text-[#373737] transition-colors hover:border-[#AAC7E1] hover:bg-[rgba(170,199,225,0.08)] active:scale-[0.99]';

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onDone}>
      <div
        className="w-full rounded-t-3xl bg-white px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onDone}
            aria-label="닫기"
            className="-mr-1 flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none text-[#A1A1A1] transition-colors hover:bg-[#F5F5F5]"
          >
            ✕
          </button>
        </div>
        <p className="pb-6 pt-1 text-lg font-bold leading-snug text-[#171717]">
          이 결과가 내가 원하는 결혼 스타일과
          <br />잘 맞는다고 느끼셨나요?
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={() => answer('no')} className={buttonClass}>
            아니요
          </button>
          <button type="button" onClick={() => answer('yes')} className={buttonClass}>
            예
          </button>
        </div>
      </div>
    </div>
  );
}
