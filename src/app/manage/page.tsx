'use client';

import { useState } from 'react';
import { ManageTabBar, type ManageTab } from '@/components/manage/ManageTabBar';
import { ManageBottomBar } from '@/components/manage/ManageBottomBar';
import { ChecklistTab } from '@/components/manage/checklist/ChecklistTab';
import { BudgetTab } from '@/components/manage/budget/BudgetTab';
import { useBudgetTrackingState } from '@/hooks/useBudgetTrackingState';

export default function ManagePage() {
  const [activeTab, setActiveTab] = useState<ManageTab>('checklist');
  const { items, actual, setActualAmount, totalEstimated, totalActual } = useBudgetTrackingState();

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      <ManageTabBar active={activeTab} onChange={setActiveTab} />

      <main className="mx-auto w-full max-w-[576px] flex-1 pb-[100px]">
        {activeTab === 'checklist' && <ChecklistTab />}
        {activeTab === 'budget' && (
          <BudgetTab items={items} actual={actual} setActualAmount={setActualAmount} totalEstimated={totalEstimated} totalActual={totalActual} />
        )}
      </main>

      <button
        type="button"
        onClick={() => window.history.back()}
        className="fixed bottom-[100px] right-5 z-30 rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#6A7282] shadow-md"
      >
        ← 결과로
      </button>

      <ManageBottomBar
        totalEstimated={totalEstimated}
        totalActual={totalActual}
        onShareClick={() => {}}
      />
    </div>
  );
}
