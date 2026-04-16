import { getVisitorId } from './visitor';

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number>,
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...params,
      visitor_id: getVisitorId(),
    });
  }
}
