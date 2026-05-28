// 계산 엔진 공유 타입
// 단위: 가격은 모두 만원, 인원수만 명

import type { OnboardingAnswers, PersonaType } from '../onboarding-v6';

// ── 사용자 응답에서 도출되는 변수 ──

export type UserRegion = '서울' | '수도권' | '광역시' | '이외';
export type Season = 'peak' | 'offPeak';

// ── 결과 5 카테고리 ──

export type ResultCategory = '예식장' | '스드메' | '예물·예단' | '혼수' | '신혼여행';

// ── 베뉴 타입 (Result Algorithm v3) ──

export type VenueType = 'hotel' | 'hall' | 'house' | 'small';

export type VenueProfile = {
  guarantee: number;    // 최소 보증인원 (명)
  rentalFee: number;    // 대관료 (만원)
  rentalNote: string;   // 사용자 sub-text 안내
  isEstimate: boolean;  // [추정] 단가 여부 (Phase 2 실측 대상)
};

// ── 추가금 토글 ──

export type ToggleId =
  // [스튜디오]
  | '원본 구매' | '담당자 지정' | '서브 스냅' | '야외 촬영' | '얼리스타트'
  // [드레스]
  | '드레스 지정' | '본식 헬퍼' | '2부 드레스' | '퍼스트웨어' | '가봉 스냅' | '턱시도 대여'
  // [메이크업]
  | '혼주 메이크업' | '헤어변형'
  // [예식장 연출]
  | '생화 꽃장식' | '부케' | '플라워 샤워' | '포토테이블' | '웨딩 케이크'
  // [예식장 진행·가족]
  | '본식 사회자' | '주례' | '축하공연 섭외' | '본식 도우미' | '폐백 음식' | '폐백 수모' | '한복 대여';

export type ToggleGroup = '예식장' | '스튜디오' | '드레스' | '메이크업';
// 결과 카테고리 가산처. 스튜디오·드레스·메이크업 그룹 → '스드메', 예식장 그룹 → '예식장'
export type ToggleGainCategory = '스드메' | '예식장';

export type ToggleMeta = {
  id: ToggleId;
  label: string;            // 사용자에게 노출
  desc: string;             // 보조 설명 (예: "본식 당일 헬퍼 동행 서비스")
  group: ToggleGroup;       // UI 4 그룹
  gainCategory: ToggleGainCategory; // 토글 ON 시 가산처
  defaultByType: Record<PersonaType, boolean>;
};

export type ToggleState = Record<ToggleId, boolean>;

// ── STAGE 결과 ──

export type SetupVars = {
  persona: PersonaType;
  region: UserRegion;
  season: Season;
  guests: number;
  budgetTarget: number;     // M1 매핑값 (만원)
  yangga: 0 | 1 | 2;        // M3 매핑
  base: {
    dress: '본식만' | '본식촬영' | '촬영만';
    makeup: '실장' | '부원장' | '원장';
    bonsik: 'venue' | 'pro'; // 예식장 연계 / 외부 전문
  };
  toggleDefaults: ToggleState;
};

export type VenueRecommendation = {
  form: string;
  alt: string;
  reasons: Array<{ label: string; text: string }>;
  pricingAvailable: boolean;
  venueType: VenueType;  // form → 4 베뉴 타입 자동 매핑
};

export type CategoryAmount = {
  category: ResultCategory;
  amount: number;          // 만원
};

export type VenueBreakdown = {
  meal: number;            // 식대
  daegwan: number;         // 대관 (베뉴별 상수, 호텔만 0)
  baseDecoration: number;  // 기본 장식비
  bonsik: number;          // 본식 촬영
  toggleAddOns: number;    // 토글 ON된 예식장 연출/진행 합
  // 식대 산출 근거 표시용
  venueType: VenueType;
  guests: number;          // 사용자 응답 하객 수
  billableGuests: number;  // 실제 식대 청구 기준 (= max(guests, venue.guarantee))
  minGuarantee: number;    // 베뉴별 최소 보증인원
  minGuaranteeApplied: boolean; // 사용자 하객 < 베뉴 보증 → 최소 보증인원으로 계산
  perHead: number;         // 1인당 식대 (지역별)
  rentalNote: string;      // 대관료 sub-text 안내 (베뉴별)
  rentalIsEstimate: boolean; // [추정] 베뉴(하우스·스몰) 여부
};

export type SdmBreakdown = {
  studioBase: number;
  dressBase: number;
  makeupBase: number;
  studioToggles: number;
  dressToggles: number;
  makeupToggles: number;
};

export type BudgetResult = {
  categories: Record<ResultCategory, number>;
  core: number;            // 스드메 + 예식장 (대관료 포함, 표시용)
  coreForDiagnosis: number; // 스드메 + 예식장(대관료 제외) — Phase 1 기존 밴드 안정용
  total: number;           // core + 기타
  toggleDelta: number;     // 토글 ON된 항목 합
  venueDetail: VenueBreakdown;
  sdmDetail: SdmBreakdown;
};

export type ConsistencyStatus = 'WARN' | 'OVER' | 'UNDER' | 'FIT';

export type ConsistencyDiagnosis = {
  status: ConsistencyStatus;
  headline: string;
  body: string;
  band: { min: number; max: number };
};

export type AdviceItem = {
  title: string;
  desc: string;
  amount?: number | null;
};

export type Advice = {
  save: AdviceItem[];
  invest: AdviceItem[];
};

export type ResultPayload = {
  vars: SetupVars;
  venue: VenueRecommendation;
  budget: BudgetResult;
  consistency: ConsistencyDiagnosis;
  advice: Advice;
};

// ── 진단 엔트리 함수 시그니처 ──

export type DiagnoseFn = (
  answers: OnboardingAnswers,
  toggles?: ToggleState
) => ResultPayload;
