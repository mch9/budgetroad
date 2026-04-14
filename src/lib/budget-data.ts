// ── Types ──

export type Region = 'gangnam' | 'seoul-etc' | 'gyeonggi';
export type VenueType = 'convention' | 'chapel' | 'house' | 'outdoor';
export type Season = 'peak' | 'off-peak';
export type Tier = 'simple' | 'standard' | 'luxury';
export type GuestCount = 100 | 200 | 300 | 400;
export type MealCost = 5 | 7 | 10;
export type YemulTier = 'budget' | 'standard' | 'premium' | 'skip';
export type YedanChoice = 'include' | 'skip';
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
  yedanChoice: YedanChoice;
  honeymoonChoice: HoneymoonChoice;
  honeymoonBudget: number;
}

export const DEFAULT_SELECTIONS: StepSelections = {
  region: 'gangnam',
  venueType: 'convention',
  season: 'peak',
  studioTier: 'standard',
  dressTier: 'standard',
  makeupTier: 'standard',
  guestCount: 200,
  mealCost: 7,
  yemulTier: 'standard',
  yedanChoice: 'include',
  honeymoonChoice: 'yes',
  honeymoonBudget: 1000,
};

// ── Option Labels ──

export const REGION_OPTIONS = [
  { value: 'gangnam' as Region, label: '서울 (강남)', desc: '강남, 서초, 송파 지역', icon: '🏙️' },
  { value: 'seoul-etc' as Region, label: '서울 (강남 외)', desc: '강남 외 서울 지역', icon: '🏢' },
  { value: 'gyeonggi' as Region, label: '경기도', desc: '경기 전 지역', icon: '🌳' },
];

export const VENUE_OPTIONS = [
  { value: 'convention' as VenueType, label: '컨벤션', desc: '호텔·컨벤션 웨딩홀', icon: '🏨' },
  { value: 'chapel' as VenueType, label: '채플', desc: '교회·성당 채플 웨딩', icon: '⛪' },
  { value: 'house' as VenueType, label: '하우스', desc: '하우스 웨딩·스몰 웨딩', icon: '🏡' },
  { value: 'outdoor' as VenueType, label: '야외', desc: '가든·야외 웨딩', icon: '🌿' },
];

export const SEASON_OPTIONS = [
  { value: 'peak' as Season, label: '성수기', desc: '3~6월, 9~11월', icon: '🌸' },
  { value: 'off-peak' as Season, label: '비성수기', desc: '7~8월, 12~2월', icon: '❄️' },
];

export const TIER_LABELS: Record<Tier, { label: string; desc: string }> = {
  simple: { label: '심플', desc: '하위 10%' },
  standard: { label: '스탠다드', desc: '중간값' },
  luxury: { label: '럭셔리', desc: '상위 10%' },
};

export const GUEST_OPTIONS = [
  { value: 100, label: '100명', desc: '소규모 예식', icon: '👥' },
  { value: 200, label: '200명', desc: '일반적인 규모', icon: '👥' },
  { value: 300, label: '300명', desc: '대규모 예식', icon: '👥' },
  { value: 400, label: '400명 이상', desc: '초대규모 예식', icon: '👥' },
];

export const MEAL_OPTIONS = [
  { value: 5, label: '5만원', desc: '뷔페 기본', icon: '🍚' },
  { value: 7, label: '7만원', desc: '뷔페 중급', icon: '🍱' },
  { value: 10, label: '10만원', desc: '프리미엄 한식/양식', icon: '🥩' },
];

export const YEMUL_OPTIONS = [
  { value: 'budget' as YemulTier, label: '실속형', desc: '커플링 + 기본 예물 · 약 300만원', icon: '💍' },
  { value: 'standard' as YemulTier, label: '대중형', desc: '브랜드 예물 세트 · 약 650만원', icon: '💎' },
  { value: 'premium' as YemulTier, label: '프리미엄형', desc: '명품 브랜드 세트 · 약 1,000만원', icon: '👑' },
  { value: 'skip' as YemulTier, label: '생략', desc: '예물 없이 진행', icon: '✕' },
];

export const YEDAN_OPTIONS = [
  { value: 'include' as YedanChoice, label: '예단 포함', desc: '현금 + 간단한 선물 · 평균 약 500만원', icon: '🎁' },
  { value: 'skip' as YedanChoice, label: '생략', desc: '예단 없이 진행', icon: '✕' },
];

export const HONEYMOON_OPTIONS = [
  { value: 'yes' as HoneymoonChoice, label: '신혼여행 갈 예정', desc: '기본 예산 1,000만원', icon: '✈️' },
  { value: 'no' as HoneymoonChoice, label: '생략', desc: '신혼여행 없이 진행', icon: '✕' },
];

// ── Price Data (단위: 만원) ──

// 예식장 대관료: [region][venueType][season]
const VENUE_PRICES: Record<Region, Record<VenueType, Record<Season, number>>> = {
  gangnam: {
    convention: { peak: 700, 'off-peak': 450 },
    chapel: { peak: 500, 'off-peak': 300 },
    house: { peak: 600, 'off-peak': 400 },
    outdoor: { peak: 550, 'off-peak': 350 },
  },
  'seoul-etc': {
    convention: { peak: 550, 'off-peak': 350 },
    chapel: { peak: 400, 'off-peak': 250 },
    house: { peak: 450, 'off-peak': 300 },
    outdoor: { peak: 400, 'off-peak': 250 },
  },
  gyeonggi: {
    convention: { peak: 400, 'off-peak': 250 },
    chapel: { peak: 300, 'off-peak': 180 },
    house: { peak: 350, 'off-peak': 220 },
    outdoor: { peak: 300, 'off-peak': 200 },
  },
};

// 스드메: [tier] (지역 공통, 서울강남 기준 중간값 사용)
const STUDIO_PRICES: Record<Tier, number> = { simple: 218, standard: 350, luxury: 630 };
const DRESS_PRICES: Record<Tier, number> = { simple: 100, standard: 155, luxury: 350 };
const MAKEUP_PRICES: Record<Tier, number> = { simple: 30, standard: 60, luxury: 120 };

// 예물
const YEMUL_PRICES: Record<YemulTier, number> = {
  budget: 300,
  standard: 650,
  premium: 1000,
  skip: 0,
};

// 예단
const YEDAN_PRICES: Record<YedanChoice, number> = { include: 500, skip: 0 };

// ── Calculate ──

export interface BudgetResultItem {
  id: string;
  label: string;
  amount: number;
  icon: string;
  color: string;
  range?: string;
  skipped: boolean;
}

export interface BudgetResult {
  items: BudgetResultItem[];
  total: number;
  totalMin: number;
  totalMax: number;
}

export function calculateBudget(s: StepSelections): BudgetResult {
  const venue = VENUE_PRICES[s.region][s.venueType][s.season];
  const studio = STUDIO_PRICES[s.studioTier];
  const dress = DRESS_PRICES[s.dressTier];
  const makeup = MAKEUP_PRICES[s.makeupTier];
  const sdm = studio + dress + makeup;
  const meal = Math.round((s.guestCount * s.mealCost) / 10) * 10; // 만원 단위 반올림
  const yemul = YEMUL_PRICES[s.yemulTier];
  const yedan = YEDAN_PRICES[s.yedanChoice];
  const honeymoon = s.honeymoonChoice === 'yes' ? s.honeymoonBudget : 0;

  // 항목별 최소/최대 (사용자 선택 기반, 같은 구조에서 범위만 계산)
  const venueMin = VENUE_PRICES[s.region][s.venueType]['off-peak'];
  const venueMax = VENUE_PRICES[s.region][s.venueType]['peak'];
  const sdmMin = STUDIO_PRICES.simple + DRESS_PRICES.simple + MAKEUP_PRICES.simple;
  const sdmMax = STUDIO_PRICES.luxury + DRESS_PRICES.luxury + MAKEUP_PRICES.luxury;
  const mealMin = Math.round((s.guestCount * 5) / 10) * 10;
  const mealMax = Math.round((s.guestCount * 10) / 10) * 10;

  const items: BudgetResultItem[] = [
    { id: 'venue', label: '예식장', amount: venue, icon: '🏛️', color: '#FF8400', range: `${venueMin.toLocaleString()}만 ~ ${venueMax.toLocaleString()}만원`, skipped: false },
    { id: 'sdm', label: '스드메', amount: sdm, icon: '📸', color: '#FFB366', range: `${sdmMin.toLocaleString()}만 ~ ${sdmMax.toLocaleString()}만원`, skipped: false },
    { id: 'meal', label: '식사', amount: meal, icon: '🍽️', color: '#4FC3F7', range: `${s.guestCount.toLocaleString()}명 × ${s.mealCost}만원`, skipped: false },
    { id: 'yemul', label: '예물', amount: yemul, icon: '💍', color: '#81C784', range: '300만 ~ 1,000만원', skipped: s.yemulTier === 'skip' },
    { id: 'honeymoon', label: '신혼여행', amount: honeymoon, icon: '✈️', color: '#CE93D8', range: '직접 설정 금액', skipped: s.honeymoonChoice === 'no' },
    { id: 'yedan', label: '예단', amount: yedan, icon: '🎁', color: '#E0E0E0', range: '평균 500만원', skipped: s.yedanChoice === 'skip' },
  ];

  const total = items.reduce((sum, item) => sum + item.amount, 0);

  // 총 예산 범위: 포함된 항목들의 최소/최대 합산
  let totalMin = venueMin + sdmMin + mealMin;
  let totalMax = venueMax + sdmMax + mealMax;
  if (s.yemulTier !== 'skip') { totalMin += YEMUL_PRICES.budget; totalMax += YEMUL_PRICES.premium; }
  if (s.honeymoonChoice === 'yes') { totalMin += s.honeymoonBudget; totalMax += s.honeymoonBudget; }
  if (s.yedanChoice === 'include') { totalMin += 500; totalMax += 500; }

  return { items, total, totalMin, totalMax };
}
