import { getVisitorId } from './visitor';

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number>,
) {
  if (typeof window === 'undefined') return;

  const visitorId = getVisitorId();

  if (window.gtag) {
    window.gtag('event', eventName, {
      ...params,
      visitor_id: visitorId,
    });
  }

  void fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      visitor_id: visitorId,
      event_name: eventName,
      properties: params,
    }),
    keepalive: true,
  }).catch(() => {});
}
