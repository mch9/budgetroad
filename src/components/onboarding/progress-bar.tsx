// 진행률 바 — 질문 카테고리(Q형/T형/M형) 단위 3 segment
// Figma: 14px Pretendard #6A7282 라벨 / 10px 바 / 활성 #AAC7E1 / 비활성 #E5E7EB
// macroStep 1·2·3 = Q형·T형·M형 진행 중. segment는 카테고리 진입 시 하나씩 활성.
// sub-progress(전체 문항 진행률)는 우측 % 라벨로 표시.

type Props = {
  currentStep: number;
  totalSteps: number;
  macroStep?: number;
  macroTotal?: number;
};

export function ProgressBar({
  currentStep,
  totalSteps,
  macroStep = 1,
  macroTotal = 3,
}: Props) {
  const percent = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-3">
        <span className="text-sm leading-5 text-[#6A7282]">
          단계 STEP {macroStep} / {macroTotal}
        </span>
        <span className="text-sm leading-5 text-[#6A7282]">{percent}% 완료</span>
      </div>
      <div className="flex w-full gap-[6px]">
        {Array.from({ length: macroTotal }).map((_, i) => {
          const idx = i + 1;
          const isActive = idx <= macroStep;
          return (
            <div
              key={i}
              className={`h-[10px] flex-1 rounded-full transition-colors duration-300 ${
                isActive ? 'bg-[#AAC7E1]' : 'bg-[#E5E7EB]'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
