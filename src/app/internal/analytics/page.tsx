import { cookies } from 'next/headers';
import { isAuthed, isConfigured, DASH_COOKIE } from '@/lib/analytics/auth';
import { AnalyticsDashboard } from '@/components/analytics/dashboard';
import { LoginGate } from '@/components/analytics/login-gate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const metadata = {
  title: '버짓로드 분석',
  robots: { index: false, follow: false },
};

export default async function AnalyticsPage() {
  const store = await cookies();
  const authed = isAuthed(store.get(DASH_COOKIE)?.value);

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-4 py-6 sm:px-6">
      {authed ? <AnalyticsDashboard /> : <LoginGate configured={isConfigured()} />}
    </main>
  );
}
