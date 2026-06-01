import { getVisitorId } from './visitor';
import { nextSessionContext } from './session';

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number>,
) {
  if (typeof window === 'undefined') return;

  const visitorId = getVisitorId();
  const { session_id, event_seq } = nextSessionContext();

  if (window.gtag) {
    window.gtag('event', eventName, {
      ...params,
      visitor_id: visitorId,
      session_id,
      event_seq,
    });
  }

  void fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      visitor_id: visitorId,
      session_id,
      event_name: eventName,
      properties: { ...params, event_seq },
    }),
    keepalive: true,
  }).catch(() => {});
}
