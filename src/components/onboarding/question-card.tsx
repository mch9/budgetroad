// 옵션 카드 — Figma: 선택 76px / 미선택 72px / 우측 체크 원형
// 긴 옵션 라벨이 있는 질문(Q1·Q4·Q7·Q8·T7 등)에 대비해 min-h + wrap 허용

type Props = {
  selected: boolean;
  label: string;
  desc?: string;
  disabled?: boolean;
  onClick: () => void;
};

export function QuestionCard({ selected, label, desc, disabled, onClick }: Props) {
  if (disabled) {
    return (
      <button
        type="button"
        disabled
        aria-disabled
        className="flex min-h-[72px] w-full cursor-not-allowed items-center justify-between rounded-[14px] border-2 border-[#F3F4F6] bg-[#F9FAFB] px-5 py-5 text-left"
      >
        <span className="text-lg font-medium leading-7 text-[#9CA3AF]">{label}</span>
        <span className="ml-3 shrink-0 rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs text-[#9CA3AF]">
          준비 중
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 rounded-[14px] border-2 px-5 py-5 text-left transition-all ${
        selected
          ? 'min-h-[76px] border-[#AAC7E1] bg-[rgba(170,199,225,0.3)]'
          : 'min-h-[72px] border-[#E5E7EB] bg-white'
      }`}
    >
      <div className="flex min-w-0 flex-col">
        <span
          className={`text-lg font-medium leading-7 ${
            selected ? 'text-[#101828]' : 'text-[#364153]'
          }`}
        >
          {label}
        </span>
        {desc && (
          <span className="mt-0.5 text-sm leading-5 text-[#6A7282]">{desc}</span>
        )}
      </div>
      {selected ? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#AAC7E1]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path
              d="M5 10L8.5 13.5L15 6.5"
              stroke="white"
              strokeWidth="1.67"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ) : (
        <div className="h-6 w-6 shrink-0 rounded-full border-2 border-[#D1D5DC] bg-white" />
      )}
    </button>
  );
}
