// ── Types ──

export type Region = 'gangnam' | 'seoul-etc' | 'gyeonggi';
export type VenueType = 'convention' | 'chapel' | 'traditional' | 'outdoor';
export type Season = 'peak' | 'off-peak';
export type Tier = 'simple' | 'standard' | 'luxury';
export type GuestCount = 100 | 200 | 300 | 400;
export type MealCost = 5 | 7 | 10;
export type YemulTier = 'budget' | 'standard' | 'premium' | 'custom' | 'skip';
export type HoneymoonChoice = 'yes' | 'no';

export interface StepSelections {
  region: Region;
  venueType: VenueType;
  season: Season;
  studioTier: Tier;
  dressTier: Tier;
  makeupTier: Tier;
  guestCount: number;
  mealCost: number;
  yemulTier: YemulTier;
  yemulBudget: number;
  honeymoonChoice: HoneymoonChoice;
  honeymoonBudget: number;
}

export const DEFAULT_SELECTIONS: StepSelections = {
  region: 'gangnam',
  venueType: 'convention',
  season: 'peak',
  studioTier: 'simple',
  dressTier: 'simple',
  makeupTier: 'simple',
  guestCount: 150,
  mealCost: 6,
  yemulTier: 'budget',
  yemulBudget: 1800,
  honeymoonChoice: 'yes',
  honeymoonBudget: 1000,
};

// ── Option Labels ──

export const REGION_OPTIONS = [
  { value: 'gangnam' as Region, label: '서울 강남권', desc: '청담·역삼·삼성 등 : 1,300만원 내외', icon: '🏙️' },
  { value: 'seoul-etc' as Region, label: '서울 강남 외 지역', desc: '마포·여의도·광진 등 : 1,100만원 내외', icon: '🏢' },
  { value: 'gyeonggi' as Region, label: '경기 주요 지역', desc: '분당·일산·수원 등 : 865만원 내외', icon: '🌳' },
];

export const VENUE_OPTIONS = [
  { value: 'convention' as VenueType, label: '컨벤션', desc: '호텔·연회장 형태의 안정적이고 대중적인 예식', icon: '🏨' },
  { value: 'chapel' as VenueType, label: '채플', desc: '교회·성당 느낌의 차분하고 클래식한 예식', icon: '⛪' },
  { value: 'outdoor' as VenueType, label: '야외', desc: '정원·루프탑 등 자유롭고 감성적인 예식', icon: '🌿' },
  { value: 'traditional' as VenueType, label: '전통 혼례', desc: '한복과 전통 의식을 활용한 한국식 전통 예식', icon: '🏛️' },
];

export const SEASON_OPTIONS = [
  { value: 'peak' as Season, label: '성수기', desc: '3월~6월, 9월~11월', icon: '🌸' },
  { value: 'off-peak' as Season, label: '비성수기', desc: '7월~8월, 12월~2월', icon: '❄️' },
];

export const TIER_LABELS: Record<Tier, { label: string; desc: string }> = {
  simple: { label: '실속형', desc: '하위 10%' },
  standard: { label: '대중형', desc: '중간값' },
  luxury: { label: '프리미엄형', desc: '상위 10%' },
};

export const STUDIO_TIER_OPTIONS = [
  { value: 'simple' as Tier, label: '실속형', desc: '필수 컷 중심의 간결한 촬영' },
  { value: 'standard' as Tier, label: '대중형', desc: '다양한 컨셉 · 균형 잡힌 구성' },
  { value: 'luxury' as Tier, label: '프리미엄형', desc: '고급 컨셉 · 연출과 결과물 풍부' },
];

export const DRESS_TIER_OPTIONS = [
  { value: 'simple' as Tier, label: '실속형', desc: '기본 라인 · 합리적인 선택' },
  { value: 'standard' as Tier, label: '대중형', desc: '다양한 스타일 · 균형 잡힌 구성' },
  { value: 'luxury' as Tier, label: '프리미엄형', desc: '브랜드 드레스 · 고급 라인' },
];

export const MAKEUP_TIER_OPTIONS = [
  { value: 'simple' as Tier, label: '실속형', desc: '기본 메이크업 · 필수 구성' },
  { value: 'standard' as Tier, label: '대중형', desc: '트렌드 메이크업 · 헤어 포함' },
  { value: 'luxury' as Tier, label: '프리미엄형', desc: '맞춤 스타일링 · 리허설/수정 포함' },
];

export const GUEST_OPTIONS = [
  { value: 150, label: '150명', icon: '👥' },
  { value: 200, label: '200명', icon: '👥' },
  { value: 250, label: '250명', icon: '👥' },
  { value: 300, label: '300명', icon: '👥' },
];

export const MEAL_OPTIONS = [
  { value: 6, label: '60,000원', desc: '합리적 뷔페 · 가성비 중심', icon: '🍚' },
  { value: 9, label: '90,000원', desc: '중위권 호텔 · 컨벤션 수준', icon: '🍱' },
  { value: 12, label: '120,000원', desc: '상위 컨벤션 · 프리미엄 뷔페', icon: '🥩' },
  { value: 15, label: '150,000원', desc: '특급 호텔 수준 고급 코스', icon: '🍽️' },
];

export const YEMUL_OPTIONS = [
  { value: 'budget' as YemulTier, label: '실속형', desc: '간결하고 일상적인 링 중심 : 600만원', icon: '💍' },
  { value: 'standard' as YemulTier, label: '대중형', desc: '결혼반지 + 기본 세트 조합 : 1,800만원', icon: '💎' },
  { value: 'premium' as YemulTier, label: '프리미엄', desc: '백화점 브랜드 : 3,000만원', icon: '👑' },
];

export const HONEYMOON_OPTIONS = [
  { value: 'yes' as HoneymoonChoice, label: '신혼여행 갈 예정', desc: '기본 예산 1,000만원', icon: '✈️' },
  { value: 'no' as HoneymoonChoice, label: '미루거나 생략', desc: '신혼여행 없이 진행', icon: '✕' },
];

// ── Price Data (단위: 만원) ──

// 스드메 시장 조정 계수: MVP에서는 한국소비자원·공여사들 조사 데이터의 1.5배 적용
// (추후 사이클에서 사용자 선택 옵션으로 정교화 예정)
const SDM_MARKET_MULTIPLIER = 1.5;

// 1인당 표준 식사비: [region][venueType] (단위: 만원)
export const STANDARD_MEAL_PRICES: Record<Region, Partial<Record<VenueType, number>>> = {
  gangnam: {
    convention: 13,
    chapel: 11,
    outdoor: 9.5,
  },
  'seoul-etc': {
    convention: 9.9,
    chapel: 10.385,
    traditional: 12.575,
    outdoor: 10.45,
  },
  gyeonggi: {
    convention: 7.7,
    chapel: 7.9,
    traditional: 8.8,
    outdoor: 7.65,
  },
};

// 예식장 대관료: [region][venueType] — Median 값 (시즌 구분 없음)
// 0은 "데이터 없음" sentinel — isVenueDisabled()로 UI에서 차단
const VENUE_PRICES: Record<Region, Record<VenueType, number>> = {
  gangnam: {
    convention: 1360,
    chapel: 1300,
    traditional: 0,
    outdoor: 1295,
  },
  'seoul-etc': {
    convention: 1475,
    chapel: 1050,
    traditional: 1090,
    outdoor: 1597.5,
  },
  gyeonggi: {
    convention: 780,
    chapel: 800,
    traditional: 1375,
    outdoor: 956.25,
  },
};

export function isVenueDisabled(region: Region, venueType: VenueType): boolean {
  return VENUE_PRICES[region][venueType] === 0;
}

// 스드메: [region][season][tier] — 실속(P10)/대중(P50)/프리미엄(P90)
const STUDIO_PRICES: Record<Region, Record<Season, Record<Tier, number>>> = {
  gangnam: {
    peak: { simple: 105, standard: 150, luxury: 227.5 },
    'off-peak': { simple: 105, standard: 150, luxury: 245 },
  },
  'seoul-etc': {
    peak: { simple: 68, standard: 130, luxury: 164 },
    'off-peak': { simple: 68, standard: 132, luxury: 164 },
  },
  gyeonggi: {
    peak: { simple: 44, standard: 81.5, luxury: 143 },
    'off-peak': { simple: 44, standard: 88, luxury: 143 },
  },
};

const DRESS_PRICES: Record<Region, Record<Season, Record<Tier, number>>> = {
  gangnam: {
    peak: { simple: 112.5, standard: 193.5, luxury: 960 },
    'off-peak': { simple: 116, standard: 198, luxury: 903 },
  },
  'seoul-etc': {
    peak: { simple: 57, standard: 110.5, luxury: 185 },
    'off-peak': { simple: 64, standard: 118, luxury: 194 },
  },
  gyeonggi: {
    peak: { simple: 70, standard: 157, luxury: 196 },
    'off-peak': { simple: 82, standard: 157, luxury: 196 },
  },
};

const MAKEUP_PRICES: Record<Region, Record<Season, Record<Tier, number>>> = {
  gangnam: {
    peak: { simple: 70, standard: 97, luxury: 136.5 },
    'off-peak': { simple: 71, standard: 98, luxury: 134 },
  },
  'seoul-etc': {
    peak: { simple: 40, standard: 72.5, luxury: 114.5 },
    'off-peak': { simple: 41, standard: 75, luxury: 123 },
  },
  gyeonggi: {
    peak: { simple: 39, standard: 82, luxury: 94 },
    'off-peak': { simple: 43, standard: 82, luxury: 98 },
  },
};

// 예물 (고정형 + 직접 입력)
const YEMUL_PRICES: Record<Exclude<YemulTier, 'custom'>, number> = {
  budget: 600,
  standard: 1800,
  premium: 3000,
  skip: 0,
};

// ── Calculate ──

export interface BudgetResultItem {
  id: string;
  label: string;
  amount: number;
  icon: string;
  color: string;
  range?: string;
  skipped: boolean;
  details: Array<[string, string]>;
}

export interface BudgetResult {
  items: BudgetResultItem[];
  total: number;
  totalMin: number;
  totalMax: number;
}

export function calculateBudget(s: StepSelections): BudgetResult {
  const venue = VENUE_PRICES[s.region][s.venueType];
  const studio = STUDIO_PRICES[s.region][s.season][s.studioTier];
  const dress = DRESS_PRICES[s.region][s.season][s.dressTier];
  const makeup = MAKEUP_PRICES[s.region][s.season][s.makeupTier];
  const sdm = Math.round((studio + dress + makeup) * SDM_MARKET_MULTIPLIER);
  const meal = Math.round((s.guestCount * s.mealCost) / 10) * 10;
  const yemul = s.yemulTier === 'custom' ? s.yemulBudget : YEMUL_PRICES[s.yemulTier];
  const honeymoon = s.honeymoonChoice === 'yes' ? s.honeymoonBudget : 0;

  // 스드메 범위: 같은 지역·시즌에서 실속~프리미엄
  const sdmMin = Math.round((STUDIO_PRICES[s.region][s.season].simple
    + DRESS_PRICES[s.region][s.season].simple
    + MAKEUP_PRICES[s.region][s.season].simple) * SDM_MARKET_MULTIPLIER);
  const sdmMax = Math.round((STUDIO_PRICES[s.region][s.season].luxury
    + DRESS_PRICES[s.region][s.season].luxury
    + MAKEUP_PRICES[s.region][s.season].luxury) * SDM_MARKET_MULTIPLIER);
  const mealMin = Math.round((s.guestCount * 6) / 10) * 10;
  const mealMax = Math.round((s.guestCount * 15) / 10) * 10;

  const studioAmount = Math.round(studio * SDM_MARKET_MULTIPLIER);
  const dressAmount = Math.round(dress * SDM_MARKET_MULTIPLIER);
  const makeupAmount = Math.round(makeup * SDM_MARKET_MULTIPLIER);
  const regionLabel = REGION_OPTIONS.find((o) => o.value === s.region)?.label ?? '';
  const venueTypeLabel = VENUE_OPTIONS.find((o) => o.value === s.venueType)?.label ?? '';
  const seasonLabel = SEASON_OPTIONS.find((o) => o.value === s.season)?.label ?? '';
  const yemulLabel = YEMUL_OPTIONS.find((o) => o.value === s.yemulTier)?.label ?? '';
  const won = (manwon: number) => `${(manwon * 10000).toLocaleString()}원`;

  const items: BudgetResultItem[] = [
    {
      id: 'venue', label: '예식장', amount: venue, icon: '🏛️', color: '#FF6B6B',
      range: `${venue.toLocaleString()}만원 (중앙값)`, skipped: false,
      details: [
        ['대관료', won(venue)],
        ['지역', regionLabel],
        ['예식 유형', venueTypeLabel],
        ['시즌', seasonLabel],
      ],
    },
    {
      id: 'sdm', label: '스드메', amount: sdm, icon: '📸', color: '#4ECDC4',
      range: `${sdmMin.toLocaleString()}만 ~ ${sdmMax.toLocaleString()}만원`, skipped: false,
      details: [
        ['스튜디오', won(studioAmount)],
        ['드레스', won(dressAmount)],
        ['메이크업', won(makeupAmount)],
      ],
    },
    {
      id: 'meal', label: '식사', amount: meal, icon: '🍽️', color: '#FFE66D',
      range: `${s.guestCount.toLocaleString()}명 × ${s.mealCost}만원`, skipped: false,
      details: [
        ['1인당 식비', won(s.mealCost)],
        ['보증 인원', `${s.guestCount}명`],
        ['식비 합계', won(meal)],
      ],
    },
    {
      id: 'yemul', label: '예물', amount: yemul, icon: '💍', color: '#95E1D3',
      range: '600만 ~ 3,000만원', skipped: s.yemulTier === 'skip',
      details: [['등급', yemulLabel]],
    },
    {
      id: 'honeymoon', label: '신혼여행', amount: honeymoon, icon: '✈️', color: '#C7CEEA',
      range: '직접 설정 금액', skipped: s.honeymoonChoice === 'no',
      details: [['포함 여부', s.honeymoonChoice === 'yes' ? '포함' : '포함 안 함']],
    },
  ];

  const total = items.reduce((sum, item) => sum + item.amount, 0);

  let totalMin = venue + sdmMin + mealMin;
  let totalMax = venue + sdmMax + mealMax;
  if (s.yemulTier === 'custom') {
    totalMin += s.yemulBudget; totalMax += s.yemulBudget;
  } else if (s.yemulTier !== 'skip') {
    totalMin += YEMUL_PRICES.budget; totalMax += YEMUL_PRICES.premium;
  }
  if (s.honeymoonChoice === 'yes') { totalMin += s.honeymoonBudget; totalMax += s.honeymoonBudget; }

  return { items, total, totalMin, totalMax };
}
