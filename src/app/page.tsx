import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Check, TrendingUp, Wallet } from 'lucide-react';
import TrackPageEnter from '@/components/common/TrackPageEnter';
import { CtaLink, ManageLink } from './cta-link';

// Figma-hosted screenshots (expire 2026-06-11 — replace with /public assets)
const IMG_STEP1 = 'https://www.figma.com/api/mcp/asset/6b407af9-9cd9-470c-8ce8-607f899ba0f1';
const IMG_STEP2 = 'https://www.figma.com/api/mcp/asset/ec1549a7-1a20-49cb-bba7-a23f181c7c90';
const IMG_STEP3 = 'https://www.figma.com/api/mcp/asset/30501667-087b-4439-a00e-cac1e35181cb';
const IMG_STEP4 = 'https://www.figma.com/api/mcp/asset/cbce9984-9c14-43a8-ae93-bcc4825742c9';
const IMG_STEP5 = 'https://www.figma.com/api/mcp/asset/0f540ace-8c57-4685-9f10-d987468295b8';
const IMG_STEP6 = 'https://www.figma.com/api/mcp/asset/51d8070e-fcc2-436e-a37b-3f36a28a4a7a';
const IMG_STEP7 = 'https://www.figma.com/api/mcp/asset/280b39bd-3e93-4466-aa4d-f23c4963d543';

function MockWindow({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-lg border-t-[20px] border-[#f0eded] bg-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]">
      <div className="absolute left-3 top-[-14px] size-[6px] rounded-full bg-[#ff5f56] shadow-[12px_0_0_0_#ffbd2e,24px_0_0_0_#27c93f]" />
      {children}
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col bg-[#F9FAFB]">
      <TrackPageEnter eventName="service_entered" />

      {/* Header */}
      <header className="sticky top-0 z-10 flex h-[87px] items-center border-b border-[#e5e7eb] bg-[#F9FAFB] px-8">
        <Image
          src="/brand/logo-ko-nav.png"
          alt="버짓로드"
          width={269}
          height={80}
          className="h-[32px] w-auto"
          priority
        />
      </header>

      {/* Hero */}
      <section className="flex min-h-[calc(100svh-87px)] flex-col items-center justify-center gap-8 pb-24 pt-8 text-center">
        {/* 웨딩 커플 일러스트 — SVG가 100% 기반이라 w·h 명시 필요 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/couple-illustration.svg"
          alt=""
          aria-hidden
          className="h-[160px] w-[160px] sm:h-[220px] sm:w-[220px] lg:h-[269px] lg:w-[269px]"
        />

        {/* 텍스트 콘텐츠 */}
        <div className="flex shrink-0 flex-col items-center gap-5 px-6">
          <h1 className="break-keep text-[42px] font-bold leading-tight tracking-tighter text-[#373737] sm:text-[64px] lg:text-[88px]">
            <span className="relative whitespace-nowrap">
              {/* 파란 하이라이트 채우기 */}
              <span
                className="absolute -inset-x-2 inset-y-1 -rotate-1 bg-[rgba(170,199,225,0.3)]"
                aria-hidden
              />
              {/* 점선 박스 (Figma Group8) */}
              <span
                className="absolute -inset-x-3 -inset-y-2 -rotate-1"
                aria-hidden
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/highlight-dashes.svg" alt="" className="h-full w-full" />
              </span>
              <span className="relative">결혼 준비,</span>
            </span>
            <br />
            어디서부터 시작할까?
          </h1>
          <p className="break-keep text-base text-[#373737] sm:text-[20px]">
            몇 가지 선택만으로 내 결혼 예산을 바로 확인하세요
          </p>
          <CtaLink />
          <ManageLink />
          <div className="flex flex-col items-center gap-2 text-xs text-[#373737]">
            <span>스크롤</span>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="animate-bounce">
              <path d="M3 6l6 6 6-6" stroke="#373737" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </section>

      {/* Process overview */}
      <section className="bg-white px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-16 text-center text-[28px] font-bold text-[#111827] sm:text-[34px]">
            데이터로 완성되는 3단계 웨딩 설계
          </h2>
          <div className="grid gap-10 sm:grid-cols-3">
            {[
              {
                num: '01',
                title: '심층 취향 분석',
                desc: '선호하는 무드, 우선순위 가치, 하객 규모 및 가치관 설문을 통해 커플의 잠재된 취향을 도출합니다.',
              },
              {
                num: '02',
                title: '정밀 결과 리포트',
                desc: '공신력 있는 참가격 데이터 기반의 예산 산출 근거와 전략적 우선순위가 포함된 상세 리포트를 제공합니다.',
              },
              {
                num: '03',
                title: '자동화 추천 솔루션',
                desc: '분석된 타입에 꼭 맞는 웨딩 아이템과 개인 맞춤형 할 일 리스트(To-do)를 시스템이 자동으로 구성합니다.',
              },
            ].map(({ num, title, desc }) => (
              <div key={num} className="flex flex-col items-center gap-4 text-center">
                <div className="flex size-[72px] items-center justify-center rounded-[18px] bg-[rgba(170,199,225,0.3)]">
                  <span className="text-[27px] font-bold text-[#364153]">{num}</span>
                </div>
                <h3 className="text-[22px] font-bold text-[#111827]">{title}</h3>
                <p className="break-keep text-[15px] leading-relaxed text-[#6b7280]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Step 1 — light */}
      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-5xl items-center gap-16 sm:grid-cols-2">
          <div className="flex flex-col gap-4">
            <p className="text-xs font-bold uppercase tracking-[1.4px] text-[#5d5f5f]">STEP 01</p>
            <h2 className="break-keep text-[38px] font-light leading-tight tracking-tight text-[#1b1c1c] sm:text-[48px]">
              취향을 발견하는 스마트 분석
            </h2>
            <div className="break-keep pt-2 text-base leading-relaxed text-[#444748]">
              추상적인 &apos;느낌&apos;을 구체적인 데이터로 전환합니다. AI가 당신의 숨겨진 선호를 분석하여 가장 적합한 웨딩 가치를 찾아냅니다.
            </div>
            <div className="mt-2 inline-flex items-center gap-3 self-start rounded-[12px] bg-[rgba(170,199,225,0.3)] px-5 py-3">
              <Sparkles className="size-4 shrink-0 text-[#5d8fa8]" />
              <span className="text-sm text-[#1b1c1c]">개인 성향 정밀 진단 시스템</span>
            </div>
          </div>
          <MockWindow>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG_STEP1} alt="취향 분석 화면" className="w-full" />
          </MockWindow>
        </div>
      </section>

      {/* Step 2 — dark */}
      <section className="bg-[#454545] px-6 py-24">
        <div className="mx-auto grid max-w-5xl items-center gap-16 sm:grid-cols-2">
          <MockWindow>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG_STEP2} alt="웨딩 스타일 결과 화면" className="w-full" />
          </MockWindow>
          <div className="flex flex-col gap-4">
            <p className="text-xs font-bold uppercase tracking-[1.4px] text-white">STEP 02</p>
            <h2 className="break-keep text-[38px] font-light leading-tight tracking-tight text-white sm:text-[48px]">
              데이터가 정의하는 우리만의 스타일
            </h2>
            <div className="break-keep pt-2 text-base leading-relaxed text-white">
              수만 가지의 옵션 중 당신에게 최적화된 웨딩 타입을 매칭합니다. 단순한 추천을 넘어 데이터로 증명된 스타일 가이드를 제공합니다.
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {['맞춤형 타입 매칭', '실시간 트렌드 반영'].map((label) => (
                <div key={label} className="break-keep rounded-[12px] bg-white px-6 py-4 text-center text-sm text-[#1b1c1c]">
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Step 3 — light */}
      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-5xl items-center gap-16 sm:grid-cols-2">
          <div className="flex flex-col gap-4">
            <p className="text-xs font-bold uppercase tracking-[1.4px] text-[#5d5f5f]">STEP 03</p>
            <h2 className="break-keep text-[38px] font-light leading-tight tracking-tight text-[#1b1c1c] sm:text-[48px]">
              납득 가능한 예산 가이드라인
            </h2>
            <div className="break-keep pt-2 text-base leading-relaxed text-[#444748]">
              불필요한 거품을 걷어낸 정직한 견적을 제안합니다. 시장 시세와 선호도를 반영하여 예산 수립의 명확한 근거를 제시합니다.
            </div>
            <ul className="mt-4 flex flex-col gap-4">
              {['시장 시세 실시간 연동 시스템', '하객 규모별 변동성 분석'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-base text-[#1b1c1c]">
                  <Check className="size-[18px] shrink-0 text-[#aac7e1]" strokeWidth={2.5} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <MockWindow>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG_STEP3} alt="예산 내역 화면" className="w-full" />
          </MockWindow>
        </div>
      </section>

      {/* Step 4 — white */}
      <section className="bg-white px-6 py-24">
        <div className="mx-auto grid max-w-5xl items-center gap-16 sm:grid-cols-2">
          <MockWindow>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG_STEP4} alt="전체 설계도 화면" className="w-full" />
          </MockWindow>
          <div className="flex flex-col gap-4">
            <p className="text-xs font-bold uppercase tracking-[1.4px] text-[#5d5f5f]">STEP 04</p>
            <h2 className="break-keep text-[38px] font-light leading-tight tracking-tight text-[#1b1c1c] sm:text-[48px]">
              한눈에 파악하는 전체 설계도
            </h2>
            <div className="break-keep pt-2 text-base leading-relaxed text-[#444748]">
              예식장부터 신혼여행까지 전체 흐름을 투명하게 관리하세요. 카테고리 별 비중을 실시간으로 조정하며 최적의 밸런스를 찾을 수 있습니다.
            </div>
            <div className="mt-4 rounded-[16px] border border-[rgba(196,199,200,0.3)] bg-[rgba(229,231,235,0.3)] p-6 shadow-[0px_20px_40px_0px_rgba(0,0,0,0.1)]">
              <div className="flex items-center justify-between gap-4">
                <span className="text-base font-bold text-[#1b1c1c]">Total Budget</span>
                <span className="text-[22px] font-bold tabular-nums text-[#5d5f5f]">₩ 45,000,000</span>
              </div>
              <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[#e4e2e1]">
                <div className="h-full w-3/4 rounded-full bg-[#5d5f5f]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step 5 — light */}
      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-5xl items-center gap-16 sm:grid-cols-2">
          <div className="flex flex-col gap-4">
            <p className="text-xs font-bold uppercase tracking-[1.4px] text-[#5d5f5f]">STEP 05</p>
            <h2 className="break-keep text-[38px] font-light leading-tight tracking-tight text-[#1b1c1c] sm:text-[48px]">
              당신의 타입에 맞춘 자동 추천
            </h2>
            <div className="break-keep pt-2 text-base leading-relaxed text-[#444748]">
              수많은 업체 중 당신의 스타일에 맞는 핵심 조각만을 모았습니다. 시스템이 자동으로 필수 항목을 구성하여 복잡한 선택의 피로를 줄여줍니다.
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {['#LuxuryClassic', '#Minimalist', '#GardenWedding'].map((tag) => (
                <span key={tag} className="rounded-full bg-[rgba(227,242,253,0.3)] px-5 py-2 text-sm font-medium tracking-wide text-[#1b1c1c]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <MockWindow>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG_STEP5} alt="자동 추천 화면" className="w-full" />
          </MockWindow>
        </div>
      </section>

      {/* Step 6 — dark */}
      <section className="bg-[#454545] px-6 py-24">
        <div className="mx-auto grid max-w-5xl items-center gap-16 sm:grid-cols-2">
          <MockWindow>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG_STEP6} alt="투자 진단 화면" className="w-full" />
          </MockWindow>
          <div className="flex flex-col gap-4">
            <p className="text-xs font-bold uppercase tracking-[1.4px] text-[#d6e5ef]">STEP 06</p>
            <h2 className="break-keep text-[38px] font-light leading-tight tracking-tight text-white sm:text-[48px]">
              스마트한 의사결정 전략 진단
            </h2>
            <div className="break-keep pt-2 text-base leading-relaxed text-white/80">
              어디에 집중하고 어디서 절감해야 할지 데이터가 가이드를 제공합니다. 만족도와 가성비를 고려한 전략적인 결혼 준비를 경험하세요.
            </div>
            <div className="mt-4 flex items-center gap-4 rounded-[16px] border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
              <TrendingUp className="size-5 shrink-0 text-white" />
              <div>
                <p className="text-base text-white">투자 가치 정밀 진단</p>
                <p className="mt-0.5 text-sm text-white/70">비용 대비 만족도 효용성 데이터 분석</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step 7 — light */}
      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-5xl items-center gap-16 sm:grid-cols-2">
          <div className="flex flex-col gap-4">
            <p className="text-xs font-bold uppercase tracking-[1.4px] text-[#5d5f5f]">STEP 07</p>
            <h2 className="break-keep text-[38px] font-light leading-tight tracking-tight text-[#1b1c1c] sm:text-[48px]">
              실시간으로 관리하는 자신만의 예산안
            </h2>
            <div className="break-keep pt-2 text-base leading-relaxed text-[#444748]/80">
              체계적인 가계부 시스템으로 실제 지출을 꼼꼼하게 기록하세요. 예산 대비 잔액을 실시간으로 확인하여 예산 범위를 넘지 않도록 도와줍니다.
            </div>
            <div className="mt-4 inline-flex items-center gap-3 self-start rounded-[12px] bg-[rgba(170,199,225,0.3)] px-5 py-3">
              <Wallet className="size-4 shrink-0 text-[#5d8fa8]" />
              <span className="text-sm text-[#1b1c1c]">나만의 지출 트래킹 시스템</span>
            </div>
          </div>
          <MockWindow>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG_STEP7} alt="예산 관리 화면" className="w-full" />
          </MockWindow>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-white px-6 py-36 text-center">
        <h2 className="break-keep text-[38px] font-medium leading-tight tracking-tight text-[#1b1c1c] sm:text-[48px]">
          당신만의 웨딩을 지금 바로 설계해보세요
        </h2>
        <p className="mx-auto mt-4 max-w-xl break-keep text-base leading-relaxed text-[#444748]/80">
          발품 팔며 헤매는 시간 대신, 데이터가 알려주는 가장 효율적이고 아름다운 시작을 제안합니다.
        </p>
        <Link
          href="/budget-draft"
          className="mt-10 inline-flex h-14 items-center justify-center rounded-full bg-[#373737] px-8 text-base font-semibold text-white transition-all hover:bg-[#2a2a2a] active:scale-[0.98]"
        >
          좋아요, 시작할게요 →
        </Link>
      </section>
    </div>
  );
}
