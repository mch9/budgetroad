import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '결혼 예산 초안 만들기',
  description:
    '결혼 유형과 지역을 선택하면 통계 기반으로 항목별 예산을 자동 계산해드려요. 식장, 스드메, 혼수, 예물 등 한눈에 확인하세요.',
  openGraph: {
    title: '결혼 예산 초안 만들기 | 버짓로드',
    description:
      '결혼 유형과 지역을 선택하면 통계 기반으로 항목별 예산을 자동 계산해드려요.',
  },
};

export default function BudgetDraftLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
