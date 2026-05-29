import { Reveal } from './reveal';
import { SectionHeading } from './section-heading';

const INK = '#373737';
const ACCENT = '#AAC7E1';

function TokenCouple() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="15" cy="14" r="5" stroke={INK} strokeWidth="1.5" />
      <circle cx="26" cy="14" r="5" stroke={INK} strokeWidth="1.5" />
      <path d="M7 32c0-5 3.6-8 8-8s8 3 8 8" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 32c0-5 3.6-8 8-8s8 3 8 8" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TokenDonut() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="20" cy="20" r="13" stroke={INK} strokeOpacity="0.18" strokeWidth="5" />
      <circle
        cx="20"
        cy="20"
        r="13"
        stroke={ACCENT}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="60 82"
        transform="rotate(-90 20 20)"
      />
    </svg>
  );
}

function TokenBars() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
      <rect x="7" y="20" width="6" height="13" rx="1.5" fill={INK} fillOpacity="0.85" />
      <rect x="17" y="12" width="6" height="21" rx="1.5" fill={ACCENT} />
      <rect x="27" y="24" width="6" height="9" rx="1.5" fill={INK} fillOpacity="0.85" />
    </svg>
  );
}

function TokenTimeline() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
      <path d="M13 8v24" stroke={INK} strokeOpacity="0.18" strokeWidth="1.5" />
      <circle cx="13" cy="10" r="3.5" fill={ACCENT} />
      <circle cx="13" cy="20" r="3" stroke={INK} strokeWidth="1.5" />
      <circle cx="13" cy="30" r="3" stroke={INK} strokeWidth="1.5" />
      <path d="M20 10h13M20 20h10M20 30h11" stroke={INK} strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const RESULTS = [
  { token: <TokenCouple />, t: '우리 커플 유형', d: '5가지 중 우리에게 맞는 결혼 가치관 유형' },
  { token: <TokenDonut />, t: '예상 총 예산', d: '통계로 추정한 우리 결혼의 전체 예산 규모' },
  { token: <TokenBars />, t: '항목별 배분', d: '예식장·스드메·예물·신혼여행 등 비중' },
  { token: <TokenTimeline />, t: '준비 순서', d: '지금부터 무엇을 먼저 해야 하는지' },
];

export function ResultPreview() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-20 sm:py-28">
      <SectionHeading
        eyebrow="3분 후 받게 될 결과"
        title="이런 걸 받아요"
        desc="검색해서 짜맞추지 않아도, 우리 커플에 맞는 예산 초안이 한 번에 정리돼요."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {RESULTS.map((r, i) => (
          <Reveal key={r.t} delay={i * 70}>
            <div className="flex h-full items-start gap-4 rounded-2xl border border-[#373737]/10 bg-white/50 p-6">
              <div className="shrink-0">{r.token}</div>
              <div>
                <h3 className="text-base font-bold text-[#373737] sm:text-lg">{r.t}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#373737]/65">{r.d}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
