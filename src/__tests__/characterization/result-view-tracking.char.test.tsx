// @vitest-environment happy-dom

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, act, fireEvent, cleanup, within } from '@testing-library/react';
import type { OnboardingAnswers } from '@/lib/onboarding-v6';

// ── mocks (hoisted) ──────────────────────────────────────────────────────────
vi.mock('@/lib/gtag', () => ({ trackEvent: vi.fn() }));
vi.mock('@/lib/share-state', () => ({ encodeShare: vi.fn(() => 'test-code') }));
vi.mock('@/lib/export-result', () => ({
  captureNode: vi.fn().mockResolvedValue({ toDataURL: vi.fn() }),
  downloadCanvas: vi.fn(),
}));
vi.mock('@/lib/share', () => ({
  buildShareText: vi.fn(() => ({})),
  buildShareClipboard: vi.fn(() => ''),
}));
vi.mock('@/hooks/useBudgetTrackingState', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/hooks/useBudgetTrackingState')>();
  return { ...mod, saveSession: vi.fn() };
});
vi.mock('@/components/result/tabs/tab-comprehensive', () => ({
  TabComprehensive: () => <div data-testid="tab-comprehensive" />,
}));
vi.mock('@/components/result/tabs/tab-itemized', () => ({
  TabItemized: () => <div data-testid="tab-itemized" />,
}));
// TabCare: 테스트용 버튼 노출 (setToggle / setAllToggles 트래킹 검증)
vi.mock('@/components/result/tabs/tab-care', () => ({
  TabCare: ({
    setToggle,
    setAllToggles,
  }: {
    setToggle: (id: string, on: boolean) => void;
    setAllToggles: (on: boolean) => void;
  }) => (
    <div data-testid="tab-care">
      <button data-testid="toggle-on" onClick={() => setToggle('원본 구매', true)}>
        toggle on
      </button>
      <button data-testid="toggle-off" onClick={() => setToggle('원본 구매', false)}>
        toggle off
      </button>
      <button data-testid="all-on" onClick={() => setAllToggles(true)}>
        all on
      </button>
      <button data-testid="all-off" onClick={() => setAllToggles(false)}>
        all off
      </button>
    </div>
  ),
}));
vi.mock('@/components/result/footer', () => ({
  ResultFooter: ({ onShareClick }: { onShareClick: () => void }) => (
    <button data-testid="share-btn" onClick={onShareClick}>
      share
    </button>
  ),
}));
// '준비 시작'(onManageClick) → 하단 탭바 Planner 탭으로 이동. onPlannerClick으로 동일 로직 주입.
vi.mock('@/components/common/app-bottom-nav', () => ({
  AppBottomNav: ({ onPlannerClick }: { onPlannerClick?: () => void }) => (
    <button data-testid="planner-tab" onClick={() => onPlannerClick?.()}>
      planner
    </button>
  ),
}));
vi.mock('@/components/result/satisfaction-modal', () => ({
  SatisfactionModal: ({ onDone }: { onDone: () => void }) => (
    <button data-testid="survey-done" onClick={onDone}>
      done
    </button>
  ),
}));
vi.mock('@/components/result/ui/toast', () => ({
  Toast: () => null,
}));

// ── imports (after mocks) ────────────────────────────────────────────────────
import { trackEvent } from '@/lib/gtag';
import { ResultView } from '@/components/result/result-view';
import { STORAGE_KEYS } from '@/lib/storage-keys';

const mockTrackEvent = trackEvent as ReturnType<typeof vi.fn>;

// ── helpers ──────────────────────────────────────────────────────────────────

function makeAnswers(): OnboardingAnswers {
  return {
    Q1: 'A', Q2: 'A', Q3: 'A', Q4: 'A', Q7: 'A', Q8: 'A',
    T2: 'A', T5: 'A', T7: 'A',
    M1: 'C', M2: 'C', M3: 'B', M4: 'A', M5: 'A',
  };
}

function setupScrollable(scrollHeight = 2000, innerHeight = 500, scrollY = 0) {
  Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: scrollHeight });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: innerHeight });
  Object.defineProperty(window, 'scrollY', { configurable: true, value: scrollY });
}

// ── setup ────────────────────────────────────────────────────────────────────

afterEach(() => { cleanup(); });

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  });
  window.scrollTo = vi.fn() as typeof window.scrollTo;
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
  setupScrollable();
});

// ── 1. 마운트 이벤트 ───────────────────────────────────────────────────────────

describe('마운트 — result_tab_viewed', () => {
  it('마운트 시 comprehensive 탭 최초 진입 이벤트 발화', async () => {
    await act(async () => {
      render(<ResultView answers={makeAnswers()} onReset={vi.fn()} />);
    });

    const calls = mockTrackEvent.mock.calls.filter(
      (c) => c[0] === 'result_tab_viewed' && c[1]?.tab === 'comprehensive',
    );
    expect(calls.length).toBeGreaterThanOrEqual(1);
    expect(calls[0][1]).toMatchObject({ tab: 'comprehensive', is_first_view: 1 });
    expect(typeof calls[0][1].persona).toBe('string');
  });

  it('persona 값이 일관적으로 동일한 입력 → 동일 persona', async () => {
    await act(async () => {
      render(<ResultView answers={makeAnswers()} onReset={vi.fn()} />);
    });
    const call = mockTrackEvent.mock.calls.find(
      (c) => c[0] === 'result_tab_viewed',
    );
    expect(call![1].persona).toMatchSnapshot();
  });
});

// ── 2. 탭 전환 이벤트 ─────────────────────────────────────────────────────────

describe('탭 전환 — result_tab_viewed', () => {
  it('처음 이동한 탭 → is_first_view=1', async () => {
    const { getByText } = await act(async () =>
      render(<ResultView answers={makeAnswers()} onReset={vi.fn()} />),
    );
    mockTrackEvent.mockClear();

    await act(async () => { fireEvent.click(getByText('항목별 내역')); });

    const call = mockTrackEvent.mock.calls.find((c) => c[0] === 'result_tab_viewed');
    expect(call![1]).toMatchObject({ tab: 'itemized', is_first_view: 1 });
  });

  it('같은 탭에 다시 이동하면 이벤트 없음 (이미 active)', async () => {
    const { getByText } = await act(async () =>
      render(<ResultView answers={makeAnswers()} onReset={vi.fn()} />),
    );
    mockTrackEvent.mockClear();

    // 이미 comprehensive가 active — 다시 클릭해도 selectTab이 early-return
    await act(async () => { fireEvent.click(getByText('종합 설계서')); });

    expect(mockTrackEvent.mock.calls.filter((c) => c[0] === 'result_tab_viewed')).toHaveLength(0);
  });

  it('한 번 방문한 탭 재방문 → is_first_view=0', async () => {
    const { getByText } = await act(async () =>
      render(<ResultView answers={makeAnswers()} onReset={vi.fn()} />),
    );
    // 항목별 내역 → 종합 설계서 → 항목별 내역 재방문
    await act(async () => { fireEvent.click(getByText('항목별 내역')); });
    await act(async () => { fireEvent.click(getByText('종합 설계서')); });
    mockTrackEvent.mockClear();
    await act(async () => { fireEvent.click(getByText('항목별 내역')); });

    const call = mockTrackEvent.mock.calls.find((c) => c[0] === 'result_tab_viewed');
    expect(call![1]).toMatchObject({ tab: 'itemized', is_first_view: 0 });
  });
});

// ── 3. 스크롤 depth 이벤트 ────────────────────────────────────────────────────

describe('스크롤 — result_scroll_depth', () => {
  it('25% 도달 시 depth_pct=25 이벤트 발화', async () => {
    await act(async () => {
      render(<ResultView answers={makeAnswers()} onReset={vi.fn()} />);
    });
    mockTrackEvent.mockClear();

    // scrollable=1500, scrollY=375 → 25%
    setupScrollable(2000, 500, 375);
    await act(async () => { window.dispatchEvent(new Event('scroll')); });

    const call = mockTrackEvent.mock.calls.find((c) => c[0] === 'result_scroll_depth');
    expect(call).toBeDefined();
    expect(call![1]).toMatchObject({ tab: 'comprehensive', depth_pct: 25 });
  });

  it('동일 milestone 두 번 스크롤해도 이벤트는 1회만', async () => {
    await act(async () => {
      render(<ResultView answers={makeAnswers()} onReset={vi.fn()} />);
    });
    setupScrollable(2000, 500, 375);
    await act(async () => { window.dispatchEvent(new Event('scroll')); });
    mockTrackEvent.mockClear();
    // 같은 depth 재스크롤
    await act(async () => { window.dispatchEvent(new Event('scroll')); });

    const calls = mockTrackEvent.mock.calls.filter(
      (c) => c[0] === 'result_scroll_depth' && c[1]?.depth_pct === 25,
    );
    expect(calls).toHaveLength(0); // 이미 fired, 중복 없음
  });

  it('scrollable=0이면 scroll depth 이벤트 발화하지 않음', async () => {
    await act(async () => {
      render(<ResultView answers={makeAnswers()} onReset={vi.fn()} />);
    });
    mockTrackEvent.mockClear();

    setupScrollable(500, 500, 0); // scrollable = 0
    await act(async () => { window.dispatchEvent(new Event('scroll')); });

    expect(mockTrackEvent.mock.calls.some((c) => c[0] === 'result_scroll_depth')).toBe(false);
  });
});

// ── 4. 언마운트(이탈) 이벤트 ─────────────────────────────────────────────────

describe('언마운트 — result_exited', () => {
  it('언마운트 시 result_exited 1회 발화', async () => {
    const { unmount } = await act(async () =>
      render(<ResultView answers={makeAnswers()} onReset={vi.fn()} />),
    );
    mockTrackEvent.mockClear();

    await act(async () => { unmount(); });

    const exitCalls = mockTrackEvent.mock.calls.filter((c) => c[0] === 'result_exited');
    expect(exitCalls).toHaveLength(1);
  });

  it('result_exited payload에 last_tab/dwell 필드 포함', async () => {
    const { unmount } = await act(async () =>
      render(<ResultView answers={makeAnswers()} onReset={vi.fn()} />),
    );
    mockTrackEvent.mockClear();

    await act(async () => { unmount(); });

    const [, args] = mockTrackEvent.mock.calls.find((c) => c[0] === 'result_exited')!;
    expect(args).toMatchObject({ last_tab: 'comprehensive' });
    expect(typeof args.time_on_result_sec).toBe('number');
    expect(typeof args.dwell_comprehensive_sec).toBe('number');
    expect(typeof args.dwell_itemized_sec).toBe('number');
    expect(typeof args.dwell_care_sec).toBe('number');
  });

  it('visibilitychange=hidden 후 언마운트해도 result_exited 중복 발화 없음', async () => {
    const { unmount } = await act(async () =>
      render(<ResultView answers={makeAnswers()} onReset={vi.fn()} />),
    );

    // 탭 숨김 → 첫 번째 이탈
    await act(async () => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    mockTrackEvent.mockClear();

    // 언마운트 → 두 번째 시도 → fireExit 가드에 막혀야 함
    await act(async () => { unmount(); });

    expect(mockTrackEvent.mock.calls.filter((c) => c[0] === 'result_exited')).toHaveLength(0);
  });
});

// ── 5. 토글 이벤트 ───────────────────────────────────────────────────────────

describe('토글 — care_option_toggled / care_bulk_toggled', () => {
  // portal이 document.body에 TabCare 버튼을 추가하므로 container 범위로 좁혀 클릭
  async function renderWithCareTab() {
    const { container, ...rest } = await act(async () =>
      render(<ResultView answers={makeAnswers()} onReset={vi.fn()} />),
    );
    await act(async () => { fireEvent.click(within(container).getByText('추가금 케어')); });
    mockTrackEvent.mockClear();
    return { container, ...rest };
  }

  it('토글 ON → care_option_toggled {on:1}', async () => {
    const { container } = await renderWithCareTab();

    await act(async () => { fireEvent.click(within(container).getByTestId('toggle-on')); });

    const call = mockTrackEvent.mock.calls.find((c) => c[0] === 'care_option_toggled');
    expect(call).toBeDefined();
    expect(call![1]).toMatchObject({ option_id: '원본 구매', on: 1 });
    expect(typeof call![1].persona).toBe('string');
  });

  it('토글 OFF → care_option_toggled {on:0}', async () => {
    const { container } = await renderWithCareTab();

    await act(async () => { fireEvent.click(within(container).getByTestId('toggle-off')); });

    const call = mockTrackEvent.mock.calls.find((c) => c[0] === 'care_option_toggled');
    expect(call![1]).toMatchObject({ option_id: '원본 구매', on: 0 });
  });

  it('전체 ON → care_bulk_toggled {action:"all_on"}', async () => {
    const { container } = await renderWithCareTab();

    await act(async () => { fireEvent.click(within(container).getByTestId('all-on')); });

    const call = mockTrackEvent.mock.calls.find((c) => c[0] === 'care_bulk_toggled');
    expect(call![1]).toMatchObject({ action: 'all_on' });
  });

  it('전체 OFF → care_bulk_toggled {action:"all_off"}', async () => {
    const { container } = await renderWithCareTab();

    await act(async () => { fireEvent.click(within(container).getByTestId('all-off')); });

    const call = mockTrackEvent.mock.calls.find((c) => c[0] === 'care_bulk_toggled');
    expect(call![1]).toMatchObject({ action: 'all_off' });
  });
});

// ── 6. 공유·관리 이벤트 ──────────────────────────────────────────────────────

describe('공유/관리 — share_panel_opened / manage_cta_clicked / share_action_clicked', () => {
  // share_panel_opened는 설문 여부와 무관하게 handleShareClick 진입 즉시 발화
  it('share 버튼 클릭 → share_panel_opened 항상 발화', async () => {
    const { getByTestId } = await act(async () =>
      render(<ResultView answers={makeAnswers()} onReset={vi.fn()} />),
    );
    mockTrackEvent.mockClear();

    await act(async () => { fireEvent.click(getByTestId('share-btn')); });

    const call = mockTrackEvent.mock.calls.find((c) => c[0] === 'share_panel_opened');
    expect(call).toBeDefined();
    expect(typeof call![1].persona).toBe('string');
  });

  it('satisfaction_done 없음 → 설문 모달 표시, share 모달은 닫힘', async () => {
    const { getByTestId, queryByTestId, queryByText } = await act(async () =>
      render(<ResultView answers={makeAnswers()} onReset={vi.fn()} />),
    );

    await act(async () => { fireEvent.click(getByTestId('share-btn')); });

    expect(queryByTestId('survey-done')).toBeTruthy();
    expect(queryByText('결과 공유하기')).toBeNull();
  });

  it('satisfaction_done=1 → 설문 없이 share 모달 직행', async () => {
    sessionStorage.setItem(STORAGE_KEYS.SATISFACTION_DONE, '1');
    const { getByTestId, findByText } = await act(async () =>
      render(<ResultView answers={makeAnswers()} onReset={vi.fn()} />),
    );

    await act(async () => { fireEvent.click(getByTestId('share-btn')); });

    await findByText('결과 공유하기');
  });

  // '준비 시작' 버튼 → 하단 탭바 Planner 탭으로 이동했지만, manage_cta_clicked 발화는 동일하게 유지
  it('Planner 탭 클릭 → manage_cta_clicked', async () => {
    const { getByTestId } = await act(async () =>
      render(<ResultView answers={makeAnswers()} onReset={vi.fn()} />),
    );
    Object.defineProperty(window, 'location', { configurable: true, value: { href: '' } });
    mockTrackEvent.mockClear();

    await act(async () => { fireEvent.click(getByTestId('planner-tab')); });

    const call = mockTrackEvent.mock.calls.find((c) => c[0] === 'manage_cta_clicked');
    expect(call).toBeDefined();
    expect(typeof call![1].persona).toBe('string');
  });

  it('share 모달에서 "link" 선택 → share_action_clicked {method:"link"}', async () => {
    sessionStorage.setItem(STORAGE_KEYS.SATISFACTION_DONE, '1');
    const { getByTestId, findByText } = await act(async () =>
      render(<ResultView answers={makeAnswers()} onReset={vi.fn()} />),
    );

    await act(async () => { fireEvent.click(getByTestId('share-btn')); });
    mockTrackEvent.mockClear();

    // 공유 모달 버튼 클릭
    const linkBtn = await findByText('결과 공유하기');
    await act(async () => { fireEvent.click(linkBtn); });

    const call = mockTrackEvent.mock.calls.find((c) => c[0] === 'share_action_clicked');
    expect(call![1]).toMatchObject({ method: 'link' });
  });
});
