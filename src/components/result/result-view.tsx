'use client';

import { useMemo, useState } from 'react';
import { diagnose } from '@/lib/budget-engine';
import type { ToggleId, ToggleState } from '@/lib/budget-engine';
import type { OnboardingAnswers } from '@/lib/onboarding-v6';
import { ResultFooter } from './footer';
import { Toast } from './ui/toast';
import { TabComprehensive } from './tabs/tab-comprehensive';
import { TabItemized } from './tabs/tab-itemized';
import { TabCare } from './tabs/tab-care';

type TabId = 'comprehensive' | 'itemized' | 'care';

const TAB_LABELS: Record<TabId, string> = {
  comprehensive: '종합 설계서',
  itemized: '항목별 내역',
  care: '추가금 케어',
};

type Props = {
  answers: OnboardingAnswers;
  onReset: () => void;
};

export function ResultView({ answers, onReset }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('comprehensive');
  const [shareOpen, setShareOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // 초기 진단으로 유형별 디폴트 토글 산출
  const initial = useMemo(() => diagnose(answers), [answers]);
  const [toggles, setToggles] = useState<ToggleState>(initial.vars.toggleDefaults);

  // 토글 변경 시 재진단 (instant)
  const result = useMemo(() => diagnose(answers, toggles), [answers, toggles]);

  function setToggle(id: ToggleId, on: boolean) {
    setToggles((prev) => ({ ...prev, [id]: on }));
  }

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2000);
  }

  return (
    <div className="flex w-full flex-1 flex-col">
      {/* Tab Nav (sticky 아래에 header 88px가 있다고 가정) */}
      <div className="sticky top-14 z-20 flex h-10 border-b border-[#E5E5E5] bg-white sm:top-[87px]">
        {(Object.keys(TAB_LABELS) as TabId[]).map((tab) => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-sm transition-colors ${
                active
                  ? 'bg-[#373737] font-bold text-white'
                  : 'font-medium text-[#A1A1A1] hover:text-[#373737]'
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <main className="mx-auto w-full max-w-[576px] flex-1 pb-[100px]">
        {activeTab === 'comprehensive' && <TabComprehensive result={result} />}
        {activeTab === 'itemized' && <TabItemized result={result} />}
        {activeTab === 'care' && (
          <TabCare result={result} toggles={toggles} setToggle={setToggle} />
        )}
      </main>

      {/* Floating reset button (임시, 디자인엔 없음 — 향후 메뉴로 이동) */}
      <button
        type="button"
        onClick={onReset}
        className="fixed bottom-[100px] right-5 z-30 rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#6A7282] shadow-md"
      >
        다시하기
      </button>

      {/* Footer */}
      <ResultFooter result={result} onShareClick={() => setShareOpen(true)} />

      {/* Share modal placeholder (C8) — 클릭 시 토스트만 */}
      {shareOpen && (
        <div
          className="fixed inset-0 z-40 flex items-end bg-black/40"
          onClick={() => setShareOpen(false)}
        >
          <div
            className="w-full rounded-t-3xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="pb-4 text-lg font-semibold text-[#171717]">
              결과를 어떻게 가져갈까요?
            </p>
            <p className="pb-6 text-sm text-[#737373]">
              아래에서 원하는 방식을 골라주세요 (디자인 정돈은 C8에서)
            </p>
            <div className="flex flex-col gap-3">
              {[
                'PDF로 내려받기',
                '카카오톡으로 공유하기',
                '이미지로 내려받기',
                '전문가 상담 신청하기',
              ].map((act) => (
                <button
                  key={act}
                  type="button"
                  onClick={() => {
                    setShareOpen(false);
                    showToast('곧 만나요!');
                  }}
                  className="flex items-center justify-between rounded-xl bg-[#F3F4F6] px-4 py-3 text-sm font-medium text-[#171717]"
                >
                  {act}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShareOpen(false)}
              className="mt-4 w-full rounded-xl bg-[#F5F5F5] py-3 text-sm font-medium text-[#666666]"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
}
