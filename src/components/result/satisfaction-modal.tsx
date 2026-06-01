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
    // 가운데 컴팩트 모달 (배경 dim 유지). 풀폭 하단 시트는 데스크톱에서 과하게 넓어 폐기.
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
      onClick={onDone}
    >
      <div
        className="w-full max-w-[340px] rounded-3xl bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onDone}
            aria-label="닫기"
            className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none text-[#A1A1A1] transition-colors hover:bg-[#F5F5F5]"
          >
            ✕
          </button>
        </div>
        {/* 강제 줄바꿈(br) 없이 카드 폭에 맞춰 자연 줄바꿈 */}
        <p className="px-1 pb-6 pt-1 text-center text-lg font-bold leading-snug text-[#171717]">
          이 결과가 내가 원하는 결혼 스타일과 잘 맞는다고 느끼셨나요?
        </p>
        {/* 버튼 순서: 아니요(부정)=왼쪽 · 예(긍정)=오른쪽 — iOS HIG·Material 컨벤션(affirmative=오른쪽) */}
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
