// STAGE 5 — 예산 계산 (v3 — 베뉴 타입별 식대·대관료 분기)
// 출처: docs/Result Page Calculation Algorithm v3 — Venue Type Dispatch.md
//
// v2 차이:
// - 식대 단가(perHead)·기본 장식비는 REGION_PROFILES 그대로 사용 (지역 차이 보존)
// - 보증인원·대관료는 VENUE_PROFILES 사용 (베뉴 타입별)
// - 식대 = perHead × max(사용자 선택 하객, 베뉴 최소 보증인원)
// - 사용자 하객 < 베뉴 보증 → minGuaranteeApplied=true로 UI sub-text 안내
// - 진단용 core(coreForDiagnosis)는 대관료 제외 → 기존 밴드 안정

import type {
  SetupVars,
  ToggleState,
  BudgetResult,
  VenueBreakdown,
  ResultCategory,
  VenueType,
} from '../types';
import { REGION_PROFILES } from '../data/region-profiles';
import { CATEGORY_BASE } from '../data/category-base';
import { TOGGLE_PRICES } from '../data/toggle-prices';
import { TOGGLES_META } from '../data/toggles-meta';
import { TYPE_CONFIGS } from '../data/type-config';
import { VENUE_PROFILES } from '../data/venue-profiles';

// 식대 — 베뉴 타입 최소 보증인원 + 지역 식대 단가
function calcVenueMeal(vars: SetupVars, venueType: VenueType) {
  const region = REGION_PROFILES[vars.region][vars.season];
  const venue = VENUE_PROFILES[venueType];
  const billableGuests = Math.max(vars.guests, venue.guarantee);
  const minGuaranteeApplied = vars.guests < venue.guarantee;
  const meal = billableGuests * region.perHead;
  return {
    meal,
    billableGuests,
    minGuaranteeApplied,
    minGuarantee: venue.guarantee,
    perHead: region.perHead,
    rental: venue.rentalFee,
    rentalNote: venue.rentalNote,
    rentalIsEstimate: venue.isEstimate,
  };
}

// 토글 ON된 항목 가격을 카테고리별·그룹별로 합산
function sumActiveToggles(vars: SetupVars, toggles: ToggleState) {
  const byGroup = { 스튜디오: 0, 드레스: 0, 메이크업: 0, 예식장: 0 };
  for (const meta of TOGGLES_META) {
    if (!toggles[meta.id]) continue;
    const price = TOGGLE_PRICES[meta.id]?.[vars.region]?.[vars.season] ?? 0;
    if (!price) continue;
    byGroup[meta.group] += price;
  }
  return {
    byGroup,
    스드메: byGroup.스튜디오 + byGroup.드레스 + byGroup.메이크업,
    예식장: byGroup.예식장,
    total: byGroup.스튜디오 + byGroup.드레스 + byGroup.메이크업 + byGroup.예식장,
  };
}

export function calculateBudget(
  vars: SetupVars,
  toggles: ToggleState,
  venueType: VenueType,
): BudgetResult {
  const profile = REGION_PROFILES[vars.region][vars.season];
  const base = CATEGORY_BASE[vars.region][vars.season];
  const config = TYPE_CONFIGS[vars.persona];

  // 예식장 계산 (v3 베뉴 분기)
  const venueMeal = calcVenueMeal(vars, venueType);
  const toggleSums = sumActiveToggles(vars, toggles);

  const venueDetail: VenueBreakdown = {
    meal: venueMeal.meal,
    daegwan: venueMeal.rental,
    baseDecoration: profile.baseDecoration,
    bonsik: config.base.bonsikPrice,
    toggleAddOns: toggleSums.예식장,
    venueType,
    guests: vars.guests,
    billableGuests: venueMeal.billableGuests,
    minGuarantee: venueMeal.minGuarantee,
    minGuaranteeApplied: venueMeal.minGuaranteeApplied,
    perHead: venueMeal.perHead,
    rentalNote: venueMeal.rentalNote,
    rentalIsEstimate: venueMeal.rentalIsEstimate,
  };

  const venueWithoutRental =
    venueDetail.meal +
    venueDetail.baseDecoration +
    venueDetail.bonsik +
    venueDetail.toggleAddOns;
  const venueTotal = venueWithoutRental + venueDetail.daegwan;

  // 스드메 — 베이스 + 토글
  const dressBase = base.dress[config.base.dress];
  const makeupBase = base.makeup[config.base.makeup];
  const studioBase = base.studio;
  const sdmTotal =
    studioBase +
    dressBase +
    makeupBase +
    toggleSums.byGroup.스튜디오 +
    toggleSums.byGroup.드레스 +
    toggleSums.byGroup.메이크업;

  const sdmDetail = {
    studioBase,
    dressBase,
    makeupBase,
    studioToggles: toggleSums.byGroup.스튜디오,
    dressToggles: toggleSums.byGroup.드레스,
    makeupToggles: toggleSums.byGroup.메이크업,
  };

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

  const core = venueTotal + sdmTotal;                       // 표시용 (대관료 포함)
  const coreForDiagnosis = venueWithoutRental + sdmTotal;   // 진단용 (대관료 제외, Phase 1 밴드 안정)
  const total = core + yemul + honsu + honeymoon;
  const toggleDelta = toggleSums.total;

  return {
    categories,
    core,
    coreForDiagnosis,
    total,
    toggleDelta,
    venueDetail,
    sdmDetail,
  };
}
