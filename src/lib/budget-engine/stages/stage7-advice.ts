// STAGE 7 — 동적 조언 생성 (세이브 + 투자)
// 출처: docs/Result Page Calculation Algorithm.md STAGE 7

import type {
  SetupVars,
  BudgetResult,
  ConsistencyDiagnosis,
  ToggleState,
  Advice,
  AdviceItem,
} from '../types';
import { TYPE_CONFIGS } from '../data/type-config';
import { TOGGLES_META } from '../data/toggles-meta';
import { TOGGLE_PRICES } from '../data/toggle-prices';

// 유형별 투자 가이드 (handoff §STAGE 7)
const INVEST_BY_TYPE: Record<string, AdviceItem[]> = {
  전통격식: [
    { title: '식사 퀄리티 유지', desc: '하객 만족도가 가장 크게 좌우되는 요소예요.' },
    { title: '혼주·폐백 격식', desc: '양가가 함께 신경 쓰는 부분에 무게를 둬요.' },
  ],
  표준실용: [
    { title: '핵심 패키지 방어', desc: '스드메 기본 등급은 유지하는 게 결과 만족도가 좋아요.' },
    { title: '접근성 좋은 식장', desc: '하객 이동·주차가 편한 곳이 만족도에 직결돼요.' },
  ],
  경험연출: [
    { title: '스드메 + 본식 촬영', desc: '오래 남는 결과물이라 우선순위 1순위로 두는 게 좋아요.' },
    { title: '우선순위 3가지 명확화', desc: '드레스·촬영·연출 중 가장 중요한 3가지에 집중하세요.' },
  ],
  본질미니멀: [
    { title: '신혼집·자산 안정', desc: '결혼식보다 이후 생활에 무게를 두는 게 합리적이에요.' },
    { title: '올인원 패키지', desc: '항목별 흥정 대신 패키지 명확한 곳이 시간·돈을 아껴요.' },
  ],
  탐색미결정: [
    { title: '우선순위 정하기 먼저', desc: '꼭 지킬 것 2가지, 줄여도 될 것 2가지를 정해보세요.' },
    { title: '플래너 1:1 상담', desc: '전문가와 가볍게 상담받아 방향을 잡아보세요.' },
  ],
};

export function buildAdvice(
  vars: SetupVars,
  budget: BudgetResult,
  consistency: ConsistencyDiagnosis,
  toggles: ToggleState
): Advice {
  const config = TYPE_CONFIGS[vars.persona];
  const save: AdviceItem[] = [];

  // WARN 케이스 — 스몰 베뉴 변경 권유
  if (consistency.status === 'WARN') {
    const venueDelta = budget.venueDetail.daegwan + Math.max(0, budget.venueDetail.meal - vars.guests * 7);
    save.push({
      title: '추천한 스몰 베뉴로 변경',
      desc: `현재 보증인원 미달로 식대·대관 부담이 커요. 스몰 베뉴로 가면 약 ${venueDelta.toLocaleString()}만원 절감 가능해요.`,
      amount: venueDelta,
    });
  }

  // OFF-TYPE 토글이 켜져 있으면 해제 권유
  for (const offToggleId of config.offType) {
    if (toggles[offToggleId]) {
      const meta = TOGGLES_META.find((t) => t.id === offToggleId);
      const price = TOGGLE_PRICES[offToggleId]?.[vars.region]?.[vars.season] ?? 0;
      if (meta && price) {
        save.push({
          title: `${meta.label} 해제`,
          desc: `${vars.persona} 유형과 충돌하는 항목이에요. 해제하면 ${price.toLocaleString()}만원 절감.`,
          amount: price,
        });
      }
    }
  }

  // 식대 비중이 너무 높으면 하객 규모 조정 권유
  if (
    consistency.status !== 'WARN' &&
    budget.venueDetail.meal > config.band.max * 0.45
  ) {
    save.push({
      title: '하객 규모 조정',
      desc: '식대가 core 예산의 큰 부분을 차지해요. 초대 인원 재검토를 고려해보세요.',
      amount: null,
    });
  }

  // 절약 항목이 없으면 무난 안내
  if (save.length === 0) {
    save.push({
      title: '현재 큰 낭비 없음',
      desc: '유형과 잘 맞는 구성이에요. 그대로 진행해도 좋아요.',
      amount: null,
    });
  }

  const invest = INVEST_BY_TYPE[vars.persona] ?? INVEST_BY_TYPE.표준실용;

  return { save, invest };
}
