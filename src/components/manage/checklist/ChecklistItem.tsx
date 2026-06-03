'use client';

import type { ChecklistTag } from '@/lib/checklist-data';

type Props = {
  item: { id: string; text: string; tag?: ChecklistTag };
  checked: boolean;
  onToggle: (id: string) => void;
  highlight?: boolean;
  dynamic?: boolean;
};

const TAG_STYLES: Record<string, string> = {
  중요: 'bg-[rgba(170,199,225,0.3)] text-[#364153]',
  계약: 'bg-[rgba(170,199,225,0.3)] text-[#364153]',
};

export function ChecklistItem({ item, checked, onToggle, highlight, dynamic }: Props) {
  const showMyChoice = highlight || dynamic;

  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(item.id)}
        className="sr-only"
      />
      <span
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
          checked ? 'border-[#AAC7E1] bg-[#AAC7E1]' : 'border-[#D1D5DC] bg-white'
        }`}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden>
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span
        className={`flex-1 text-sm ${checked ? 'text-[#99A1AF] line-through' : 'text-[#364153]'}`}
      >
        {item.text}
      </span>
      {showMyChoice ? (
        <span className="shrink-0 rounded-full bg-[rgba(116,153,186,0.15)] px-2 py-0.5 text-[10px] font-medium text-[#7499BA]">
          내 선택
        </span>
      ) : item.tag ? (
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${TAG_STYLES[item.tag]}`}>
          {item.tag}
        </span>
      ) : null}
    </label>
  );
}
