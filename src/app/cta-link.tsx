'use client';

import Link from 'next/link';
import { trackEvent } from '@/lib/gtag';

export function CtaLink() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center border-t border-[#E5E7EB] bg-[#F9FAFB]/90 px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-md sm:static sm:inset-x-auto sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
      <Link
        href="/budget-draft"
        onClick={() => {
          try { sessionStorage.removeItem('budgetroad_result'); } catch { /* ignore */ }
          trackEvent('cta_clicked');
        }}
        className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#373737] px-10 text-base font-medium text-white transition-all hover:bg-[#2a2a2a] active:scale-[0.98] sm:w-auto sm:text-lg"
      >
        <span>+</span>
        <span>예산 추정 시작하기</span>
      </Link>
    </div>
  );
}
