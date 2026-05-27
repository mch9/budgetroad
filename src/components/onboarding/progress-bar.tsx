// 진행률 바 — macro STEP 3단계 segment + sub-progress 라벨
// Figma: 14px Pretendard #6A7282 라벨 / 10px 바 / 활성 #AAC7E1 / 비활성 #E5E7EB
// segment는 macro phase(STEP 1·2·3) 단위. sub-progress(13문항 내 위치)는 우측 % 라벨로 표시.

type Props = {
  currentStep: number; // 0-based, sub-progress 계산용
  totalSteps: number; // sub-progress 총합 (예: STEP 1 = 13문항)
  macroStep?: number; // 1-based 현재 macro 단계
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
        {Array.from({ length: macroTotal }).map((_, i) => (
          <div
            key={i}
            className={`h-[10px] flex-1 rounded-full transition-colors duration-300 ${
              i < macroStep ? 'bg-[#AAC7E1]' : 'bg-[#E5E7EB]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
