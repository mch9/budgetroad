'use client';

import type { ResultPayload, ToggleId, ToggleState } from '@/lib/budget-engine';
import { TOGGLES_META } from '@/lib/budget-engine';

type Props = {
  result: ResultPayload;
  toggles: ToggleState;
  setToggle: (id: ToggleId, on: boolean) => void;
};

export function TabCare({ toggles, setToggle }: Props) {
  return (
    <div className="flex flex-col gap-5 px-5 pb-6 pt-6">
      <p className="text-center text-sm text-[#6A7282]">
        탭 3 — 추가금 케어 (4 그룹 UI는 C7에서 정돈됩니다)
      </p>
      <div className="flex flex-col gap-2">
        {TOGGLES_META.map((t) => {
          const on = toggles[t.id];
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setToggle(t.id, !on)}
              className={`flex items-center justify-between rounded-2xl border-2 px-4 py-3 text-left transition-all ${
                on ? 'border-[#AAC7E1] bg-[rgba(170,199,225,0.15)]' : 'border-[#E5E5E5] bg-white'
              }`}
            >
              <div className="flex min-w-0 flex-col">
                <span className="text-sm font-semibold text-[#171717]">{t.label}</span>
                <span className="text-xs text-[#737373]">
                  {t.group} · {t.desc}
                </span>
              </div>
              <div
                className={`h-6 w-10 shrink-0 rounded-full transition-colors ${
                  on ? 'bg-[#AAC7E1]' : 'bg-[#E5E5E5]'
                }`}
              >
                <div
                  className={`h-5 w-5 translate-y-0.5 rounded-full bg-white transition-transform ${
                    on ? 'translate-x-[18px]' : 'translate-x-[2px]'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
