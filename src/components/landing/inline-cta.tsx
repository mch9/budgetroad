'use client';

import Link from 'next/link';
import { trackEvent } from '@/lib/gtag';

/* Static (non-fixed) CTA for repeated in-page use. Same label/style as the hero CTA. */
export function InlineCta({ label = '예산 추정 시작하기' }: { label?: string }) {
  return (
    <Link
      href="/budget-draft"
      onClick={() => {
        try {
          sessionStorage.removeItem('budgetroad_result');
        } catch {
          /* ignore */
        }
        trackEvent('cta_clicked');
      }}
      className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#373737] px-10 text-base font-medium text-white transition-all hover:bg-[#2a2a2a] active:scale-[0.98] sm:text-lg"
    >
      <span>+</span>
      <span>{label}</span>
    </Link>
  );
}
