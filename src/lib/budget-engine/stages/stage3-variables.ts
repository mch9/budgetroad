// STAGE 3 — 변수 세팅 (Modifier·태그 → 지역·하객·예산·베이스·토글 디폴트)
// 출처: docs/Result Page Calculation Algorithm.md STAGE 3

import type { OnboardingAnswers, PersonaType, ChoiceId } from '../../onboarding-v6';
import { M1_BUDGET_MAP, M2_GUESTS_MAP, M3_YANGGA_MAP } from '../../onboarding-v6';
import type { SetupVars, ToggleState, UserRegion, Season } from '../types';
import { TYPE_CONFIGS } from '../data/type-config';
import { TOGGLES_META } from '../data/toggles-meta';

// M5 응답 → 사용자 지역
const M5_REGION_MAP: Record<ChoiceId, UserRegion> = {
  A: '서울',
  B: '수도권',
  C: '광역시',
  D: '이외',
};

// M4 응답 → 시즌 (M4는 A/B만 사용)
const M4_SEASON_MAP: Partial<Record<ChoiceId, Season>> = {
  A: 'peak',
  B: 'offPeak',
};

export function setupVars(persona: PersonaType, answers: OnboardingAnswers): SetupVars {
  const config = TYPE_CONFIGS[persona];

  const m5 = answers.M5;
  const region: UserRegion = m5 ? M5_REGION_MAP[m5] : '수도권';

  // M4 시기 (STEP 2에서 추가). 응답 없으면 성수기 default.
  const m4 = answers.M4;
  const season: Season = (m4 && M4_SEASON_MAP[m4]) || 'peak';

  const guests = answers.M2 ? M2_GUESTS_MAP[answers.M2] : 100;
  const budgetTarget = answers.M1 ? M1_BUDGET_MAP[answers.M1] : 2750;
  const yangga = (answers.M3 ? M3_YANGGA_MAP[answers.M3] ?? 1 : 1) as 0 | 1 | 2;

  // 유형별 토글 디폴트 매트릭스
  const toggleDefaults = {} as ToggleState;
  for (const t of TOGGLES_META) {
    toggleDefaults[t.id] = t.defaultByType[persona] ?? false;
  }

  // 보정 — 양가 압력 높음(M3=C) 시 폐백/혼주/주례/한복 강제 ON
  if (yangga === 2) {
    toggleDefaults['폐백 음식'] = true;
    toggleDefaults['폐백 수모'] = true;
    toggleDefaults['주례'] = true;
    toggleDefaults['혼주 메이크업'] = true;
    toggleDefaults['한복 대여'] = true;
  }

  // 보정 — T2-A(인생샷 디렉터) + 경험연출 → 가봉 스냅·퍼스트웨어 ON
  if (persona === '경험연출' && answers.T2 === 'A') {
    toggleDefaults['가봉 스냅'] = true;
    toggleDefaults['퍼스트웨어'] = true;
  }

  return {
    persona,
    region,
    season,
    guests,
    budgetTarget,
    yangga,
    base: {
      dress: config.base.dress,
      makeup: config.base.makeup,
      bonsik: config.base.bonsik,
    },
    toggleDefaults,
  };
}
