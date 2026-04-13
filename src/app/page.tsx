import Link from 'next/link';
import TrackPageEnter from '@/components/common/TrackPageEnter';
import { CtaLink } from './cta-link';

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-white to-orange-50/60 px-6 py-20 text-center">
      <TrackPageEnter eventName="service_entered" />
      <h1 className="max-w-lg text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
        내 결혼, 대략 얼마나 들까?
      </h1>

      <p className="mt-6 max-w-md text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
        결혼 유형만 선택하면 통계 기반으로
        <br className="hidden sm:inline" /> 항목별 예산 초안을 자동으로 만들어드려요.
        <br />
        시세 조사 없이, 3분이면 전체 예산 감을 잡을 수 있어요.
      </p>

      <CtaLink />

      <div className="mt-8 flex items-center gap-5 text-sm text-muted-foreground">
        <span>📊 통계 기반</span>
        <span>⏱ 3분 완성</span>
        <span>🔒 로그인 불필요</span>
      </div>
    </div>
  );
}
