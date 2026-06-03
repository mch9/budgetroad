import { AnalyticsDashboard } from '@/components/analytics/dashboard';

export const dynamic = 'force-dynamic';

// 공개 링크(비번 없음). 검색엔진엔 노출 안 함.
export const metadata = {
  title: '버짓로드 분석',
  robots: { index: false, follow: false },
};

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#373737]">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-8 md:px-8">
        <AnalyticsDashboard />
      </div>
    </div>
  );
}
