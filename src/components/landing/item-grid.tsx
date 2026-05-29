import { Reveal } from './reveal';
import { SectionHeading } from './section-heading';

// 금액은 최신 가격 DB + budget-engine 기준 (스드메·예식장 추가금 = TOGGLE_PRICES 범위,
// 예물/신혼여행/혼수 = type-config 유형별 추정). 옛 budget-data 값과 혼동 금지.
const ITEMS = [
  { icon: 'venue', name: '예식장', sub: '웨딩홀 · 호텔 · 야외', tag: '추가금', cost: '10~521만원' },
  { icon: 'sdm', name: '스드메', sub: '스튜디오 · 드레스 · 메이크업', tag: '추가금', cost: '3~222만원' },
  { icon: 'yedan', name: '예물 · 예단', sub: '반지 · 예단 구성', tag: '유형별', cost: '150~500만원' },
  { icon: 'honeymoon', name: '신혼여행', sub: '국내 · 해외', tag: '유형별', cost: '300~450만원' },
  { icon: 'furniture', name: '혼수', sub: '가구 · 가전', tag: '평균', cost: '약 600만원' },
];

export function ItemGrid() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-20 sm:py-28">
      <SectionHeading
        eyebrow="통계 기반 추정"
        title="5가지 핵심 항목"
        desc="꼭 필요한 항목만 골라, 우리 입력에 맞는 금액을 잡아드려요."
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {ITEMS.map((it, i) => (
          <Reveal key={it.icon} delay={i * 60}>
            <div className="flex h-full flex-col rounded-2xl border border-[#373737]/10 bg-white/50 p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/landing/icons/${it.icon}.svg`} alt="" aria-hidden className="h-8 w-8" loading="lazy" />
              <h3 className="mt-4 text-sm font-bold text-[#373737]">{it.name}</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#373737]/55">{it.sub}</p>
              <div className="mt-3">
                <span className="block text-[10px] text-[#373737]/45">{it.tag}</span>
                <span className="text-sm font-semibold tabular-nums text-[#373737]">{it.cost}</span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="mt-6 text-center text-xs leading-relaxed text-[#373737]/45">
        * 지역 · 유형 · 하객 수에 따라 달라지는 추정치예요. ‘추가금’은 선택 옵션 비용입니다.
      </p>
    </section>
  );
}
