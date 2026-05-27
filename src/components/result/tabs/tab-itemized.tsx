'use client';

import { useState } from 'react';
import type { ResultPayload, ResultCategory } from '@/lib/budget-engine';
import { DonutChart } from '../charts/donut-chart';

type Props = { result: ResultPayload };

// 디자인 시스템 액센트 톤
const CATEGORY_COLORS: Record<ResultCategory, string> = {
  예식장: '#AAC7E1',
  스드메: '#7499BA',
  '예물·예단': '#CEE7FE',
  혼수: '#B8D4E8',
  신혼여행: '#9BB8D4',
};

export function TabItemized({ result }: Props) {
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
      {/* 도넛 + 레전드 */}
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-[rgba(170,199,225,0.4)] bg-white p-5">
        <DonutChart
          data={donutData}
          size={180}
          stroke={26}
          centerLabel="총 예산"
          centerValue={`${result.budget.total.toLocaleString()}만원`}
        />
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 self-stretch">
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
                  <span
                    className="h-8 w-8 shrink-0 rounded-lg"
                    style={{ backgroundColor: CATEGORY_COLORS[cat], opacity: 0.3 }}
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
                  <CategoryBreakdown category={cat} result={result} />
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

function CategoryBreakdown({ category, result }: { category: ResultCategory; result: ResultPayload }) {
  if (category === '예식장') {
    const v = result.budget.venueDetail;
    return (
      <div className="flex flex-col gap-1 text-xs text-[#525252]">
        <Row k="식대" v={`${v.meal.toLocaleString()}만원`} />
        {v.daegwan > 0 && <Row k="대관 (보증 미달)" v={`${v.daegwan.toLocaleString()}만원`} />}
        {v.baseDecoration > 0 && (
          <Row k="기본 장식비" v={`${v.baseDecoration.toLocaleString()}만원`} />
        )}
        <Row k="본식 촬영" v={`${v.bonsik.toLocaleString()}만원`} />
        {v.toggleAddOns > 0 && (
          <Row k="추가금 옵션" v={`+${v.toggleAddOns.toLocaleString()}만원`} />
        )}
      </div>
    );
  }
  if (category === '스드메') {
    return (
      <p className="text-xs text-[#525252]">
        지역 {result.vars.region} · {result.vars.season === 'peak' ? '성수기' : '비성수기'}{' '}
        시세 기준. 스튜디오·드레스·메이크업 베이스 + 활성 추가금이 합산됩니다.
      </p>
    );
  }
  return (
    <p className="text-xs text-[#525252]">
      {category}은(는) 유형 평균 추정값이에요. 향후 AI 맞춤 추천으로 정교화됩니다.
    </p>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span>{k}</span>
      <span className="font-semibold tabular-nums text-[#171717]">{v}</span>
    </div>
  );
}
