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
import { FileText, Share2, Image as ImageIcon, Headset } from 'lucide-react';
import { buildShareText, buildShareClipboard } from '@/lib/share';

type TabId = 'comprehensive' | 'itemized' | 'care';

const TAB_LABELS: Record<TabId, string> = {
  comprehensive: '종합 설계서',
  itemized: '항목별 내역',
  care: '추가금 케어',
};

const SHARE_ACTIONS = [
  { icon: FileText, label: 'PDF로 내려받기', action: 'pdf' },
  { icon: Share2, label: '링크 공유하기', action: 'link' },
  { icon: ImageIcon, label: '이미지로 내려받기', action: 'image' },
  { icon: Headset, label: '전문가 상담 신청하기', action: 'expert' },
] as const;

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

  function setAllToggles(on: boolean) {
    setToggles((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next) as ToggleId[]) next[key] = on;
      return next;
    });
  }

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2000);
  }

  // 링크 공유 — OS 공유 시트(navigator.share), 미지원 시 클립보드 복사
  async function shareLink() {
    const siteUrl = `${window.location.origin}/`;
    const totalWon = result.budget.total * 10000;
    const payload = buildShareText({ totalWon, siteUrl });
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(payload);
      } catch {
        /* 사용자 취소 등 무시 */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(buildShareClipboard({ totalWon, siteUrl }));
      showToast('링크를 복사했어요');
    } catch {
      showToast('공유를 지원하지 않는 환경이에요');
    }
  }

  // 결과 카드 이미지 다운로드 — 서버 next/og 라우트(hex, oklch 안전)에서 생성
  async function downloadImage() {
    const cats = Object.entries(result.budget.categories)
      .map(([c, a]) => `${c}:${a}`)
      .join(',');
    const params = new URLSearchParams({
      persona: result.vars.persona,
      total: String(result.budget.total),
      cats,
    });
    try {
      const res = await fetch(`/api/share-card?${params.toString()}`);
      if (!res.ok) throw new Error('failed');
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl;
      a.download = '버짓로드-결혼예산.png';
      a.click();
      URL.revokeObjectURL(objUrl);
    } catch {
      showToast('이미지 저장에 실패했어요');
    }
  }

  function handleShareAction(action: string) {
    setShareOpen(false);
    if (action === 'link') {
      void shareLink();
      return;
    }
    if (action === 'image') {
      void downloadImage();
      return;
    }
    showToast('곧 만나요!'); // pdf · expert 후속 구현
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
        {activeTab === 'itemized' && <TabItemized result={result} toggles={toggles} />}
        {activeTab === 'care' && (
          <TabCare
            result={result}
            toggles={toggles}
            setToggle={setToggle}
            setAllToggles={setAllToggles}
          />
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
              아래에서 원하는 방식을 골라주세요
            </p>
            <div className="flex flex-col gap-2.5">
              {SHARE_ACTIONS.map(({ icon: Icon, label, action }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleShareAction(action)}
                  className="flex items-center gap-3 rounded-xl border border-[rgba(170,199,225,0.4)] bg-white px-4 py-3 text-left transition-colors hover:border-[#AAC7E1] hover:bg-[rgba(170,199,225,0.08)] active:scale-[0.99]"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{ background: 'rgba(170,199,225,0.3)' }}
                  >
                    <Icon size={18} color="#7499BA" strokeWidth={2} aria-hidden />
                  </span>
                  <span className="text-sm font-semibold text-[#171717]">{label}</span>
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
