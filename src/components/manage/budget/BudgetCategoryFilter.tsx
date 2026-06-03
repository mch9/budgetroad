'use client';

export type FilterCategory = 'all' | 'venue' | 'studio' | 'dress' | 'makeup' | 'other';

type Props = {
  active: FilterCategory;
  onChange: (cat: FilterCategory) => void;
};

const FILTERS: { id: FilterCategory; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'venue', label: '예식장' },
  { id: 'studio', label: '스튜디오' },
  { id: 'dress', label: '드레스' },
  { id: 'makeup', label: '메이크업' },
  { id: 'other', label: '기타' },
];

export function BudgetCategoryFilter({ active, onChange }: Props) {
  return (
    <div className="flex gap-4 overflow-x-auto border-b border-[#E5E7EB] px-5">
      {FILTERS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`relative shrink-0 pb-1.5 text-sm transition-colors ${
            active === id
              ? 'font-semibold text-[#373737]'
              : 'font-medium text-[#6A7282] hover:text-[#373737]'
          }`}
        >
          {label}
          {active === id && (
            <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-[#373737]" />
          )}
        </button>
      ))}
    </div>
  );
}
