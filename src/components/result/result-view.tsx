'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
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
import { encodeShare } from '@/lib/share-state';
import { captureNode, downloadCanvas } from '@/lib/export-result';

type TabId = 'comprehensive' | 'itemized' | 'care';

const TAB_LABELS: Record<TabId, string> = {
  comprehensive: '종합 설계서',
  itemized: '항목별 내역',
  care: '추가금 케어',
};

const SHARE_ACTIONS = [
  { icon: FileText, label: 'PDF로 내려받기', action: 'pdf' },
  { icon: ImageIcon, label: '이미지로 저장하기', action: 'image' },
  { icon: Share2, label: '링크 공유하기', action: 'link' },
  { icon: Headset, label: '전문가 상담 신청하기', action: 'expert' },
] as const;

type Props = {
  answers: OnboardingAnswers;
  onReset: () => void;
  initialToggles?: ToggleState; // 공유 링크로 들어왔을 때 공유자의 토글 상태 복원
};

export function ResultView({ answers, onReset, initialToggles }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('comprehensive');
  const [shareOpen, setShareOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  // 이미지 저장은 모바일 레이아웃(<640px, sm: 미적용)에서만 깔끔하게 캡처됨.
  // 데스크톱은 화면이 sm: 가로 레이아웃이라 캡처가 깨지므로 옵션 자체를 숨김(PDF로 커버).
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    // createPortal(document.body)은 클라이언트에서만 — 마운트 후 렌더 가드
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // 초기 진단으로 유형별 디폴트 토글 산출 (공유 링크면 공유자 토글 우선)
  const initial = useMemo(() => diagnose(answers), [answers]);
  const [toggles, setToggles] = useState<ToggleState>(
    initialToggles ?? initial.vars.toggleDefaults,
  );

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
    // 진입 화면이 아니라 '이 결과'로 바로 도달하는 링크 — 답변+토글을 URL에 인코딩
    const code = encodeShare(answers, toggles);
    const siteUrl = `${window.location.origin}/budget-draft?r=${code}`;
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

  function handleShareAction(action: string) {
    setShareOpen(false);
    if (action === 'link') {
      void shareLink();
      return;
    }
    if (action === 'pdf') {
      // 브라우저 native 인쇄 → "PDF로 저장" (화면 그대로, gap·테두리·oklch 완벽)
      window.print();
      return;
    }
    if (action === 'image') {
      void runFullCapture();
      return;
    }
    showToast('곧 만나요!'); // expert 후속
  }

  // 전체 화면 저장 — 결과 3탭(#print-root: 펼침·만족도 제외)을 한 장의 긴 PNG로 캡처.
  // 네이버 "전체화면 캡처"처럼 결과 전체를 이미지 한 장으로. scale은 모바일 canvas 한계
  // (≈16.7M px²·16384px) 안에 들도록 높이 기준 동적 산정.
  async function runFullCapture() {
    const root = document.getElementById('print-root');
    if (!root) {
      showToast('저장에 실패했어요');
      return;
    }
    showToast('이미지 저장 준비 중…');
    const prevStyle = root.getAttribute('style') ?? '';
    // 폭 632 = 콘텐츠 576 + 좌우 28px 여백(안쪽 max-w-576이 mx-auto로 중앙 정렬).
    const exportW = 632;
    root.setAttribute(
      'style',
      `position:fixed;left:-99999px;top:0;display:block;width:${exportW}px;background:#F9FAFB`,
    );
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      await Promise.all(
        (Array.from(root.querySelectorAll('img')) as HTMLImageElement[]).map((img) =>
          img.decode().catch(() => {}),
        ),
      );
      await new Promise((r) => window.setTimeout(r, 200));
      // 모바일 canvas 한계(면적 ≈16.7M px²·치수 16384px) 안에 들도록 scale 동적 산정
      const h = Math.max(root.scrollHeight, 1);
      const scale = Math.min(2, Math.sqrt(16_000_000 / (exportW * h)), 16000 / h);
      const canvas = await captureNode(root, scale, exportW);
      downloadCanvas(canvas, '버짓로드-결과.png');
      showToast('저장됐어요');
    } catch {
      showToast('저장에 실패했어요');
    } finally {
      root.setAttribute('style', prevStyle);
    }
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
              {SHARE_ACTIONS.filter((a) => a.action !== 'image' || isMobile).map(({ icon: Icon, label, action }) => (
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

      {/* PDF 인쇄용 — body에 포털로 붙고, @media print에서 이것만 노출. 화면엔 hidden.
          탭 컴포넌트 그대로라 native 인쇄가 화면과 동일하게 렌더(gap·테두리·oklch 완벽). */}
      {mounted &&
        createPortal(
          <div id="print-root" className="hidden bg-white">
            <div className="mx-auto max-w-[576px]" style={{ breakAfter: 'page' }}>
              <TabComprehensive result={result} forExport />
            </div>
            <div className="mx-auto max-w-[576px]" style={{ breakAfter: 'page' }}>
              <TabItemized result={result} toggles={toggles} forceExpand />
            </div>
            <div className="mx-auto max-w-[576px]">
              <TabCare
                result={result}
                toggles={toggles}
                setToggle={() => {}}
                setAllToggles={() => {}}
              />
            </div>
          </div>,
          document.body,
        )}

      {toast && <Toast message={toast} />}
    </div>
  );
}
