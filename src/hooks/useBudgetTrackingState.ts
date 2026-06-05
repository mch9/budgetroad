'use client';

import { useEffect, useState } from 'react';
import { diagnose, TOGGLES_META, TOGGLE_PRICES } from '@/lib/budget-engine';
import type { ResultPayload, ToggleState } from '@/lib/budget-engine';
import type { OnboardingAnswers } from '@/lib/onboarding-v6';
import { scoreAxis, classifyPersona } from '@/lib/onboarding-v6';
import type { PersonaType, AxisScore } from '@/lib/onboarding-v6';

const SESSION_KEY = 'budgetroad_manage_session';
const ACTUAL_KEY = 'budgetroad_budget_actual';
const CUSTOM_KEY = 'budgetroad_custom_items';
const DELETED_KEY = 'budgetroad_deleted_items';

export function filterCategoryToLabel(
  fc: 'venue' | 'studio' | 'dress' | 'makeup' | 'other',
): string {
  if (fc === 'venue') return '예식장';
  if (fc === 'other') return '기타';
  return '스드메';
}

export type BudgetItem = {
  id: string;
  name: string;
  category: string;
  filterCategory: 'venue' | 'studio' | 'dress' | 'makeup' | 'other';
  estimatedAmount: number; // 만원
  custom?: boolean; // 직접 추가한 항목 (예상 금액 없음)
};

type StoredCustomItem = {
  id: string;
  name: string;
  filterCategory: 'venue' | 'studio' | 'dress' | 'makeup' | 'other';
  amount: number; // 만원
};

export type ActualAmounts = Record<string, number | undefined>;

type SessionData = {
  answers: OnboardingAnswers;
  toggles: ToggleState;
  persona?: PersonaType;
  axisScore?: AxisScore;
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
    const rawPrice = TOGGLE_PRICES[meta.id]?.[region]?.[season] ?? 0;
    const price = rawPrice * (meta.priceMultiplier ?? 1);
    if (price) items.push({ id: meta.id, name: meta.label, category: '예식장', filterCategory: 'venue', estimatedAmount: price });
  }

  // 스드메
  items.push({ id: 'studio-base', name: '스튜디오 기본', category: '스드메', filterCategory: 'studio', estimatedAmount: sdmDetail.studioBase });
  for (const meta of TOGGLES_META) {
    if (meta.group !== '스튜디오' || !toggles[meta.id]) continue;
    const rawPrice = TOGGLE_PRICES[meta.id]?.[region]?.[season] ?? 0;
    const price = rawPrice * (meta.priceMultiplier ?? 1);
    if (price) items.push({ id: meta.id, name: meta.label, category: '스드메', filterCategory: 'studio', estimatedAmount: price });
  }
  items.push({ id: 'dress-base', name: '드레스 기본', category: '스드메', filterCategory: 'dress', estimatedAmount: sdmDetail.dressBase });
  for (const meta of TOGGLES_META) {
    if (meta.group !== '드레스' || !toggles[meta.id]) continue;
    const rawPrice = TOGGLE_PRICES[meta.id]?.[region]?.[season] ?? 0;
    const price = rawPrice * (meta.priceMultiplier ?? 1);
    if (price) items.push({ id: meta.id, name: meta.label, category: '스드메', filterCategory: 'dress', estimatedAmount: price });
  }
  items.push({ id: 'makeup-base', name: '메이크업 기본', category: '스드메', filterCategory: 'makeup', estimatedAmount: sdmDetail.makeupBase });

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
        const presetItems = buildItems(result, parsed.toggles);

        const deletedRaw = localStorage.getItem(DELETED_KEY);
        const deletedIds = new Set<string>(deletedRaw ? (JSON.parse(deletedRaw) as string[]) : []);
        const filteredPresets = presetItems.filter((item) => !deletedIds.has(item.id));

        const customRaw = localStorage.getItem(CUSTOM_KEY);
        const customs: StoredCustomItem[] = customRaw ? (JSON.parse(customRaw) as StoredCustomItem[]) : [];
        const customItems: BudgetItem[] = customs.map((c) => ({
          id: c.id,
          name: c.name,
          category: filterCategoryToLabel(c.filterCategory),
          filterCategory: c.filterCategory,
          estimatedAmount: 0,
          custom: true,
        }));

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems([...filteredPresets, ...customItems]);
        setSession(parsed);
        // 옛 세션에 persona 없으면 한 번 계산해 저장 (이후 복원 시 재계산 불필요)
        if (!parsed.persona) saveSession(parsed.answers, parsed.toggles);
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

  function removeItem(itemId: string) {
    const isCustom = items.find((i) => i.id === itemId)?.custom ?? false;
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    setActual((prev) => {
      const next = { ...prev };
      delete next[itemId];
      try { localStorage.setItem(ACTUAL_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
    if (isCustom) {
      try {
        const raw = localStorage.getItem(CUSTOM_KEY);
        const customs: StoredCustomItem[] = raw ? (JSON.parse(raw) as StoredCustomItem[]) : [];
        localStorage.setItem(CUSTOM_KEY, JSON.stringify(customs.filter((c) => c.id !== itemId)));
      } catch { /* ignore */ }
    } else {
      try {
        const raw = localStorage.getItem(DELETED_KEY);
        const deleted: string[] = raw ? (JSON.parse(raw) as string[]) : [];
        if (!deleted.includes(itemId)) {
          deleted.push(itemId);
          localStorage.setItem(DELETED_KEY, JSON.stringify(deleted));
        }
      } catch { /* ignore */ }
    }
  }

  function addCustomItem(name: string, filterCategory: 'venue' | 'studio' | 'dress' | 'makeup' | 'other', amount: number) {
    const id = `custom-${Date.now()}`;
    const newItem: BudgetItem = {
      id, name,
      category: filterCategory === 'venue' ? '예식장' : filterCategory === 'other' ? '기타' : '스드메',
      filterCategory,
      estimatedAmount: 0,
      custom: true,
    };
    setItems((prev) => [...prev, newItem]);
    setActual((prev) => {
      const next = { ...prev, [id]: amount };
      try { localStorage.setItem(ACTUAL_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
    try {
      const customRaw = localStorage.getItem(CUSTOM_KEY);
      const customs: StoredCustomItem[] = customRaw ? (JSON.parse(customRaw) as StoredCustomItem[]) : [];
      customs.push({ id, name, filterCategory, amount });
      localStorage.setItem(CUSTOM_KEY, JSON.stringify(customs));
    } catch { /* ignore */ }
  }

  const totalEstimated = items.filter((i) => !i.custom).reduce((s, i) => s + i.estimatedAmount, 0);
  const totalActual = items.reduce((s, i) => s + (actual[i.id] ?? 0), 0);

  return {
    items,
    actual,
    setActualAmount,
    removeItem,
    totalEstimated,
    totalActual,
    answers: session?.answers ?? null,
    toggles: session?.toggles ?? null,
    hasSession: session !== null,
    addCustomItem,
  };
}

/** 결과 페이지에서 /manage로 이동 전 세션 저장 */
export function saveSession(
  answers: OnboardingAnswers,
  toggles: ToggleState,
  persona?: PersonaType,
  axisScore?: AxisScore,
) {
  try {
    const ax = axisScore ?? scoreAxis(answers);
    const p = persona ?? classifyPersona(ax);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ answers, toggles, persona: p, axisScore: ax }));
  } catch {
    /* ignore */
  }
}
