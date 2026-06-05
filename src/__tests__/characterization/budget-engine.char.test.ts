import { describe, it, expect } from 'vitest';
import { diagnose, TOGGLES_META, TOGGLE_PRICES } from '@/lib/budget-engine';
import type { ToggleState } from '@/lib/budget-engine';
import type { OnboardingAnswers } from '@/lib/onboarding-v6';

// ── helpers ──────────────────────────────────────────────────────────────────

function makeAnswers(overrides: Partial<OnboardingAnswers> = {}): OnboardingAnswers {
  return {
    // 가치관 질문 (2축 점수에 영향)
    Q1: 'A', Q2: 'A', Q3: 'A', Q4: 'A', Q7: 'A', Q8: 'A',
    // 태그 질문
    T2: 'A', T5: 'A', T7: 'A',
    // Modifier (실측 입력): 기본값 = 서울/성수기/3500~5000만/150~300명
    M1: 'C', M2: 'C', M3: 'B', M4: 'A', M5: 'A',
    ...overrides,
  };
}

function allTogglesOff(): ToggleState {
  return Object.fromEntries(TOGGLES_META.map((m) => [m.id, false])) as ToggleState;
}

function allTogglesOn(): ToggleState {
  return Object.fromEntries(TOGGLES_META.map((m) => [m.id, true])) as ToggleState;
}

// tab-itemized의 enabledToggleLines와 동일한 계산 (비공개 함수이므로 여기서 재현해 동작 고정)
function computeToggleLines(
  result: ReturnType<typeof diagnose>,
  toggles: ToggleState,
  groups: string[],
): { label: string; price: number }[] {
  const { region, season } = result.vars;
  return TOGGLES_META.filter((m) => toggles[m.id] && groups.includes(m.group))
    .map((m) => ({
      label: m.label,
      price: (TOGGLE_PRICES[m.id]?.[region]?.[season] ?? 0) * (m.priceMultiplier ?? 1),
    }))
    .filter((l) => l.price > 0);
}

// ── 1. diagnose() 출력 고정 ───────────────────────────────────────────────────

describe('diagnose — 서울/성수기', () => {
  const answers = makeAnswers({ M5: 'A', M4: 'A' });
  const result = diagnose(answers);

  it('region=서울, season=peak', () => {
    expect(result.vars.region).toBe('서울');
    expect(result.vars.season).toBe('peak');
  });

  it('persona snapshot', () => {
    expect(result.vars.persona).toMatchSnapshot();
  });

  it('budget.total snapshot', () => {
    expect(result.budget.total).toMatchSnapshot();
  });

  it('budget.categories snapshot', () => {
    expect(result.budget.categories).toMatchSnapshot();
  });

  it('toggleDefaults snapshot', () => {
    expect(result.vars.toggleDefaults).toMatchSnapshot();
  });

  it('venueDetail snapshot', () => {
    expect(result.budget.venueDetail).toMatchSnapshot();
  });

  it('sdmDetail snapshot', () => {
    expect(result.budget.sdmDetail).toMatchSnapshot();
  });
});

describe('diagnose — 지방/비성수기/소예산', () => {
  const answers = makeAnswers({ M5: 'D', M4: 'B', M1: 'B', M2: 'B' });
  const result = diagnose(answers);

  it('region=이외, season=offPeak', () => {
    expect(result.vars.region).toBe('이외');
    expect(result.vars.season).toBe('offPeak');
  });

  it('budget.total snapshot', () => {
    expect(result.budget.total).toMatchSnapshot();
  });

  it('budget.categories snapshot', () => {
    expect(result.budget.categories).toMatchSnapshot();
  });
});

describe('diagnose — 서울/성수기/toggles all ON', () => {
  const answers = makeAnswers({ M5: 'A', M4: 'A' });
  const togglesOn = allTogglesOn();
  const resultOn = diagnose(answers, togglesOn);
  const resultOff = diagnose(answers, allTogglesOff());

  it('total with all toggles > total without toggles', () => {
    expect(resultOn.budget.total).toBeGreaterThan(resultOff.budget.total);
  });

  it('budget.categories with all toggles snapshot', () => {
    expect(resultOn.budget.categories).toMatchSnapshot();
  });

  it('budget.total with all toggles snapshot', () => {
    expect(resultOn.budget.total).toMatchSnapshot();
  });
});

// ── 2. enabledToggleLines 동작 고정 (tab-itemized 비공개 함수 — 동일 계산 재현) ──

describe('enabledToggleLines equivalent — 서울/성수기', () => {
  const answers = makeAnswers({ M5: 'A', M4: 'A' });
  const result = diagnose(answers);
  const togglesAllOn = allTogglesOn();

  it('예식장 그룹 toggle lines snapshot', () => {
    expect(computeToggleLines(result, togglesAllOn, ['예식장'])).toMatchSnapshot();
  });

  it('스튜디오 그룹 toggle lines snapshot', () => {
    expect(computeToggleLines(result, togglesAllOn, ['스튜디오'])).toMatchSnapshot();
  });

  it('드레스 그룹 toggle lines snapshot', () => {
    expect(computeToggleLines(result, togglesAllOn, ['드레스'])).toMatchSnapshot();
  });

  it('no lines when all toggles off', () => {
    const lines = computeToggleLines(result, allTogglesOff(), ['예식장', '스튜디오', '드레스']);
    expect(lines).toHaveLength(0);
  });

  it('single toggle "원본 구매" ON → 1 line with correct price', () => {
    const toggles = { ...allTogglesOff(), '원본 구매': true };
    const lines = computeToggleLines(result, toggles as ToggleState, ['스튜디오']);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchSnapshot();
  });
});

// ── 3. buildItems가 직접 읽는 TOGGLE_PRICES 데이터 안정성 ─────────────────────

describe('TOGGLE_PRICES data stability — buildItems/enabledToggleLines 공통 입력', () => {
  it('서울/peak 전체 가격표 snapshot', () => {
    const prices: Record<string, number> = {};
    for (const meta of TOGGLES_META) {
      const p = (TOGGLE_PRICES[meta.id]?.['서울']?.['peak'] ?? 0) * (meta.priceMultiplier ?? 1);
      if (p) prices[meta.id] = p;
    }
    expect(prices).toMatchSnapshot();
  });

  it('이외/offPeak 전체 가격표 snapshot', () => {
    const prices: Record<string, number> = {};
    for (const meta of TOGGLES_META) {
      const p = (TOGGLE_PRICES[meta.id]?.['이외']?.['offPeak'] ?? 0) * (meta.priceMultiplier ?? 1);
      if (p) prices[meta.id] = p;
    }
    expect(prices).toMatchSnapshot();
  });
});
