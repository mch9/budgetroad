'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/gtag';
import { isReturningVisitor } from '@/lib/visitor';

export default function TrackPageEnter({ eventName }: { eventName: string }) {
  useEffect(() => {
    trackEvent(eventName, {
      is_returning: isReturningVisitor() ? 'yes' : 'no',
    });
  }, [eventName]);

  return null;
}
