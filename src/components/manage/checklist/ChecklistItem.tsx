'use client';

import type { ChecklistTag } from '@/lib/checklist-data';

type Props = {
  item: { id: string; text: string; tag?: ChecklistTag };
  checked: boolean;
  onToggle: (id: string) => void;
  highlight?: boolean;
  dynamic?: boolean;
  onDelete?: () => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
};

const TAG_STYLES: Record<string, string> = {
  중요: 'bg-[rgba(170,199,225,0.3)] text-[#364153]',
  계약: 'bg-[rgba(170,199,225,0.3)] text-[#364153]',
};

const CHECK_SVG = (
  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden>
    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function ChecklistItem({ item, checked, onToggle, highlight, dynamic, onDelete, selectable, selected, onSelect }: Props) {
  if (selectable) {
    return (
      <label className="flex cursor-pointer items-center gap-2.5 py-1.5">
        <input type="checkbox" checked={!!selected} onChange={() => onSelect?.()} className="sr-only" />
        <span
          className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-colors ${
            selected ? 'border-[#AAC7E1] bg-[#AAC7E1]' : 'border-[#D1D5DC] bg-white'
          }`}
        >
          {selected && CHECK_SVG}
        </span>
        <span className="flex-1 text-sm text-[#364153]">{item.text}</span>
      </label>
    );
  }

  const showMyChoice = highlight || dynamic;

  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1.5">
      <input type="checkbox" checked={checked} onChange={() => onToggle(item.id)} className="sr-only" />
      <span
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
          checked ? 'border-[#AAC7E1] bg-[#AAC7E1]' : 'border-[#D1D5DC] bg-white'
        }`}
      >
        {checked && CHECK_SVG}
      </span>
      <span className={`flex-1 text-sm ${checked ? 'text-[#99A1AF] line-through' : 'text-[#364153]'}`}>
        {item.text}
      </span>
      {onDelete ? (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); onDelete(); }}
          className="shrink-0 rounded p-0.5 text-[#C4C9D4] transition-colors hover:text-red-400"
          aria-label="항목 삭제"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      ) : showMyChoice ? (
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
