import { InlineCta } from './inline-cta';
import { Reveal } from './reveal';
import { SectionHeading } from './section-heading';

const STEPS = [
  { n: '01', t: '몇 가지 선택에 답하기', d: '지역 · 예산 · 하객 수 등 간단한 질문에 답해요' },
  { n: '02', t: '우리 커플 유형 분류', d: '답변을 바탕으로 결혼 가치관 유형을 자동 분류해요' },
  { n: '03', t: '통계 기반 예산 초안 생성', d: '항목별 금액 · 비중 · 준비 순서까지 한 번에' },
];

export function MethodBand() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-20 sm:py-28">
      <SectionHeading
        eyebrow="이렇게 진행돼요"
        title={
          <>
            3분이면 끝나는
            <br className="sm:hidden" /> 예산 설계
          </>
        }
      />
      <div className="grid gap-10 sm:grid-cols-3 sm:gap-0">
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 80}>
            <div className="border-t border-[#373737]/15 px-1 pt-6 sm:px-7">
              <span className="block text-4xl font-bold tabular-nums text-[#373737]/25 sm:text-5xl">
                {s.n}
              </span>
              <h3 className="mt-4 text-lg font-bold text-[#373737] sm:text-xl">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#373737]/65">{s.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="mt-14 hidden justify-center sm:flex">
        <InlineCta />
      </div>
    </section>
  );
}
