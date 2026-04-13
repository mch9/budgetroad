'use client';

import Link from 'next/link';
import { trackEvent } from '@/lib/gtag';

export function CtaLink() {
  return (
    <Link
      href="/budget-draft"
      onClick={() => trackEvent('cta_clicked')}
      className="mt-10 inline-flex h-14 items-center rounded-xl bg-primary px-10 text-lg font-semibold text-primary-foreground shadow-[0_4px_12px_rgba(255,132,0,0.2)] transition-all hover:brightness-110 active:scale-[0.98]"
    >
      내 결혼 예산 만들기
    </Link>
  );
}
