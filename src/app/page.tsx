import Link from 'next/link';
import TrackPageEnter from '@/components/common/TrackPageEnter';
import { CtaLink } from './cta-link';

export default function Home() {
  return (
    <div className="flex flex-col">
      <TrackPageEnter eventName="service_entered" />

      {/* Hero */}
      <section className="flex flex-col items-center bg-gradient-to-b from-white to-orange-50/60 px-6 pb-16 pt-20 text-center">
        <h1 className="max-w-lg text-3xl font-extrabold leading-snug tracking-tight text-foreground sm:text-5xl sm:leading-tight">
          결혼하면 대체
          <br />
          얼마나 드는 걸까?
        </h1>
        <p className="mt-6 max-w-md text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          검색해도 안 나오고, 물어보기도 애매하고.
          <br />
          결혼 비용, 왜 이렇게 알기 어려울까요?
        </p>
        <CtaLink />
        <p className="mt-5 text-sm text-muted-foreground/60">
          로그인 없이, 3분이면 끝나요
        </p>
      </section>

      {/* Empathy */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-xl">
          <h2 className="text-center text-xl font-bold text-foreground sm:text-2xl">
            결혼 비용, 왜 이렇게 알기 어려울까요?
          </h2>
          <div className="mt-10 flex flex-col gap-5">
            {[
              {
                icon: '🔍',
                text: '검색하면 광고만 나오고, 실제 비용은 안 나와요',
              },
              {
                icon: '📞',
                text: '견적 받으려면 업체에 전화부터 해야 하고',
              },
              {
                icon: '🤷',
                text: '주변에 물어봐도 다 다르다고만 해요',
              },
              {
                icon: '😵',
                text: '엑셀 템플릿 받았는데 빈칸만 쳐다보게 돼요',
              },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-start gap-4 rounded-xl bg-gray-50 p-4"
              >
                <span className="text-xl">{item.icon}</span>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-base leading-relaxed text-muted-foreground">
            그래서 통계 기반으로, 누구나 3분이면
            <br />
            확인할 수 있게 만들었어요.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-orange-50/40 px-6 py-16">
        <div className="mx-auto max-w-xl">
          <h2 className="text-center text-xl font-bold text-foreground sm:text-2xl">
            이렇게 동작해요
          </h2>
          <div className="mt-10 flex flex-col gap-6">
            {[
              {
                step: '1',
                title: '조건 선택',
                desc: '지역, 예식장 유형, 시기를 선택하세요',
              },
              {
                step: '2',
                title: '등급 선택',
                desc: '스드메, 식사, 예물 등급을 골라주세요',
              },
              {
                step: '3',
                title: '예산 초안 완성',
                desc: '항목별 금액과 총 예산을 한눈에 확인하세요',
              },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                  {item.step}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="bg-white px-6 py-12">
        <div className="mx-auto flex max-w-xl flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="rounded-full bg-gray-100 px-4 py-2">
            📊 2025~2026 한국소비자원 가격 조사 기반
          </span>
          <span className="rounded-full bg-gray-100 px-4 py-2">
            📍 서울 강남 / 강남 외 / 경기 지역별 시세 반영
          </span>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gradient-to-t from-orange-50/60 to-white px-6 py-16 text-center">
        <p className="text-base text-muted-foreground">
          아직 계획 없어도 괜찮아요.
          <br />
          가볍게 구경해보세요.
        </p>
        <div className="mt-6">
          <CtaLink />
        </div>
      </section>
    </div>
  );
}
