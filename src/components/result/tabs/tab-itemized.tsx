'use client';

import { useState } from 'react';
import type { ResultPayload, ResultCategory, ToggleState, ToggleGroup } from '@/lib/budget-engine';
import { TOGGLES_META, TOGGLE_PRICES } from '@/lib/budget-engine';
import { DonutChart } from '../charts/donut-chart';

type Props = { result: ResultPayload; toggles: ToggleState };

// 디자인 시스템 액센트 톤
const CATEGORY_COLORS: Record<ResultCategory, string> = {
  예식장: '#AAC7E1',
  스드메: '#7499BA',
  '예물·예단': '#CEE7FE',
  혼수: '#B8D4E8',
  신혼여행: '#9BB8D4',
};

// 카테고리별 아이콘 (32×32 SVG with built-in accent bg). 도넛/legend 색상은 별도로 카테고리 식별.
const CATEGORY_ICONS: Record<ResultCategory, string> = {
  예식장: '/icons/category/venue.svg',
  스드메: '/icons/category/sdm.svg',
  '예물·예단': '/icons/category/yedan.svg',
  혼수: '/icons/category/furniture.svg',
  신혼여행: '/icons/category/honeymoon.svg',
};

type ToggleLine = { label: string; price: number };

// 켜진 추가금 옵션을 그룹별로 추려 개별 항목으로 반환.
// stage5-budget의 sumActiveToggles와 동일한 단가표(TOGGLE_PRICES[지역][시즌])를 사용하므로
// 여기 개별 합 = 엔진의 그룹 합계와 정확히 일치한다.
function enabledToggleLines(
  result: ResultPayload,
  toggles: ToggleState,
  groups: ToggleGroup[],
): ToggleLine[] {
  const { region, season } = result.vars;
  const lines: ToggleLine[] = [];
  for (const meta of TOGGLES_META) {
    if (!toggles[meta.id]) continue;
    if (!groups.includes(meta.group)) continue;
    const price = TOGGLE_PRICES[meta.id]?.[region]?.[season] ?? 0;
    if (!price) continue;
    lines.push({ label: meta.label, price });
  }
  return lines;
}

export function TabItemized({ result, toggles }: Props) {
  const [expanded, setExpanded] = useState<Set<ResultCategory>>(new Set());

  const categories = Object.keys(result.budget.categories) as ResultCategory[];
  const donutData = categories.map((cat) => ({
    label: cat,
    value: result.budget.categories[cat],
    color: CATEGORY_COLORS[cat],
  }));

  function toggleExpanded(cat: ResultCategory) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-5 px-5 pb-6 pt-6">
      {/* 도넛 + 레전드 — 모바일 세로 / 데스크톱 가로 분할 */}
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-[rgba(170,199,225,0.4)] bg-white p-5 sm:flex-row sm:justify-center sm:gap-8">
        <DonutChart
          data={donutData}
          size={180}
          stroke={26}
          centerLabel="총 예산"
          centerValue={`${result.budget.total.toLocaleString()}만원`}
        />
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 self-stretch sm:flex sm:flex-col sm:gap-3 sm:self-auto sm:min-w-[200px]">
          {categories.map((cat) => (
            <div key={cat} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: CATEGORY_COLORS[cat] }}
              />
              <span className="text-xs text-[#525252]">{cat}</span>
              <span className="ml-auto text-xs font-semibold tabular-nums text-[#171717]">
                {Math.round((result.budget.categories[cat] / result.budget.total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 지출 항목들 */}
      <div className="flex flex-col gap-2">
        <h3 className="px-1 text-sm font-semibold text-[#373737]">지출 항목들</h3>
        {categories.map((cat) => {
          const amount = result.budget.categories[cat];
          const isOpen = expanded.has(cat);
          return (
            <div
              key={cat}
              className="overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white"
            >
              <button
                type="button"
                onClick={() => toggleExpanded(cat)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={CATEGORY_ICONS[cat]}
                    alt=""
                    aria-hidden
                    className="h-8 w-8 shrink-0"
                  />
                  <span className="text-base font-medium text-[#171717]">{cat}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold tabular-nums text-[#7499BA]">
                    {amount.toLocaleString()}만원
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden
                  >
                    <path d="M4 6L8 10L12 6" stroke="#A1A1A1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>
              {isOpen && (
                <div className="border-t border-[#F5F5F5] bg-[#FAFAFA] px-4 py-3">
                  <CategoryBreakdown category={cat} result={result} toggles={toggles} />
                </div>
              )}
            </div>
          );
        })}
        {/* 합계 */}
        <div className="mt-2 flex items-center justify-between rounded-2xl bg-[#373737] px-5 py-4">
          <span className="text-base font-semibold text-white">합계</span>
          <span className="text-lg font-bold tabular-nums text-white">
            {result.budget.total.toLocaleString()}만원
          </span>
        </div>
      </div>
    </div>
  );
}

// 한글 받침 검사 → 조사 'eun' (은/는) 또는 'i' (이/가)
function withJosa(word: string, subject: 'eun' | 'i' = 'eun'): string {
  const last = word[word.length - 1];
  const code = last.charCodeAt(0);
  if (code < 0xAC00 || code > 0xD7A3) return word + (subject === 'eun' ? '는' : '가');
  const jong = (code - 0xAC00) % 28;
  if (subject === 'eun') return word + (jong === 0 ? '는' : '은');
  return word + (jong === 0 ? '가' : '이');
}

function CategoryBreakdown({
  category,
  result,
  toggles,
}: {
  category: ResultCategory;
  result: ResultPayload;
  toggles: ToggleState;
}) {
  if (category === '예식장') {
    const v = result.budget.venueDetail;
    const venueOptions = enabledToggleLines(result, toggles, ['예식장']);
    const mealSub = v.minGuaranteeApplied
      ? `최소 보증인원 ${v.minGuarantee}명으로 계산됨 (실 하객 ${v.guests}명 × ${v.perHead}만원)`
      : `${v.guests.toLocaleString()}명 × ${v.perHead.toLocaleString()}만원`;
    return (
      <div className="flex flex-col gap-1 text-sm text-[#525252]">
        <Row k="식대" sub={mealSub} v={`${v.meal.toLocaleString()}만원`} />
        <Row
          k="대관"
          sub={v.rentalNote}
          v={`${v.daegwan.toLocaleString()}만원`}
          muted={v.daegwan === 0}
        />
        <Row
          k="기본 장식비"
          v={v.baseDecoration > 0 ? `${v.baseDecoration.toLocaleString()}만원` : '0만원 (포함)'}
          muted={v.baseDecoration === 0}
        />
        <Row
          k="본식 촬영"
          sub={result.vars.base.bonsik === 'pro' ? '외부 전문' : '예식장 연계'}
          v={`${v.bonsik.toLocaleString()}만원`}
        />
        {venueOptions.length > 0 && (
          <ToggleLineGroup label="추가한 옵션" lines={venueOptions} />
        )}
        <TotalRow v={`${result.budget.categories.예식장.toLocaleString()}만원`} />
      </div>
    );
  }
  if (category === '스드메') {
    const s = result.budget.sdmDetail;
    const base = result.vars.base;
    const studioOptions = enabledToggleLines(result, toggles, ['스튜디오']);
    const dressOptions = enabledToggleLines(result, toggles, ['드레스']);
    const makeupOptions = enabledToggleLines(result, toggles, ['메이크업']);
    return (
      <div className="flex flex-col gap-1 text-sm text-[#525252]">
        <p className="pb-2 text-xs text-[#A1A1A1]">
          지역 {result.vars.region} · {result.vars.season === 'peak' ? '성수기' : '비성수기'} 평균 단가 기준
        </p>
        <Row k="스튜디오 베이스" sub="앨범 + 액자 기본" v={`${s.studioBase.toLocaleString()}만원`} />
        {studioOptions.map((it) => (
          <Row key={it.label} k={it.label} v={`+${it.price.toLocaleString()}만원`} accent indent />
        ))}
        <Row
          k="드레스 베이스"
          sub={`${base.dress === '본식만' ? '본식만' : base.dress === '본식촬영' ? '본식+촬영' : '촬영만'}`}
          v={`${s.dressBase.toLocaleString()}만원`}
        />
        {dressOptions.map((it) => (
          <Row key={it.label} k={it.label} v={`+${it.price.toLocaleString()}만원`} accent indent />
        ))}
        <Row
          k="메이크업 베이스"
          sub={`${base.makeup} 등급`}
          v={`${s.makeupBase.toLocaleString()}만원`}
        />
        {makeupOptions.map((it) => (
          <Row key={it.label} k={it.label} v={`+${it.price.toLocaleString()}만원`} accent indent />
        ))}
        <TotalRow v={`${result.budget.categories.스드메.toLocaleString()}만원`} />
      </div>
    );
  }
  return (
    <p className="text-sm leading-6 text-[#525252]">
      {withJosa(category)} 유형 평균 추정값이에요. 향후 AI 맞춤 추천으로 정교화됩니다.
    </p>
  );
}

// 켜진 추가 옵션 개별 목록 (라벨 + 가격). "추가금 옵션 합" 뭉뚱그림 대신 항목별 노출.
function ToggleLineGroup({ label, lines }: { label: string; lines: ToggleLine[] }) {
  return (
    <>
      <p className="pt-1 text-xs font-medium text-[#7499BA]">{label}</p>
      {lines.map((it) => (
        <Row key={it.label} k={it.label} v={`+${it.price.toLocaleString()}만원`} accent indent />
      ))}
    </>
  );
}

function Row({
  k,
  sub,
  v,
  accent,
  muted,
  indent,
}: {
  k: string;
  sub?: string;
  v: string;
  accent?: boolean;
  muted?: boolean;
  indent?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-2 py-1 ${indent ? 'pl-3' : ''}`}>
      <div className="flex min-w-0 flex-col">
        <span className={muted ? 'text-[#A1A1A1]' : ''}>{k}</span>
        {sub && <span className="text-xs text-[#A1A1A1]">{sub}</span>}
      </div>
      <span
        className={`shrink-0 font-semibold tabular-nums ${
          accent ? 'text-[#7499BA]' : muted ? 'text-[#A1A1A1]' : 'text-[#171717]'
        }`}
      >
        {v}
      </span>
    </div>
  );
}

function TotalRow({ v }: { v: string }) {
  return (
    <div className="mt-2 flex items-center justify-between border-t border-[#E5E5E5] pt-2">
      <span className="text-sm font-semibold text-[#373737]">소계</span>
      <span className="text-base font-bold tabular-nums text-[#171717]">{v}</span>
    </div>
  );
}
