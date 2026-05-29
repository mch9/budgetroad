import type { ResultPayload, ResultCategory, ToggleState, ToggleGroup } from '@/lib/budget-engine';
import { TYPE_CONFIGS, TOGGLES_META } from '@/lib/budget-engine';
import { DonutChart } from './charts/donut-chart';
import { CATEGORY_COLORS } from './charts/category-colors';

// 결과 3탭(종합/항목별/추가금)을 한 장(540×675, @2x→1080×1350)으로 재가공한 다운로드용 카드.
// 화면 캡처가 아니라 인사이트를 결론→근거→판단→액션 흐름으로 압축. html2canvas-pro로 캡처.

type Props = { result: ResultPayload; toggles: ToggleState };

const DIAGNOSIS: Record<string, { cls: string; label: string }> = {
  FIT: { cls: 'bg-[#F2FBF4] border-[#9DD4A8] text-[#1A6E2A]', label: '✓ 적정' },
  OVER: { cls: 'bg-[#FFF1F1] border-[#F0A1A1] text-[#A01818]', label: '⬆ 초과' },
  UNDER: { cls: 'bg-[#F0F7FF] border-[#AAC7E1] text-[#0A4A8A]', label: '⬇ 여유' },
  WARN: { cls: 'bg-[#FFF7E6] border-[#F5C158] text-[#A06800]', label: '⚠️ 주의' },
};

const GROUP_ORDER: ToggleGroup[] = ['예식장', '스튜디오', '드레스', '메이크업'];

export function ShareCard({ result, toggles }: Props) {
  const config = TYPE_CONFIGS[result.vars.persona];
  const total = result.budget.total;
  const categories = Object.keys(result.budget.categories) as ResultCategory[];
  const donutData = categories.map((cat) => ({
    label: cat,
    value: result.budget.categories[cat],
    color: CATEGORY_COLORS[cat],
  }));
  const diag = DIAGNOSIS[result.consistency.status] ?? DIAGNOSIS.FIT;
  const tags = config.tags.slice(0, 3).map((t) => t.replace(/^#/, '').replace(/_/g, ' '));
  const invest = result.advice.invest.slice(0, 2);
  const save = result.advice.save.slice(0, 2);
  const groupCounts = GROUP_ORDER.map((g) => ({
    g,
    n: TOGGLES_META.filter((m) => m.group === g && toggles[m.id]).length,
  })).filter((x) => x.n > 0);
  const totalOn = groupCounts.reduce((s, c) => s + c.n, 0);

  return (
    <div className="flex h-[675px] w-[540px] flex-col overflow-hidden bg-white font-sans text-[#171717]">
      {/* [A] 헤더 */}
      <div className="flex items-center justify-between px-5 py-2.5">
        <span className="text-sm font-bold text-[#373737]">버짓로드</span>
        <span className="text-[11px] text-[#A1A1A1]">결혼 예산 리포트</span>
      </div>

      {/* [B] 페르소나 히어로 */}
      <div className="flex items-center gap-4 border-t border-[rgba(170,199,225,0.4)] px-5 py-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/illustrations/persona-${config.illustration}.svg`}
          alt=""
          aria-hidden
          className="h-[112px] w-[112px] shrink-0 object-contain"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-[#737373]">우리 커플은</p>
          <h2 className="mt-0.5 text-[22px] font-bold leading-tight text-[#373737]">
            {config.title}
          </h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="rounded-full bg-[rgba(170,199,225,0.22)] px-2.5 py-0.5 text-[11px] font-semibold text-[#7499BA]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* [C] 총예산 밴드 */}
      <div className="flex items-end justify-between border-t border-[rgba(170,199,225,0.4)] px-5 py-3">
        <div>
          <p className="text-xs text-[#737373]">예상 총 예산</p>
          <p className="mt-0.5">
            <span className="text-[44px] font-bold leading-none tabular-nums text-[#373737]">
              {total.toLocaleString()}
            </span>
            <span className="ml-1 text-base text-[#737373]">만원</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {[
            result.vars.region,
            result.vars.season === 'peak' ? '성수기' : '비성수기',
            `${result.vars.guests.toLocaleString()}명`,
          ].map((chip, i) => (
            <span
              key={i}
              className="rounded-md bg-[#F9FAFB] px-2 py-0.5 text-[11px] text-[#525252]"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>

      {/* [D] 도넛 + 레전드(게이지) */}
      <div className="flex items-center gap-5 border-t border-[rgba(170,199,225,0.4)] px-5 py-3">
        <DonutChart
          data={donutData}
          size={128}
          stroke={20}
          centerLabel="총 예산"
          centerValue={`${total.toLocaleString()}만원`}
        />
        <div className="flex flex-1 flex-col gap-1.5">
          {categories.map((cat) => {
            const amount = result.budget.categories[cat];
            const pct = Math.round((amount / total) * 100);
            return (
              <div key={cat} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                />
                <span className="w-14 shrink-0 text-xs text-[#525252]">{cat}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F3F4F6]">
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: CATEGORY_COLORS[cat] }}
                  />
                </span>
                <span className="ml-1 shrink-0 text-xs font-semibold tabular-nums text-[#171717]">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* [E] 진단 배지 */}
      <div className="px-5 py-2">
        <div className={`flex items-center gap-2 rounded-xl border p-2.5 ${diag.cls}`}>
          <span className="shrink-0 text-xs font-bold">{diag.label}</span>
          <span className="truncate text-sm font-bold">{result.consistency.headline}</span>
        </div>
      </div>

      {/* [F] 어드바이스 2열 */}
      <div className={`grid flex-1 gap-4 border-t border-[rgba(170,199,225,0.4)] px-5 py-3 ${save.length > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <AdviceCol title="여기에 더 투자" items={invest} />
        {save.length > 0 && <AdviceCol title="여기서 줄여도 OK" items={save} />}
      </div>

      {/* [G] 추가옵션 요약 */}
      <div className="border-t border-[rgba(170,199,225,0.4)] px-5 py-2.5 text-xs text-[#525252]">
        {totalOn > 0 ? (
          <>
            선택 옵션 <span className="font-semibold text-[#373737]">{totalOn}개</span>
            <span className="text-[#A1A1A1]">
              {' '}
              ({groupCounts.map((c) => `${c.g} ${c.n}`).join(' · ')})
            </span>
            <span className="ml-1 font-semibold tabular-nums text-[#7499BA]">
              +{result.budget.toggleDelta.toLocaleString()}만원
            </span>
          </>
        ) : (
          '추가 옵션 없이 기본 구성'
        )}
      </div>

      {/* [H] 푸터 */}
      <div className="flex items-center justify-between border-t border-[rgba(170,199,225,0.4)] px-5 py-2 text-[10px] text-[#A1A1A1]">
        <span>버짓로드 · budgetroad</span>
        <span>지역·시즌 따라 ±15% 변동</span>
        <span>budgetroad.app</span>
      </div>
    </div>
  );
}

function AdviceCol({
  title,
  items,
}: {
  title: string;
  items: Array<{ title: string; desc: string }>;
}) {
  return (
    <div className="min-w-0">
      <p className="pb-1.5 text-xs font-bold text-[#7499BA]">{title}</p>
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#7499BA] text-[10px] font-bold text-white">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold leading-tight text-[#171717]">
                {item.title}
              </p>
              <p
                className="mt-0.5 text-[11px] leading-snug text-[#525252]"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {item.desc}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
