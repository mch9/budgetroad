'use client';

type Props = {
  totalEstimated: number;
  totalActual: number;
  unrecordedEstimated: number; // 실제 금액 미입력 항목들의 예상 합계
};

export function BudgetSummary({ totalEstimated, totalActual, unrecordedEstimated }: Props) {
  const remaining = totalEstimated - totalActual;

  return (
    <div className="px-5 pt-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-[#4A5565]">지금까지 쓴 돈</p>
          <p className="text-[36px] font-bold leading-tight tabular-nums text-[#0A0A0A]">
            {totalActual.toLocaleString()}
            <span className="ml-1 text-xl">만원</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-[#4A5565]">예상 총 예산</p>
          <p className="text-xl font-bold tabular-nums text-[#0A0A0A]">
            {totalEstimated.toLocaleString()}
            <span className="ml-0.5 text-sm font-normal">만원</span>
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-[rgba(170,199,225,0.3)] px-3 py-2.5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-[#364153]">
            남은 예산 {remaining > 0 ? remaining.toLocaleString() : 0}만원
          </span>
          <span className="text-[#4A5565]">
            결제 예정 {unrecordedEstimated.toLocaleString()}만원
          </span>
        </div>
      </div>
    </div>
  );
}
