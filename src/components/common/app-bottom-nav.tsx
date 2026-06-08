'use client';

import Link from 'next/link';
import { Home, BarChart3, ClipboardCheck, type LucideIcon } from 'lucide-react';
import { trackEvent } from '@/lib/gtag';

type NavKey = 'home' | 'result' | 'planner';

type Props = {
  active: 'result' | 'planner';
  /** 결과 화면 → Planner 탭: 기존 '준비 시작'이 하던 saveSession + manage_cta_clicked + 이동을 그대로 수행 */
  onPlannerClick?: () => void;
  /** 플래너 빈 상태(결과 없음)에선 Result 탭 비활성 */
  resultEnabled?: boolean;
};

const TABS: { key: NavKey; label: string; href: string; Icon: LucideIcon }[] = [
  { key: 'home', label: 'Home', href: '/', Icon: Home },
  { key: 'result', label: 'Result', href: '/budget-draft?view=result', Icon: BarChart3 },
  { key: 'planner', label: 'Planner', href: '/manage', Icon: ClipboardCheck },
];

export function AppBottomNav({ active, onPlannerClick, resultEnabled = true }: Props) {
  function fire(to: NavKey) {
    trackEvent('nav_tab_clicked', { from: active, to });
  }

  return (
    <nav
      aria-label="주요 메뉴"
      className="border-t border-[#E5E7EB] bg-white pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto flex max-w-[576px]">
        {TABS.map(({ key, label, href, Icon }) => {
          const isActive = key === active;
          const disabled = key === 'result' && !resultEnabled && !isActive;
          const color = isActive
            ? 'text-[#7499BA]'
            : disabled
              ? 'text-[#D1D5DB]'
              : 'text-[#A1A1A1]';
          const cls = `flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors ${color}`;
          const content = (
            <>
              <Icon size={22} strokeWidth={2} aria-hidden />
              <span className="text-[11px] font-medium">{label}</span>
            </>
          );

          // 현재 화면 탭·비활성 탭 → 이동 없음
          if (isActive || disabled) {
            return (
              <div key={key} aria-current={isActive ? 'page' : undefined} className={cls}>
                {content}
              </div>
            );
          }

          // Planner 탭(결과 화면에서): 기존 전환 로직 주입
          if (key === 'planner' && onPlannerClick) {
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  fire('planner');
                  onPlannerClick();
                }}
                className={cls}
              >
                {content}
              </button>
            );
          }

          // Home / Result(플래너 화면에서) / Planner(콜백 없을 때) → 라우트 이동
          return (
            <Link key={key} href={href} onClick={() => fire(key)} className={cls}>
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
