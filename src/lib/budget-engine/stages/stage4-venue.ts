// STAGE 4 — 추천 식장 형태 (유형 + 하객 + 예산 + 태그 + 양가)
// 출처: docs/Result Page Calculation Algorithm.md STAGE 4
// 형태별 가격 데이터 미보유 → form 추천만, 정확 예산은 STAGE 5에서 일반 웨딩홀 프로파일로 근사

import type { OnboardingAnswers } from '../../onboarding-v6';
import type { SetupVars, VenueRecommendation } from '../types';

function recommendForm(vars: SetupVars): { form: string; alt: string } {
  const { persona, guests, budgetTarget } = vars;
  switch (persona) {
    case '전통격식':
      if (budgetTarget >= 5500 && guests >= 300) return { form: '5성급 호텔', alt: '호텔·컨벤션 프리미엄 홀' };
      if (budgetTarget >= 4250) return { form: '호텔·컨벤션 프리미엄 홀', alt: '컨벤션홀·격식형 웨딩홀' };
      return { form: '컨벤션홀·격식형 웨딩홀', alt: '일반 웨딩홀' };
    case '표준실용':
      if (guests >= 300) return { form: '대형 일반 웨딩홀', alt: '컨벤션홀' };
      if (guests >= 150) return { form: '일반 웨딩홀', alt: '하우스 웨딩' };
      return { form: '중소형 웨딩홀', alt: '레스토랑 웨딩' };
    case '경험연출':
      if (guests < 100) return { form: '하우스·특색 소규모 베뉴', alt: '레스토랑 웨딩' };
      if (guests <= 200) return { form: '하우스 웨딩·가든', alt: '컨셉형 웨딩홀' };
      return { form: '컨셉형 대형 베뉴·가든홀', alt: '컨벤션홀' };
    case '본질미니멀':
      if (guests < 50) return { form: '레스토랑·스몰 베뉴', alt: '셀프·하우스 웨딩' };
      if (guests <= 100) return { form: '하우스 웨딩·스몰홀', alt: '실속형 웨딩홀' };
      return { form: '실속형 소규모 웨딩홀', alt: '일반 웨딩홀' };
    case '탐색미결정':
      return { form: '추천 보류', alt: '우선순위 먼저 안내' };
  }
}

function buildReasons(
  vars: SetupVars,
  answers: OnboardingAnswers
): Array<{ label: string; text: string }> {
  const reasons: Array<{ label: string; text: string }> = [];

  reasons.push({
    label: `유형 · ${vars.persona}`,
    text: `${vars.persona} 성향에 맞는 공간을 우선 추천했어요.`,
  });

  reasons.push({
    label: `하객 · ${vars.guests}명`,
    text: vars.guests >= 200 ? '하객이 많아 보증인원 여유 있는 공간이 유리해요.' : '하객 규모에 맞는 보증인원·대관 부담을 줄이는 공간이에요.',
  });

  // 태그 신호 — T7 무드집착(C) / 자유추구(D) / 호스트(A·B)
  if (answers.T7 === 'C') {
    reasons.push({ label: '태그 · 무드집착', text: '분위기·조명 중심으로 공간이 예쁜 곳을 우선했어요.' });
  } else if (answers.T7 === 'D') {
    reasons.push({ label: '태그 · 자유추구', text: '형식보다 우리다움 — 하우스·레스토랑 등 비전통 공간도 고려했어요.' });
  } else if (answers.T7 === 'A' || answers.T7 === 'B') {
    reasons.push({ label: '태그 · 호스트', text: '하객 만족 — 음식·접근성 좋은 공간을 우선했어요.' });
  }

  // T5-A 생활우선
  if (answers.T5 === 'A') {
    reasons.push({ label: '태그 · 생활우선', text: '신혼집 우선 — 대관·보증 부담 적은 실속형 공간이에요.' });
  }

  // T2-C 최소비용
  if (answers.T2 === 'C') {
    reasons.push({ label: '태그 · 최소비용', text: '추가금 최소화 — 올인원·패키지 명확한 곳이 유리해요.' });
  }

  // M3 양가 압력 高
  if (vars.yangga === 2) {
    reasons.push({ label: '양가 · 의견 반영 많음', text: '일반 웨딩홀·호텔 선호 가능 — 형태 조율이 필요할 수 있어요.' });
  }

  return reasons;
}

export function recommendVenue(vars: SetupVars, answers: OnboardingAnswers): VenueRecommendation {
  const { form, alt } = recommendForm(vars);
  const reasons = buildReasons(vars, answers);
  return {
    form,
    alt,
    reasons,
    pricingAvailable: false, // 형태별 가격 데이터 미보유
  };
}
