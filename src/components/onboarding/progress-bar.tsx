// 진행률 바 — 질문 1개당 1 segment (총 totalSteps개)
// Figma: 14px Pretendard #6A7282 라벨 / 10px 바 / 활성 #AAC7E1 / 비활성 #E5E7EB

type Props = {
  currentStep: number; // 0-based
  totalSteps: number;
};

export function ProgressBar({ currentStep, totalSteps }: Props) {
  const percent = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-3">
        <span className="text-sm leading-5 text-[#6A7282]">
          단계 {currentStep + 1} / {totalSteps}
        </span>
        <span className="text-sm leading-5 text-[#6A7282]">{percent}% 완료</span>
      </div>
      <div className="flex w-full gap-[4px]">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-[10px] flex-1 rounded-full transition-colors duration-300 ${
              i <= currentStep ? 'bg-[#AAC7E1]' : 'bg-[#E5E7EB]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
