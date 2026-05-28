// 온보딩 v6.0 — 13문항 + 2축 사분면 분류
// spec: docs/questionnaire design.md
// algo: docs/Result Page Calculation Algorithm.md (STAGE 1·2)
// note: 진입 라우팅 화면은 팀 기획 외라 제외 (사용자 결정 2026-05-27)

// ── Types ──

export type PersonaType =
  | '전통격식'
  | '표준실용'
  | '경험연출'
  | '본질미니멀'
  | '탐색미결정';

export type QuestionId =
  | 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q7' | 'Q8'
  | 'T2' | 'T5' | 'T7'
  | 'M1' | 'M2' | 'M3' | 'M4' | 'M5';

export type ChoiceId = 'A' | 'B' | 'C' | 'D';

export type AxisScore = { a: number; b: number };

export type OnboardingAnswers = Record<QuestionId, ChoiceId | null>;

export type Option = { id: ChoiceId; label: string; scoreA?: number; scoreB?: number };

export type StepMeta = {
  type: 'main' | 'tag' | 'modifier';
  id: QuestionId;
  title: string;
  subtitle?: string;
  options: Option[];
};

// ── Constants ──

export const TOTAL_STEPS = 14;
export const MAIN_QUESTION_IDS: QuestionId[] = ['Q1', 'Q2', 'Q3', 'Q4', 'Q7', 'Q8'];

export const EMPTY_ANSWERS: OnboardingAnswers = {
  Q1: null, Q2: null, Q3: null, Q4: null, Q7: null, Q8: null,
  T2: null, T5: null, T7: null,
  M1: null, M2: null, M3: null, M4: null, M5: null,
};

// ── 13 Steps (메인 6 + 태그 3 + Modifier 4) ──

export const STEPS: StepMeta[] = [
  // [0] Q1 — 메인 (축 B / 돈)
  {
    type: 'main',
    id: 'Q1',
    title: '추가로 100만 원을 쓸 수 있다면, 어디에 먼저 쓰고 싶나요?',
    options: [
      { id: 'A', label: '하객들이 더 만족할 수 있도록 식사 퀄리티를 높일래요', scoreA: 0, scoreB: 2 },
      { id: 'B', label: '오래 남는 사진이나 영상 퀄리티를 높일래요', scoreA: 0, scoreB: -2 },
      { id: 'C', label: '혼주 헤어·메이크업, 폐백처럼 양가가 신경 쓰는 항목을 보강할래요', scoreA: 1, scoreB: 1 },
      { id: 'D', label: '결혼식보다는 신혼집이나 신혼여행 예산에 보탤래요', scoreA: -1, scoreB: -2 },
    ],
  },

  // [1] Q2 — 메인 (축 B / 감정, 내용 기준 보정)
  {
    type: 'main',
    id: 'Q2',
    title: '결혼식이 끝난 뒤, 둘 중 더 아쉬울 것 같은 상황은 무엇인가요?',
    options: [
      { id: 'A', label: '하객들은 편하게 즐겼지만, 사진과 영상이 평범하게 남은 것', scoreA: 0, scoreB: -2 },
      { id: 'B', label: '사진과 영상은 마음에 들지만, 하객 일부가 불편함을 느낀 것', scoreA: 0, scoreB: 2 },
    ],
  },

  // [2] Q3 — 메인 (축 B / 행동)
  {
    type: 'main',
    id: 'Q3',
    title: '식장을 처음 보러 갔을 때, 가장 먼저 보게 될 것 같은 부분은 무엇인가요?',
    options: [
      { id: 'A', label: '하객들이 오기 편한 위치, 주차, 식사 수준', scoreA: 0, scoreB: 2 },
      { id: 'B', label: '공간 분위기, 조명, 사진이 예쁘게 나올지 여부', scoreA: 0, scoreB: -2 },
    ],
  },

  // [3] Q4 — 메인 (축 A / 돈)
  {
    type: 'main',
    id: 'Q4',
    title: '예산이 처음 계획보다 20% 줄어든다면, 가장 먼저 조정할 항목은 무엇인가요?',
    options: [
      { id: 'A', label: '예식장 등급을 낮추거나 더 실속 있는 식장으로 바꿀래요', scoreA: -1, scoreB: -1 },
      { id: 'B', label: '스튜디오·드레스·메이크업 옵션을 줄일래요', scoreA: 1, scoreB: 1 },
      { id: 'C', label: '초대 인원을 줄여서 전체 규모를 조정할래요', scoreA: -2, scoreB: 0 },
      { id: 'D', label: '폐백, 혼주 관련 준비처럼 부대 항목을 간소화할래요', scoreA: -2, scoreB: 0 },
    ],
  },

  // [4] Q7 — 메인 (축 A / 돈)
  {
    type: 'main',
    id: 'Q7',
    title: '식장 상담 중 추가 옵션을 제안받는다면, 가장 솔깃한 옵션은 무엇인가요?',
    options: [
      { id: 'A', label: '하객 만족도를 높일 수 있는 식사 코스 업그레이드나 꽃장식 보강', scoreA: 1, scoreB: 1 },
      { id: 'B', label: '더 예쁘게 남길 수 있는 본식 스냅 추가나 얼리스타트 촬영', scoreA: 1, scoreB: -1 },
      { id: 'C', label: '혼주 헤어·메이크업, 폐백처럼 양가가 신경 쓰는 패키지', scoreA: 2, scoreB: 1 },
      { id: 'D', label: '추가 옵션은 최대한 넣지 않고 기본 구성으로 진행하고 싶어요', scoreA: -2, scoreB: 0 },
    ],
  },

  // [5] Q8 — 메인 (축 A / 간접 측정)
  {
    type: 'main',
    id: 'Q8',
    title: '여러 식장 후보를 둘러볼 때, 첫눈에 가장 끌리는 곳은 어디인가요?',
    options: [
      { id: 'A', label: '호텔·로비가 으리으리한 곳 — 격식 있는 분위기가 느껴져서', scoreA: 2, scoreB: 1 },
      { id: 'B', label: '후기 평점·견적이 괜찮은 곳 — 조건이 괜찮은지 확인하고 싶어서', scoreA: -1, scoreB: 0 },
      { id: 'C', label: '분위기·조명이 예쁜 곳 — 우리가 원하는 무드인지 보여주고 싶어서', scoreA: 1, scoreB: -1 },
      { id: 'D', label: '가격이 가장 합리적인 곳 — 예산을 얼마나 아낄 수 있는지 확인하고 싶어서', scoreA: -2, scoreB: 0 },
    ],
  },

  // [6] T2 — 태그
  {
    type: 'tag',
    id: 'T2',
    title: '드레스를 입어봤는데 정말 마음에 들어요. 그런데 지정비가 추가된다면 어떻게 할 것 같나요?',
    options: [
      { id: 'A', label: '마음에 드는 드레스라면 추가금을 내고 선택할래요' },
      { id: 'B', label: '추가 금액을 보고 감당 가능한 선이면 선택할래요' },
      { id: 'C', label: '추가금 없는 드레스 중에서 다시 고를래요' },
    ],
  },

  // [7] T5 — 태그
  {
    type: 'tag',
    id: 'T5',
    title: '신혼집 자금이 500만 원 정도 부족하다면 어떻게 조정하고 싶나요?',
    options: [
      { id: 'A', label: '결혼식 예산을 줄여서 신혼집 예산에 보탤래요' },
      { id: 'B', label: '결혼식 예산은 유지하고, 부족한 금액은 다른 방식으로 마련할래요' },
      { id: 'C', label: '결혼식과 신혼집 예산을 조금씩 나눠서 조정할래요' },
    ],
  },

  // [8] T7 — 태그
  {
    type: 'tag',
    id: 'T7',
    title: '결혼식 당일, 하객들이 가장 만족했으면 하는 부분은 무엇인가요?',
    options: [
      { id: 'A', label: '음식이 맛있고 양도 충분한 것' },
      { id: 'B', label: '식장 위치와 주차가 편한 것' },
      { id: 'C', label: '전체적인 분위기와 조명 연출이 좋은 것' },
      { id: 'D', label: '하객 만족도도 중요하지만, 우리 둘이 만족하는 게 더 중요해요' },
    ],
  },

  // [9] M1 — Modifier
  {
    type: 'modifier',
    id: 'M1',
    title: '결혼식 전체 예산은 어느 정도로 생각하고 있나요?',
    subtitle: '양가 지원을 포함해 예상되는 총액 기준으로 골라주세요.',
    options: [
      { id: 'A', label: '2,000만 원 미만' },
      { id: 'B', label: '2,000만 원 ~ 3,500만 원' },
      { id: 'C', label: '3,500만 원 ~ 5,000만 원' },
      { id: 'D', label: '5,000만 원 이상' },
    ],
  },

  // [10] M2 — Modifier
  {
    type: 'modifier',
    id: 'M2',
    title: '예상 하객 수는 어느 정도인가요?',
    options: [
      { id: 'A', label: '50명 미만' },
      { id: 'B', label: '50명 ~ 150명' },
      { id: 'C', label: '150명 ~ 300명' },
      { id: 'D', label: '300명 이상' },
    ],
  },

  // [11] M3 — Modifier
  {
    type: 'modifier',
    id: 'M3',
    title: '결혼 준비 과정에서 부모님, 양가 의견은 어느 정도 반영될 것 같나요?',
    options: [
      { id: 'A', label: '대부분 우리 둘이 결정할 것 같아요' },
      { id: 'B', label: '중요한 항목은 양가와 함께 의논할 것 같아요' },
      { id: 'C', label: '양가 의견이 꽤 많이 반영될 것 같아요' },
    ],
  },

  // [12] M4 — Modifier (시기 — STEP 2 추가, 가격 계산 직결)
  {
    type: 'modifier',
    id: 'M4',
    title: '예식은 어느 시기에 진행하실 예정인가요?',
    subtitle: '결혼 시즌에 따라 가격이 달라져요.',
    options: [
      { id: 'A', label: '성수기 — 3~6월, 9~11월' },
      { id: 'B', label: '비성수기 — 7~8월, 12~2월' },
    ],
  },

  // [13] M5 — Modifier
  {
    type: 'modifier',
    id: 'M5',
    title: '예식 지역은 어디를 생각하고 있나요?',
    options: [
      { id: 'A', label: '서울' },
      { id: 'B', label: '수도권' },
      { id: 'C', label: '광역시' },
      { id: 'D', label: '지방' },
    ],
  },
];

// ── Persona Descriptions ──

export const PERSONA_DESCRIPTIONS: Record<PersonaType, string> = {
  '전통격식': '양가가 함께 신경 쓰는 격식 있는 결혼식을 지향합니다.',
  '표준실용': '하객 만족과 합리적 예산의 균형을 추구합니다.',
  '경험연출': '사진·영상·분위기로 오래 남는 결혼식을 원합니다.',
  '본질미니멀': '필수만 갖춘 간결한 결혼식을 선호합니다.',
  '탐색미결정': '아직 우선순위가 정해지지 않았어요. 차근차근 알아봐요.',
};

// ── STEP 2 변환 규칙 (이번 단계에선 사용 안 함, 미리 export) ──

// M1 응답 → 예산 목표(만원)
export const M1_BUDGET_MAP: Record<ChoiceId, number> = {
  A: 1800,
  B: 2750,
  C: 4250,
  D: 5500,
};

// M2 응답 → 하객 수(중앙값)
export const M2_GUESTS_MAP: Record<ChoiceId, number> = {
  A: 30,
  B: 100,
  C: 225,
  D: 350,
};

// M3 응답 → 양가 압력 레벨 (0·1·2). M3는 A/B/C 3지선다라 Partial.
export const M3_YANGGA_MAP: Partial<Record<ChoiceId, 0 | 1 | 2>> = {
  A: 0, // 당사자 주도
  B: 1, // 조율형
  C: 2, // 양가 압력 高
};

// M5 응답 → 지역 키
export const M5_REGION_MAP: Record<ChoiceId, '서울' | '수도권' | '광역시' | '지방'> = {
  A: '서울',
  B: '수도권',
  C: '광역시',
  D: '지방',
};

// ── Classification (STAGE 1·2) ──

export function scoreAxis(answers: OnboardingAnswers): AxisScore {
  let a = 0;
  let b = 0;
  for (const qid of MAIN_QUESTION_IDS) {
    const choiceId = answers[qid];
    if (!choiceId) continue;
    const step = STEPS.find((s) => s.id === qid);
    if (!step) continue;
    const opt = step.options.find((o) => o.id === choiceId);
    if (!opt) continue;
    a += opt.scoreA ?? 0;
    b += opt.scoreB ?? 0;
  }
  return { a, b };
}

export function classifyPersona({ a, b }: AxisScore): PersonaType {
  if (Math.abs(a) <= 1 && Math.abs(b) <= 1) return '탐색미결정';
  if (a >= 0 && b >= 0) return '전통격식';
  if (a < 0 && b >= 0) return '표준실용';
  if (a >= 0 && b < 0) return '경험연출';
  return '본질미니멀';
}
