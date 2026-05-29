// 결과 페이지 계산 엔진 — entry
// 출처: docs/Result Page Calculation Algorithm.md (v2)
// 결정론적 순수 함수. 같은 입력 → 같은 결과.

import { classifyPersona, scoreAxis } from '../onboarding-v6';
import type { OnboardingAnswers } from '../onboarding-v6';
import type { ResultPayload, ToggleState } from './types';
import { setupVars } from './stages/stage3-variables';
import { recommendVenue } from './stages/stage4-venue';
import { calculateBudget } from './stages/stage5-budget';
import { diagnoseConsistency } from './stages/stage6-consistency';
import { buildAdvice } from './stages/stage7-advice';

/**
 * 응답 + (선택)토글 상태 → 결과 페이지에 필요한 모든 데이터 산출.
 * toggles 미전달 시 유형별 디폴트 사용 (setupVars가 채워줌).
 */
export function diagnose(
  answers: OnboardingAnswers,
  toggles?: ToggleState
): ResultPayload {
  const axis = scoreAxis(answers);
  const persona = classifyPersona(axis);
  const vars = setupVars(persona, answers);
  const activeToggles = toggles ?? vars.toggleDefaults;

  const venue = recommendVenue(vars, answers);
  const budget = calculateBudget(vars, activeToggles, venue.venueType);
  const consistency = diagnoseConsistency(vars, budget);
  const advice = buildAdvice(vars, budget, consistency, activeToggles);

  return { vars, venue, budget, consistency, advice };
}

export type * from './types';
export { TYPE_CONFIGS } from './data/type-config';
export { TOGGLES_META, TOGGLES_BY_ID } from './data/toggles-meta';
export { REGION_PROFILES } from './data/region-profiles';
export { CATEGORY_BASE } from './data/category-base';
export { TOGGLE_PRICES } from './data/toggle-prices';
export { VENUE_PROFILES, mapRecommendationToVenueType } from './data/venue-profiles';
