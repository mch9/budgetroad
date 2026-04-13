'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/gtag';

export default function TrackPageEnter({ eventName }: { eventName: string }) {
  useEffect(() => {
    trackEvent(eventName);
  }, [eventName]);

  return null;
}
