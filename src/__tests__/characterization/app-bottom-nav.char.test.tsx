// @vitest-environment happy-dom

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import type { ReactNode } from 'react';

vi.mock('@/lib/gtag', () => ({ trackEvent: vi.fn() }));
// next/link → 평범한 <a>로 대체(라우터 컨텍스트 없이 onClick만 검증)
vi.mock('next/link', () => ({
  default: ({ children, href, onClick }: { children: ReactNode; href: string; onClick?: () => void }) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}));

import { trackEvent } from '@/lib/gtag';
import { AppBottomNav } from '@/components/common/app-bottom-nav';

const mockTrackEvent = vi.mocked(trackEvent);
const navCall = () => mockTrackEvent.mock.calls.find((c) => c[0] === 'nav_tab_clicked');

describe('AppBottomNav — nav_tab_clicked 트래킹', () => {
  beforeEach(() => {
    cleanup();
    mockTrackEvent.mockClear();
  });

  it('결과 화면: Home 탭 → nav_tab_clicked {from:result, to:home}', () => {
    const { getByText } = render(<AppBottomNav active="result" onPlannerClick={vi.fn()} />);
    fireEvent.click(getByText('Home'));
    expect(navCall()).toBeDefined();
    expect(navCall()![1]).toMatchObject({ from: 'result', to: 'home' });
  });

  it('결과 화면: Planner 탭 → nav_tab_clicked {to:planner} + onPlannerClick 호출(기존 전환 로직 보존)', () => {
    const onPlanner = vi.fn();
    const { getByText } = render(<AppBottomNav active="result" onPlannerClick={onPlanner} />);
    fireEvent.click(getByText('Planner'));
    expect(navCall()![1]).toMatchObject({ from: 'result', to: 'planner' });
    expect(onPlanner).toHaveBeenCalledTimes(1);
  });

  it('결과 화면: 활성 탭(Result) 클릭은 무동작(이벤트 미발화)', () => {
    const { getByText } = render(<AppBottomNav active="result" onPlannerClick={vi.fn()} />);
    fireEvent.click(getByText('Result'));
    expect(navCall()).toBeUndefined();
  });

  it('플래너 화면: Result 탭 → nav_tab_clicked {from:planner, to:result}', () => {
    const { getByText } = render(<AppBottomNav active="planner" />);
    fireEvent.click(getByText('Result'));
    expect(navCall()![1]).toMatchObject({ from: 'planner', to: 'result' });
  });

  it('플래너 빈 상태(resultEnabled=false): Result 탭 비활성 → 클릭해도 미발화', () => {
    const { getByText } = render(<AppBottomNav active="planner" resultEnabled={false} />);
    fireEvent.click(getByText('Result'));
    expect(navCall()).toBeUndefined();
  });
});
