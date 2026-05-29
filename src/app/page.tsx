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
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
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
      <div className="absolute left-6 top-[56px] -translate-x-1/2 -translate-y-1/2 sm:left-[6.94%] sm:top-[87px]">
        <CrossMarker />
      </div>
      <div className="absolute right-6 top-[56px] translate-x-1/2 -translate-y-1/2 sm:right-[6.94%] sm:top-[87px]">
        <CrossMarker />
      </div>
      <div className="absolute left-6 top-[64.45%] -translate-x-1/2 -translate-y-1/2 sm:left-[6.94%]">
        <CrossMarker />
      </div>
      <div className="absolute right-6 top-[64.45%] translate-x-1/2 -translate-y-1/2 sm:right-[6.94%]">
        <CrossMarker />
      </div>
      <div className="absolute left-6 top-[128%] -translate-x-1/2 -translate-y-1/2 sm:left-[6.94%]">
        <CrossMarker />
      </div>
      <div className="absolute right-6 top-[128%] translate-x-1/2 -translate-y-1/2 sm:right-[6.94%]">
        <CrossMarker />
      </div>
    </div>
  );
}

/* Soft-blue radial bloom behind the headline — one of three subtle depth layers */
function HeroBloom() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[80vh]"
      style={{
        background:
          'radial-gradient(ellipse 70% 50% at 50% 38%, rgba(170,199,225,0.16) 0%, transparent 60%)',
      }}
    />
  );
}

/* ~4% desaturated film grain — kills the flat-box feel, zero raster assets */
function GrainOverlay() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-[0.04]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id="landing-grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.9"
          numOctaves="2"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#landing-grain)" />
    </svg>
  );
}

/* Desktop-only animated scroll cue (mobile bottom is occupied by the fixed CTA) */
function ScrollCue() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-6 z-10 hidden justify-center sm:flex"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        className="animate-bounce text-[#373737]/40 motion-reduce:animate-none"
      >
        <path
          d="M6 9l6 6 6-6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative flex min-h-svh flex-col bg-[#F9FAFB]">
      <TrackPageEnter eventName="service_entered" />
      <GrainOverlay />
      <HeroBloom />
      <DashedGrid />

      {/* Header — Figma: 87px, no solid border (dashed grid line at same y) */}
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

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-32 pt-12 text-center sm:py-12">
        {/* Illustration — Figma: 269x269 */}
        <Image
          src="/couple-illustration.png"
          alt="결혼 커플 라인아트 일러스트"
          width={269}
          height={269}
          className="mb-7 h-auto w-[180px] sm:mb-9 sm:w-[269px]"
          priority
        />

        {/* Eyebrow — small editorial label with flanking hairlines */}
        <div className="mb-5 flex items-center justify-center gap-3 text-[#373737]/55">
          <span className="h-px w-6 bg-[#373737]/20" />
          <span className="text-[11px] font-medium tracking-[0.22em]">
            통계 기반 결혼 예산 초안
          </span>
          <span className="h-px w-6 bg-[#373737]/20" />
        </div>

        {/* Heading — Pretendard 700, color #373737 */}
        <h1 className="text-[32px] font-bold leading-tight text-[#373737] sm:text-[60px] sm:leading-[1.05] sm:tracking-[-2px]">
          <span className="relative inline-block">
            결혼 준비,
            {/* Dashed box — Figma: rotate(-2deg), 1.14px dashed, inner fill rgba(170,199,225,0.3) */}
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
          어디서부터 시작해볼까?
        </h1>

        {/* Subtitle — Figma: Pretendard 400 20.47px */}
        <p className="mt-6 text-sm text-[#373737] sm:text-xl">
          몇 가지 선택만으로 내 결혼 예산을 1분 만에 확인하세요
        </p>

        {/* Outcome promise */}
        <p className="mt-3 text-xs text-[#373737]/60 sm:text-sm">
          우리 커플 유형 · 예상 예산 · 항목별 배분 · 준비 순서
        </p>

        <div className="mt-9 flex flex-col items-center">
          <CtaLink />
          {/* Micro-trust — desktop only (mobile CTA is fixed; mobile trust added in mobile pass) */}
          <p className="mt-3 hidden text-xs text-[#373737]/50 sm:block">
            가입 없이 · 약 1분
          </p>
        </div>
      </main>

      <ScrollCue />
    </div>
  );
}
