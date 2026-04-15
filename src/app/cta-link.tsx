'use client';

import Link from 'next/link';
import { trackEvent } from '@/lib/gtag';

export function CtaLink() {
  return (
    <Link
      href="/budget-draft"
      onClick={() => trackEvent('cta_clicked')}
      className="inline-flex h-14 items-center gap-2 rounded-full bg-[#373737] px-10 text-base font-medium text-white transition-all hover:bg-[#2a2a2a] active:scale-[0.98] sm:text-lg"
    >
      <span>+</span>
      <span>예산 추정 시작하기</span>
    </Link>
  );
}
