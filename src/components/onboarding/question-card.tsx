// 옵션 카드 — 클릭 시 height/size 변화 없이 색상만 즉시 전환.
// 팀 피드백(2026-05-28): 클릭 시 미세 움직임 거슬림 → 모든 transition 제거.

type Props = {
  selected: boolean;
  label: string;
  desc?: string;
  disabled?: boolean;
  onClick: () => void;
};

// 카드 / 원형 크기는 선택·미선택 동일. 차이는 색·border뿐.
const CARD_HEIGHT = 'min-h-[74px]';
const INDICATOR_SIZE = 'h-7 w-7';

export function QuestionCard({ selected, label, desc, disabled, onClick }: Props) {
  if (disabled) {
    return (
      <button
        type="button"
        disabled
        aria-disabled
        className={`flex ${CARD_HEIGHT} w-full cursor-not-allowed items-center justify-between rounded-[14px] border-2 border-[#F3F4F6] bg-[#F9FAFB] px-5 py-5 text-left`}
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
      className={`flex ${CARD_HEIGHT} w-full items-center justify-between gap-3 rounded-[14px] border-2 px-5 py-5 text-left ${
        selected
          ? 'border-[#AAC7E1] bg-[rgba(170,199,225,0.3)]'
          : 'border-[#E5E7EB] bg-white'
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
        <div
          className={`flex ${INDICATOR_SIZE} shrink-0 items-center justify-center rounded-full bg-[#AAC7E1]`}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path
              d="M4.5 9L7.5 12L13.5 6"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ) : (
        <div
          className={`${INDICATOR_SIZE} shrink-0 rounded-full border-2 border-[#D1D5DC] bg-white`}
        />
      )}
    </button>
  );
}
