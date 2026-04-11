export type Region = 'seoul' | 'gyeonggi' | 'local';

export type ItemId =
  | 'venue'
  | 'sdm'
  | 'honsu'
  | 'yemul'
  | 'yedan'
  | 'honeymoon'
  | 'hanbok'
  | 'pyebaek'
  | 'invitation'
  | 'gift';

export type VenueType = 'hotel' | 'wedding-hall' | 'small' | 'outdoor';
export type HoneymoonType = 'domestic' | 'southeast-asia' | 'europe' | 'other';

export interface BudgetItem {
  id: ItemId;
  label: string;
  hasSubOption: boolean;
}

export interface SubOption {
  value: string;
  label: string;
}

export const REGIONS: { value: Region; label: string }[] = [
  { value: 'seoul', label: '서울' },
  { value: 'gyeonggi', label: '경기' },
  { value: 'local', label: '지방' },
];

export const BUDGET_ITEMS: BudgetItem[] = [
  { id: 'venue', label: '식장', hasSubOption: true },
  { id: 'sdm', label: '스드메', hasSubOption: false },
  { id: 'honsu', label: '혼수', hasSubOption: false },
  { id: 'yemul', label: '예물', hasSubOption: false },
  { id: 'yedan', label: '예단', hasSubOption: false },
  { id: 'honeymoon', label: '신혼여행', hasSubOption: true },
  { id: 'hanbok', label: '한복', hasSubOption: false },
  { id: 'pyebaek', label: '폐백음식', hasSubOption: false },
  { id: 'invitation', label: '청첩장', hasSubOption: false },
  { id: 'gift', label: '답례품', hasSubOption: false },
];

export const VENUE_OPTIONS: SubOption[] = [
  { value: 'hotel', label: '호텔' },
  { value: 'wedding-hall', label: '웨딩홀' },
  { value: 'small', label: '스몰웨딩' },
  { value: 'outdoor', label: '야외' },
];

export const HONEYMOON_OPTIONS: SubOption[] = [
  { value: 'domestic', label: '국내' },
  { value: 'southeast-asia', label: '동남아' },
  { value: 'europe', label: '유럽' },
  { value: 'other', label: '기타' },
];

// Unit: 만원 (10,000 KRW)
// Source: 2025년 결혼비용 실태조사 (듀오)
const PRICE_DATA: Record<Region, Record<string, number>> = {
  seoul: {
    'venue:hotel': 2000,
    'venue:wedding-hall': 1200,
    'venue:small': 800,
    'venue:outdoor': 900,
    sdm: 350,
    honsu: 500,
    yemul: 400,
    yedan: 300,
    'honeymoon:domestic': 150,
    'honeymoon:southeast-asia': 300,
    'honeymoon:europe': 600,
    'honeymoon:other': 250,
    hanbok: 100,
    pyebaek: 80,
    invitation: 50,
    gift: 70,
  },
  gyeonggi: {
    'venue:hotel': 1800,
    'venue:wedding-hall': 1000,
    'venue:small': 700,
    'venue:outdoor': 800,
    sdm: 300,
    honsu: 450,
    yemul: 350,
    yedan: 250,
    'honeymoon:domestic': 150,
    'honeymoon:southeast-asia': 300,
    'honeymoon:europe': 600,
    'honeymoon:other': 250,
    hanbok: 80,
    pyebaek: 70,
    invitation: 40,
    gift: 60,
  },
  local: {
    'venue:hotel': 1500,
    'venue:wedding-hall': 800,
    'venue:small': 500,
    'venue:outdoor': 600,
    sdm: 250,
    honsu: 400,
    yemul: 300,
    yedan: 200,
    'honeymoon:domestic': 150,
    'honeymoon:southeast-asia': 300,
    'honeymoon:europe': 600,
    'honeymoon:other': 250,
    hanbok: 70,
    pyebaek: 60,
    invitation: 30,
    gift: 50,
  },
};

export interface SelectedItem {
  id: ItemId;
  subOption?: string;
}

export interface BudgetResult {
  itemId: ItemId;
  label: string;
  subOptionLabel: string;
  amount: number;
}

export function calculateBudget(
  region: Region,
  selectedItems: SelectedItem[]
): BudgetResult[] {
  const prices = PRICE_DATA[region];

  return selectedItems.map((item) => {
    const budgetItem = BUDGET_ITEMS.find((b) => b.id === item.id)!;
    let key: string;
    let subOptionLabel = '-';

    if (item.id === 'venue' && item.subOption) {
      key = `venue:${item.subOption}`;
      subOptionLabel =
        VENUE_OPTIONS.find((o) => o.value === item.subOption)?.label ?? '-';
    } else if (item.id === 'honeymoon' && item.subOption) {
      key = `honeymoon:${item.subOption}`;
      subOptionLabel =
        HONEYMOON_OPTIONS.find((o) => o.value === item.subOption)?.label ?? '-';
    } else {
      key = item.id;
    }

    return {
      itemId: item.id,
      label: budgetItem.label,
      subOptionLabel,
      amount: prices[key] ?? 0,
    };
  });
}

export function getDefaultSubOption(itemId: ItemId): string | undefined {
  if (itemId === 'venue') return 'wedding-hall';
  if (itemId === 'honeymoon') return 'southeast-asia';
  return undefined;
}
