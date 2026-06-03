'use client';

export type ManageTab = 'checklist' | 'budget';

type Props = {
  active: ManageTab;
  onChange: (tab: ManageTab) => void;
};

const TABS: { id: ManageTab; label: string }[] = [
  { id: 'checklist', label: '체크리스트' },
  { id: 'budget', label: '예산안' },
];

export function ManageTabBar({ active, onChange }: Props) {
  return (
    <div className="sticky top-14 z-20 w-full border-b border-[#E5E5E5] bg-white">
      <div className="mx-auto flex h-10 w-full max-w-[576px]">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`flex-1 text-sm font-bold transition-colors ${
              active === id
                ? 'bg-[#373737] text-white'
                : 'font-medium text-[#A1A1A1] hover:text-[#373737]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
