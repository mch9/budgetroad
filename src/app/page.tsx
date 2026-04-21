import Image from 'next/image';
import TrackPageEnter from '@/components/common/TrackPageEnter';
import { CtaLink } from './cta-link';

function CrossMarker() {
  return (
    <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
      <line x1="10.5" y1="0" x2="10.5" y2="8" stroke="#000" strokeWidth="1" />
      <line x1="10.5" y1="13" x2="10.5" y2="21" stroke="#000" strokeWidth="1" />
      <line x1="0" y1="10.5" x2="8" y2="10.5" stroke="#000" strokeWidth="1" />
      <line x1="13" y1="10.5" x2="21" y2="10.5" stroke="#000" strokeWidth="1" />
    </svg>
  );
}

function DashedGrid() {
  const dash = { borderStyle: 'dashed' as const };

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Vertical lines — Figma: x=100 (6.94%), x=1340 (93.06%) */}
      <div
        className="absolute left-6 top-0 h-[135%] sm:left-[6.94%]"
        style={{ borderLeft: '1px dashed #BABABA' }}
      />
      <div
        className="absolute right-6 top-0 h-[135%] sm:right-[6.94%]"
        style={{ borderLeft: '1px dashed #BABABA' }}
      />

      {/* Horizontal lines — Figma: y=87, y=660 (64.45%), y=1313 (128.2%) */}
      <div
        className="absolute left-0 top-[56px] w-full sm:top-[87px]"
        style={{ borderTop: '1px dashed #BABABA' }}
      />
      <div
        className="absolute left-0 top-[64.45%] w-full"
        style={{ borderTop: '1px dashed #BABABA' }}
      />
      <div
        className="absolute left-0 top-[128%] w-full"
        style={{ borderTop: '1px dashed #BABABA' }}
      />

      {/* Cross markers — 6 intersections */}
      {/* top-left (100, 87) */}
      <div className="absolute left-6 top-[56px] -translate-x-1/2 -translate-y-1/2 sm:left-[6.94%] sm:top-[87px]">
        <CrossMarker />
      </div>
      {/* top-right (1340, 87) */}
      <div className="absolute right-6 top-[56px] translate-x-1/2 -translate-y-1/2 sm:right-[6.94%] sm:top-[87px]">
        <CrossMarker />
      </div>
      {/* mid-left (100, 660) */}
      <div className="absolute left-6 top-[64.45%] -translate-x-1/2 -translate-y-1/2 sm:left-[6.94%]">
        <CrossMarker />
      </div>
      {/* mid-right (1340, 660) */}
      <div className="absolute right-6 top-[64.45%] translate-x-1/2 -translate-y-1/2 sm:right-[6.94%]">
        <CrossMarker />
      </div>
      {/* bottom-left (100, 1313) */}
      <div className="absolute left-6 top-[128%] -translate-x-1/2 -translate-y-1/2 sm:left-[6.94%]">
        <CrossMarker />
      </div>
      {/* bottom-right (1340, 1313) */}
      <div className="absolute right-6 top-[128%] translate-x-1/2 -translate-y-1/2 sm:right-[6.94%]">
        <CrossMarker />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative flex min-h-svh flex-col bg-[#F9FAFB]">
      <TrackPageEnter eventName="service_entered" />
      <DashedGrid />

      {/* Header — Figma: 87px, padding 24px 32px, no solid border (dashed grid line at same y) */}
      <header className="relative z-10 flex h-14 items-center px-6 sm:h-[87px] sm:px-8">
        <Image
          src="/brand/logo-ko-nav.png"
          alt="버짓로드"
          width={269}
          height={80}
          className="h-[28px] w-auto sm:h-[36px]"
          priority
        />
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-32 pt-12 text-center sm:gap-9 sm:py-12">
        {/* Illustration — Figma: 269x269 */}
        <Image
          src="/couple-illustration.png"
          alt="결혼 커플 라인아트 일러스트"
          width={269}
          height={269}
          className="h-auto w-[180px] sm:w-[269px]"
          priority
        />

        {/* Heading — Pretendard 700, color #373737, letter-spacing -4.09px */}
        <h1 className="text-[32px] font-bold leading-tight text-[#373737] sm:text-[60px] sm:leading-[1.05] sm:tracking-[-2px]">
          <span className="relative inline-block">
            결혼 준비,
            {/* Dashed box — Figma: rotate(-2deg), 1.14px dashed #000, inner fill rgba(170,199,225,0.3) */}
            <span
              className="pointer-events-none absolute -z-10"
              style={{
                inset: '-12px -16px',
                transform: 'rotate(-2deg)',
                border: '1.14px dashed #000000',
              }}
            />
            <span
              className="pointer-events-none absolute -z-20"
              style={{
                inset: '-4px -8px',
                transform: 'rotate(-2deg)',
                background: 'rgba(170, 199, 225, 0.3)',
              }}
            />
          </span>
          <br />
          어디서부터 시작할까?
        </h1>

        {/* Subtitle — Figma: Pretendard 400 20.47px, color #373737 */}
        <p className="text-sm text-[#373737] sm:text-xl">
          몇 가지 선택만으로 내 결혼 예산을 바로 확인하세요
        </p>

        <CtaLink />
      </main>
    </div>
  );
}
