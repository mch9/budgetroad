// STAGE 6 — 정합성 진단 (말한 유형 vs 나온 숫자)
// 출처: docs/Result Page Calculation Algorithm.md STAGE 6

import type { SetupVars, BudgetResult, ConsistencyDiagnosis } from '../types';
import { TYPE_CONFIGS } from '../data/type-config';

export function diagnoseConsistency(
  vars: SetupVars,
  budget: BudgetResult
): ConsistencyDiagnosis {
  const config = TYPE_CONFIGS[vars.persona];
  const band = config.band;

  // 본질미니멀 + 하객 < 보증인원 → WARN (스몰 베뉴 추천 유도)
  if (vars.persona === '본질미니멀' && budget.venueDetail.belowBojeung) {
    return {
      status: 'WARN',
      headline: '미니멀 지향과 웨딩홀 구조가 안 맞아요',
      body: `하객이 ${vars.guests}명인데 보증인원을 채워야 해 기본 식대와 대관이 그대로 발생해요. 추천한 스몰 베뉴로 가야 진짜 미니멀 예산이 됩니다.`,
      band,
    };
  }

  if (budget.core > band.max) {
    return {
      status: 'OVER',
      headline: `${vars.persona} 유형 평균보다 다소 높아요`,
      body: `현재 core 예산이 ${budget.core.toLocaleString()}만원으로 권장 상한(${band.max.toLocaleString()}만원)을 넘어요. OFF-TYPE 항목을 해제하면 절감할 수 있어요.`,
      band,
    };
  }

  if (budget.core < band.min) {
    return {
      status: 'UNDER',
      headline: `${vars.persona} 유형 평균보다 여유 있어요`,
      body: `core 예산이 ${budget.core.toLocaleString()}만원으로 권장 하한(${band.min.toLocaleString()}만원) 아래예요. 우선순위 항목에 더 투자할 여유가 있어요.`,
      band,
    };
  }

  return {
    status: 'FIT',
    headline: `${vars.persona} 유형에 잘 맞아요`,
    body: `core 예산 ${budget.core.toLocaleString()}만원이 권장 밴드(${band.min.toLocaleString()}~${band.max.toLocaleString()}만원) 안에 들어와요.`,
    band,
  };
}
