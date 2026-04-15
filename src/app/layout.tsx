import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteTitle = '버짓로드 - 내 결혼 예산 초안 만들기';
const siteDescription =
  '결혼 유형만 선택하면 통계 기반으로 항목별 예산 초안을 자동으로 만들어드려요. 시세 조사 없이, 3분이면 전체 예산 감을 잡을 수 있어요.';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://budgetroad.vercel.app',
  ),
  title: {
    default: siteTitle,
    template: '%s | 버짓로드',
  },
  description: siteDescription,
  keywords: ['결혼 예산', '결혼 비용', '웨딩 예산', '식장 비용', '스드메 가격'],
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    siteName: '버짓로드',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: 'YmGt-wjc-lhqTmMKL9zX1HZg2rpatK_60Qbd032_ZJo',
    other: {
      'naver-site-verification': ['202f5be82fbae028ff3ec54293cdd336b906894c'],
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
