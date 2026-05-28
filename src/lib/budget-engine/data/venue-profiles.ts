// 베뉴 타입별 식대 정책 (Result Algorithm v3)
// 출처: 아시아경제, Blind 실계약, 나무위키, 공여사들 결혼비용 가이드 (2026)
// Phase 1: 전국 단일값. Phase 2에서 베뉴 × 지역 격자로 확장 예정.
// [추정] 마킹: 검증 자료 부족 — 업계 통념 기반. 사용자 표시 금액에만 영향, 진단 밴드 비교엔 사용 X.

import type { VenueProfile, VenueType } from '../types';

export const VENUE_PROFILES: Record<VenueType, VenueProfile> = {
  hotel: {
    guarantee: 200,
    rentalFee: 0,
    rentalNote: '호텔은 대관료가 없어요 (식대에 포함된 구조)',
    isEstimate: false,
  },
  hall: {
    guarantee: 200,
    rentalFee: 200,
    rentalNote: '일반 웨딩홀 기본 대관료 (지역·홀에 따라 변동)',
    isEstimate: false,
  },
  house: {
    guarantee: 80,
    rentalFee: 300,
    rentalNote: '[추정] 하우스 웨딩 평균 대관료',
    isEstimate: true,
  },
  small: {
    guarantee: 30,
    rentalFee: 100,
    rentalNote: '[추정] 스몰 베뉴 룸차지·셋업 평균',
    isEstimate: true,
  },
};

// 추천 식장 form 문자열 → VenueType 매핑
// STAGE 4 recommendVenue 결과를 받아 자동 분류 (사용자 추가 질문 없음)
export function mapRecommendationToVenueType(recommendedForm: string): VenueType {
  const f = recommendedForm;
  if (/호텔|5성|특급/.test(f)) return 'hotel';
  if (/일반\s*웨딩홀|컨벤션|예식장|대형/.test(f)) return 'hall';
  if (/하우스/.test(f)) return 'house';
  if (/레스토랑|스몰|가든|채플|소규모/.test(f)) return 'small';
  return 'hall'; // 탐색미결정·미매칭 fallback (가장 보편적)
}
