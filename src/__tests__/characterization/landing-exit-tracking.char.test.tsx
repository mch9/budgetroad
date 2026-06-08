// @vitest-environment happy-dom

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, act } from '@testing-library/react';

vi.mock('@/lib/gtag', () => ({ trackEvent: vi.fn() }));

import { trackEvent } from '@/lib/gtag';
import TrackLandingExit from '@/components/common/track-landing-exit';

const mockTrackEvent = vi.mocked(trackEvent);

beforeEach(() => {
  mockTrackEvent.mockClear();
});

describe('TrackLandingExit — landing_exited', () => {
  it('마운트만으로는 발화하지 않음', () => {
    const { unmount } = render(<TrackLandingExit />);
    expect(
      mockTrackEvent.mock.calls.filter((c) => c[0] === 'landing_exited'),
    ).toHaveLength(0);
    act(() => {
      unmount();
    });
  });

  it('언마운트 시 landing_exited 1회 발화 + time_on_landing_sec 포함', () => {
    const { unmount } = render(<TrackLandingExit />);
    mockTrackEvent.mockClear();

    act(() => {
      unmount();
    });

    const exitCalls = mockTrackEvent.mock.calls.filter(
      (c) => c[0] === 'landing_exited',
    );
    expect(exitCalls).toHaveLength(1);
    const [, args] = mockTrackEvent.mock.calls.find(
      (c) => c[0] === 'landing_exited',
    )!;
    expect(typeof args.time_on_landing_sec).toBe('number');
  });

  it('visibilitychange=hidden 후 언마운트해도 중복 발화 없음', () => {
    const { unmount } = render(<TrackLandingExit />);

    act(() => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'hidden',
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(
      mockTrackEvent.mock.calls.filter((c) => c[0] === 'landing_exited'),
    ).toHaveLength(1);

    mockTrackEvent.mockClear();
    act(() => {
      unmount();
    });

    expect(
      mockTrackEvent.mock.calls.filter((c) => c[0] === 'landing_exited'),
    ).toHaveLength(0);
  });
});
