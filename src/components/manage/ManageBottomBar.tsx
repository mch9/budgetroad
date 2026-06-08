'use client';

type Props = {
  totalEstimated: number;
  totalActual: number;
};

// 플래너 하단 다크 요약바(정보 전용). 결과 복귀는 하단 탭바의 Result 탭이 담당.
// 고정 위치·safe-area·탭바와의 스택은 부모 dock이 담당.
export function ManageBottomBar({ totalEstimated, totalActual }: Props) {
  const delta = totalActual - totalEstimated;

  return (
    <div className="bg-[#373737]">
      <div className="mx-auto flex max-w-[576px] items-center justify-between gap-3 px-5 py-3">
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
      </div>
    </div>
  );
}
