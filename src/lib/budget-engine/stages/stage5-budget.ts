// STAGE 5 — 예산 계산
// 식대 보증인원 공식 + 카테고리별 합산
// 출처: docs/Result Page Calculation Algorithm.md STAGE 5

import type {
  SetupVars,
  ToggleState,
  BudgetResult,
  VenueBreakdown,
  ResultCategory,
} from '../types';
import { REGION_PROFILES } from '../data/region-profiles';
import { CATEGORY_BASE } from '../data/category-base';
import { TOGGLE_PRICES } from '../data/toggle-prices';
import { TOGGLES_META } from '../data/toggles-meta';
import { TYPE_CONFIGS } from '../data/type-config';

// 식대 — 보증인원 방식
function calcMeal(vars: SetupVars): { meal: number; daegwan: number; belowBojeung: boolean } {
  const profile = REGION_PROFILES[vars.region][vars.season];
  if (vars.guests >= profile.bojeung) {
    return {
      meal: vars.guests * profile.perHead,
      daegwan: 0,
      belowBojeung: false,
    };
  }
  return {
    meal: profile.baseMeal,
    daegwan: profile.daegwan,
    belowBojeung: true,
  };
}

// 토글 ON된 항목 가격을 카테고리별로 합산
function sumActiveTogglesByCategory(
  vars: SetupVars,
  toggles: ToggleState
): { 스드메: number; 예식장: number; total: number } {
  let sdm = 0;
  let venue = 0;
  for (const meta of TOGGLES_META) {
    if (!toggles[meta.id]) continue;
    const priceData = TOGGLE_PRICES[meta.id]?.[vars.region]?.[vars.season];
    const price = priceData ?? 0;
    if (price === null || price === undefined) continue;
    if (meta.gainCategory === '스드메') sdm += price;
    else venue += price;
  }
  return { 스드메: sdm, 예식장: venue, total: sdm + venue };
}

export function calculateBudget(vars: SetupVars, toggles: ToggleState): BudgetResult {
  const profile = REGION_PROFILES[vars.region][vars.season];
  const base = CATEGORY_BASE[vars.region][vars.season];
  const config = TYPE_CONFIGS[vars.persona];

  // 예식장 계산
  const mealCalc = calcMeal(vars);
  const toggleSums = sumActiveTogglesByCategory(vars, toggles);

  const venueDetail: VenueBreakdown = {
    meal: mealCalc.meal,
    daegwan: mealCalc.daegwan,
    baseDecoration: profile.baseDecoration,
    bonsik: config.base.bonsikPrice,
    toggleAddOns: toggleSums.예식장,
    belowBojeung: mealCalc.belowBojeung,
  };

  const venueTotal =
    venueDetail.meal +
    venueDetail.daegwan +
    venueDetail.baseDecoration +
    venueDetail.bonsik +
    venueDetail.toggleAddOns;

  // 스드메 계산 — 베이스 + 토글
  const dressBase = base.dress[config.base.dress];
  const makeupBase = base.makeup[config.base.makeup];
  const sdmTotal = base.studio + dressBase + makeupBase + toggleSums.스드메;

  // 기타 — 유형별 추정값
  const yemul = config.etc.yemul;
  const honsu = config.etc.honsu;
  const honeymoon = config.etc.honeymoon;

  const categories: Record<ResultCategory, number> = {
    예식장: venueTotal,
    스드메: sdmTotal,
    '예물·예단': yemul,
    혼수: honsu,
    신혼여행: honeymoon,
  };

  const core = venueTotal + sdmTotal;
  const total = core + yemul + honsu + honeymoon;
  const toggleDelta = toggleSums.total;

  return {
    categories,
    core,
    total,
    toggleDelta,
    venueDetail,
  };
}
