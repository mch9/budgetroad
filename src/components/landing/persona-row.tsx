import { Reveal } from './reveal';
import { SectionHeading } from './section-heading';

const PERSONAS = [
  { f: 'experience', label: '경험 연출형' },
  { f: 'standard', label: '표준 실용형' },
  { f: 'minimal', label: '본질 미니멀형' },
  { f: 'traditional', label: '전통 격식형' },
  { f: 'undecided', label: '탐색 미결정형' },
];

export function PersonaRow() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
      <SectionHeading
        eyebrow="결과 미리보기"
        title="어떤 커플에 가까운가요?"
        desc="유형마다 예산 우선순위가 달라요. 몇 가지만 답하면 우리 커플 유형이 나와요."
      />
      <div className="-mx-6 flex gap-4 overflow-x-auto px-6 pb-2 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0">
        {PERSONAS.map((p, i) => (
          <Reveal key={p.f} delay={i * 60} className="shrink-0">
            <div className="group flex h-full w-36 flex-col items-center rounded-2xl border border-[#373737]/10 bg-white/50 p-5 transition-colors hover:border-[#AAC7E1] sm:w-auto">
              <div className="relative flex h-28 w-full items-center justify-center">
                <span className="absolute h-20 w-20 rounded-full bg-[#AAC7E1]/0 transition-colors duration-300 group-hover:bg-[#AAC7E1]/25" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/landing/personas/persona-${p.f}.svg`}
                  alt={`${p.label} 커플 일러스트`}
                  className="relative h-24 w-24 object-contain"
                  loading="lazy"
                />
              </div>
              <span className="mt-3 text-sm font-semibold text-[#373737]">{p.label}</span>
            </div>
          </Reveal>
        ))}
      </div>
      {/* Mobile-only horizontal-scroll affordance */}
      <p className="mt-4 text-center text-xs text-[#373737]/45 sm:hidden">
        옆으로 밀어 5가지 유형 모두 보기 →
      </p>
    </section>
  );
}
