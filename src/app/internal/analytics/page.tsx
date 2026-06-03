import { AnalyticsDashboard } from '@/components/analytics/dashboard';

export const dynamic = 'force-dynamic';

// 공개 링크(비번 없음). 검색엔진엔 노출 안 함.
export const metadata = {
  title: '버짓로드 분석',
  robots: { index: false, follow: false },
};

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-[#F9FAFB] px-4 py-6 sm:px-6">
      <AnalyticsDashboard />
    </main>
  );
}
