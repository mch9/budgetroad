'use client';

import { useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/gtag';

// 랜딩 이탈 시 머문 초를 기록(landing_exited). "10초 이내 이탈" 판단은 쿼리에서.
// result_exited 패턴 복제: visibilitychange/pagehide/언마운트 + 중복발화 방지.
export default function TrackLandingExit() {
  const enteredAt = useRef(0);
  const exitFired = useRef(false);

  useEffect(() => {
    enteredAt.current = Date.now();

    function fireExit() {
      if (exitFired.current) return;
      exitFired.current = true;
      try {
        trackEvent('landing_exited', {
          time_on_landing_sec: Math.round((Date.now() - enteredAt.current) / 1000),
        });
      } catch {
        /* 추적 실패가 페이지·네비게이션을 깨지 않도록 무시 */
      }
    }
    function onVis() {
      if (document.visibilityState === 'hidden') fireExit();
    }

    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pagehide', fireExit);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pagehide', fireExit);
      fireExit(); // 다른 페이지로 이동(언마운트)도 이탈로 기록
    };
  }, []);

  return null;
}
