'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/gtag';
import { STORAGE_KEYS } from '@/lib/storage-keys';


function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CtaLink() {
  function handleClick() {
    // 시작하기 = 항상 질문부터: 저장된 온보딩 진행상태만 비워 새로 시작
    // (저장된 플랜 MANAGE_SESSION은 보존 → '이어보기'로 접근)
    try {
      sessionStorage.removeItem(STORAGE_KEYS.ONBOARDING_V6);
      sessionStorage.removeItem(STORAGE_KEYS.LEGACY_RESULT);
    } catch { /* ignore */ }
    trackEvent('cta_clicked');
  }

  return (
    <>
      {/* Hero inline button */}
      <Link
        href="/budget-draft"
        onClick={handleClick}
        className="flex h-16 items-center gap-3 rounded-full bg-white px-6 shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.1),0px_10px_15px_-3px_rgba(0,0,0,0.1)] transition-all hover:shadow-[0px_6px_10px_-4px_rgba(0,0,0,0.15),0px_14px_20px_-3px_rgba(0,0,0,0.12)] active:scale-[0.98]"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-[#aac7e1]">
          <ArrowIcon />
        </span>
        <span className="text-base font-semibold text-[#373737]">우리 결혼 준비 설계 시작하기</span>
      </Link>

      {/* Mobile fixed-bottom button */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center border-t border-[#E5E7EB] bg-[#F9FAFB]/90 px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-md sm:hidden">
        <Link
          href="/budget-draft"
          onClick={handleClick}
          className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#373737] px-10 text-base font-medium text-white transition-all hover:bg-[#2a2a2a] active:scale-[0.98]"
        >
          <span>예산 추정 시작하기</span>
        </Link>
      </div>
    </>
  );
}

export function ManageLink() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShow(!!localStorage.getItem(STORAGE_KEYS.MANAGE_SESSION));
    } catch { /* ignore */ }
  }, []);

  if (!show) return null;

  return (
    <Link
      href="/manage"
      onClick={() => trackEvent('continue_clicked')}
      className="text-sm text-[#7499BA] underline underline-offset-2 transition-opacity hover:opacity-70"
    >
      이전 준비 내역 이어보기
    </Link>
  );
}
