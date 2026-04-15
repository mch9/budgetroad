import Image from 'next/image';
import TrackPageEnter from '@/components/common/TrackPageEnter';
import { CtaLink } from './cta-link';

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col bg-[#F9FAFB]">
      <TrackPageEnter eventName="service_entered" />

      <header className="flex h-14 items-center border-b border-[#E5E7EB] px-6 sm:h-[56px] sm:px-10">
        <span className="font-[family-name:var(--font-geist-sans)] text-lg font-bold text-[#101828] sm:text-xl">
          budgetroad
        </span>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center sm:gap-8">
        <Image
          src="/couple-illustration.png"
          alt="결혼 커플 라인아트 일러스트"
          width={269}
          height={269}
          className="h-auto w-[180px] sm:w-[269px]"
          priority
        />

        <h1 className="text-[32px] font-bold leading-tight tracking-tight text-[#101828] sm:text-[60px] sm:leading-[1.15]">
          결혼 준비,
          <br />
          어디서부터 시작할까?
        </h1>

        <p className="text-sm text-[#6A7282] sm:text-base">
          몇 가지 선택만으로 내 결혼 예산을 바로 확인하세요
        </p>

        <CtaLink />
      </main>
    </div>
  );
}
