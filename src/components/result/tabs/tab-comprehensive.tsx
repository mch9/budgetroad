'use client';

import type { ResultPayload } from '@/lib/budget-engine';

type Props = { result: ResultPayload };

export function TabComprehensive({ result }: Props) {
  return (
    <div className="flex flex-col gap-5 px-5 pb-6 pt-6">
      <p className="text-center text-sm text-[#6A7282]">
        탭 1 — 종합 설계서 (자세한 카드는 C5에서 추가됩니다)
      </p>
      <pre className="mx-auto max-w-full overflow-x-auto rounded-lg bg-white p-4 text-xs text-[#525252]">
        {`유형: ${result.vars.persona}\n총 예산: ${result.budget.total.toLocaleString()}만원\n추가금 델타: +${result.budget.toggleDelta.toLocaleString()}만원\n진단: ${result.consistency.status} — ${result.consistency.headline}`}
      </pre>
    </div>
  );
}
