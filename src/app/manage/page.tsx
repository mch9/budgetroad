'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Share2 } from 'lucide-react';
import { ManageTabBar, type ManageTab } from '@/components/manage/ManageTabBar';
import { ManageBottomBar } from '@/components/manage/ManageBottomBar';
import { ChecklistTab } from '@/components/manage/checklist/ChecklistTab';
import { BudgetTab } from '@/components/manage/budget/BudgetTab';
import { useBudgetTrackingState } from '@/hooks/useBudgetTrackingState';
import { encodeShare } from '@/lib/share-state';
import { buildShareText, buildShareClipboard } from '@/lib/share';

export default function ManagePage() {
  const [activeTab, setActiveTab] = useState<ManageTab>('checklist');
  const [shareOpen, setShareOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const { items, actual, setActualAmount, addCustomItem, removeItem, totalEstimated, totalActual, answers, toggles, hasSession } =
    useBudgetTrackingState();

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2000);
  }

  async function handleShare() {
    if (!answers || !toggles) return;
    const code = encodeShare(answers, toggles);
    const siteUrl = `${window.location.origin}/budget-draft?r=${code}`;
    const totalWon = totalEstimated * 10000;
    const payload = buildShareText({ totalWon, siteUrl });
    if (navigator.share) {
      try { await navigator.share(payload); } catch { /* 취소 */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(buildShareClipboard({ totalWon, siteUrl }));
      showToast('링크를 복사했어요');
    } catch {
      showToast('복사에 실패했어요');
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-center border-b border-[#E5E7EB] bg-[#F9FAFB]/90 backdrop-blur-sm">
        <img src="/brand/logo-ko-nav.png" alt="버짓로드" className="h-6 w-auto" />
      </header>

      <ManageTabBar active={activeTab} onChange={setActiveTab} />

      {/* 빈 세션 진입 처리 */}
      {!hasSession ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-lg font-semibold text-[#1E2939]">아직 예산 결과가 없어요</p>
          <p className="text-sm text-[#6A7282]">
            결과 페이지에서 예산을 확인한 뒤<br />「준비 시작」을 눌러주세요
          </p>
          <Link
            href="/budget-draft"
            className="mt-2 rounded-2xl bg-[#373737] px-6 py-3 text-sm font-semibold text-white"
          >
            예산 결과 보러 가기
          </Link>
        </div>
      ) : (
        <main className="mx-auto w-full max-w-[576px] flex-1 pb-[100px]">
          {activeTab === 'checklist' && <ChecklistTab />}
          {activeTab === 'budget' && (
            <BudgetTab
              items={items}
              actual={actual}
              setActualAmount={setActualAmount}
              addCustomItem={addCustomItem}
              removeItem={removeItem}
              totalEstimated={totalEstimated}
              totalActual={totalActual}
            />
          )}
        </main>
      )}

      <ManageBottomBar
        totalEstimated={totalEstimated}
        totalActual={totalActual}
      />

      {/* 공유 모달 */}
      {shareOpen && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/40"
          onClick={() => setShareOpen(false)}
        >
          <div
            className="w-full max-w-[576px] rounded-t-3xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="pb-4 text-lg font-semibold text-[#171717]">결과를 어떻게 가져갈까요?</p>
            <button
              type="button"
              onClick={() => { setShareOpen(false); void handleShare(); }}
              className="flex w-full items-center gap-3 rounded-xl border border-[rgba(170,199,225,0.4)] bg-white px-4 py-3 text-left transition-colors hover:border-[#AAC7E1] hover:bg-[rgba(170,199,225,0.08)]"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{ background: 'rgba(170,199,225,0.3)' }}
              >
                <Share2 size={18} color="#7499BA" strokeWidth={2} />
              </span>
              <span className="text-sm font-semibold text-[#171717]">결과 공유하기</span>
            </button>
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

      {/* 토스트 */}
      {toast && (
        <div className="fixed bottom-28 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#1E2939]/90 px-5 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
