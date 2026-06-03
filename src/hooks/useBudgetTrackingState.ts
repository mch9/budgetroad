'use client';

import { useEffect, useState } from 'react';
import { diagnose, TOGGLES_META, TOGGLE_PRICES } from '@/lib/budget-engine';
import type { ResultPayload, ToggleState } from '@/lib/budget-engine';
import type { OnboardingAnswers } from '@/lib/onboarding-v6';

const SESSION_KEY = 'budgetroad_manage_session';
const ACTUAL_KEY = 'budgetroad_budget_actual';

export type BudgetItem = {
  id: string;
  name: string;
  category: string;
  filterCategory: 'venue' | 'studio' | 'other';
  estimatedAmount: number; // 만원
};

export type ActualAmounts = Record<string, number | undefined>;

type SessionData = {
  answers: OnboardingAnswers;
  toggles: ToggleState;
};

function buildItems(result: ResultPayload, toggles: ToggleState): BudgetItem[] {
  const { venueDetail, sdmDetail } = result.budget;
  const { region, season } = result.vars;
  const items: BudgetItem[] = [];

  // 예식장
  items.push({ id: 'meal', name: '식대', category: '예식장', filterCategory: 'venue', estimatedAmount: venueDetail.meal });
  if (venueDetail.daegwan > 0) {
    items.push({ id: 'daegwan', name: '대관료', category: '예식장', filterCategory: 'venue', estimatedAmount: venueDetail.daegwan });
  }
  if (venueDetail.baseDecoration > 0) {
    items.push({ id: 'decoration', name: '기본 장식비', category: '예식장', filterCategory: 'venue', estimatedAmount: venueDetail.baseDecoration });
  }
  items.push({ id: 'bonsik', name: '본식 촬영', category: '예식장', filterCategory: 'venue', estimatedAmount: venueDetail.bonsik });
  for (const meta of TOGGLES_META) {
    if (meta.group !== '예식장' || !toggles[meta.id]) continue;
    const price = TOGGLE_PRICES[meta.id]?.[region]?.[season] ?? 0;
    if (price) items.push({ id: meta.id, name: meta.label, category: '예식장', filterCategory: 'venue', estimatedAmount: price });
  }

  // 스드메
  items.push({ id: 'studio-base', name: '스튜디오 기본', category: '스드메', filterCategory: 'studio', estimatedAmount: sdmDetail.studioBase });
  for (const meta of TOGGLES_META) {
    if (meta.group !== '스튜디오' || !toggles[meta.id]) continue;
    const price = TOGGLE_PRICES[meta.id]?.[region]?.[season] ?? 0;
    if (price) items.push({ id: meta.id, name: meta.label, category: '스드메', filterCategory: 'studio', estimatedAmount: price });
  }
  items.push({ id: 'dress-base', name: '드레스 기본', category: '스드메', filterCategory: 'studio', estimatedAmount: sdmDetail.dressBase });
  for (const meta of TOGGLES_META) {
    if (meta.group !== '드레스' || !toggles[meta.id]) continue;
    const price = TOGGLE_PRICES[meta.id]?.[region]?.[season] ?? 0;
    if (price) items.push({ id: meta.id, name: meta.label, category: '스드메', filterCategory: 'studio', estimatedAmount: price });
  }
  items.push({ id: 'makeup-base', name: '메이크업 기본', category: '스드메', filterCategory: 'studio', estimatedAmount: sdmDetail.makeupBase });
  for (const meta of TOGGLES_META) {
    if (meta.group !== '메이크업' || !toggles[meta.id]) continue;
    const price = TOGGLE_PRICES[meta.id]?.[region]?.[season] ?? 0;
    if (price) items.push({ id: meta.id, name: meta.label, category: '스드메', filterCategory: 'studio', estimatedAmount: price });
  }

  // 기타
  items.push({ id: 'gift', name: '예물·예단', category: '예물·예단', filterCategory: 'other', estimatedAmount: result.budget.categories['예물·예단'] });
  items.push({ id: 'furnish', name: '혼수', category: '혼수', filterCategory: 'other', estimatedAmount: result.budget.categories['혼수'] });
  items.push({ id: 'honeymoon', name: '신혼여행', category: '신혼여행', filterCategory: 'other', estimatedAmount: result.budget.categories['신혼여행'] });

  return items;
}

export function useBudgetTrackingState() {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [actual, setActual] = useState<ActualAmounts>({});
  const [session, setSession] = useState<SessionData | null>(null);

  useEffect(() => {
    try {
      const sessionRaw = localStorage.getItem(SESSION_KEY);
      if (sessionRaw) {
        const parsed = JSON.parse(sessionRaw) as SessionData;
        const result = diagnose(parsed.answers, parsed.toggles);
        setItems(buildItems(result, parsed.toggles));
        setSession(parsed);
      }
      const actualRaw = localStorage.getItem(ACTUAL_KEY);
      if (actualRaw) setActual(JSON.parse(actualRaw) as ActualAmounts);
    } catch {
      /* ignore */
    }
  }, []);

  function setActualAmount(itemId: string, amount: number | undefined) {
    setActual((prev) => {
      const next = { ...prev, [itemId]: amount };
      try {
        localStorage.setItem(ACTUAL_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const totalEstimated = items.reduce((s, i) => s + i.estimatedAmount, 0);
  const totalActual = items.reduce((s, i) => s + (actual[i.id] ?? 0), 0);

  return {
    items,
    actual,
    setActualAmount,
    totalEstimated,
    totalActual,
    answers: session?.answers ?? null,
    toggles: session?.toggles ?? null,
    hasSession: session !== null,
  };
}

/** 결과 페이지에서 /manage로 이동 전 세션 저장 */
export function saveSession(answers: OnboardingAnswers, toggles: ToggleState) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ answers, toggles }));
  } catch {
    /* ignore */
  }
}
