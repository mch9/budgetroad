// 25개 추가금 토글 메타 — spec의 "추가금 토글 디폴트" 표 그대로
// 가격은 toggle-prices.ts에서 지역·시즌별로 가져옴 (지역 단가 변동)
// 탐색미결정 유형은 표준실용 fallback

import type { ToggleMeta } from '../types';

export const TOGGLES_META: ToggleMeta[] = [
  // ── [스튜디오] ──
  {
    id: '원본 구매',
    label: '원본 구매',
    desc: '촬영 원본 파일 전체 구매',
    group: '스튜디오',
    gainCategory: '스드메',
    defaultByType: { 전통격식: false, 표준실용: false, 경험연출: true, 본질미니멀: false, 탐색미결정: false },
  },
  {
    id: '담당자 지정',
    label: '담당자 지정',
    desc: '원하는 작가·실장 지정 계약',
    group: '스튜디오',
    gainCategory: '스드메',
    defaultByType: { 전통격식: false, 표준실용: false, 경험연출: true, 본질미니멀: false, 탐색미결정: false },
  },
  {
    id: '서브 스냅',
    label: '서브 스냅',
    desc: '본식 외 보조 스냅 촬영',
    group: '스튜디오',
    gainCategory: '스드메',
    defaultByType: { 전통격식: false, 표준실용: false, 경험연출: true, 본질미니멀: false, 탐색미결정: false },
  },
  {
    id: '야외 촬영',
    label: '야외 촬영',
    desc: '야외 로케이션 추가 촬영',
    group: '스튜디오',
    gainCategory: '스드메',
    defaultByType: { 전통격식: false, 표준실용: false, 경험연출: true, 본질미니멀: false, 탐색미결정: false },
  },
  {
    id: '얼리스타트',
    label: '얼리스타트',
    desc: '새벽·이른 시작 추가 비용',
    group: '스튜디오',
    gainCategory: '스드메',
    defaultByType: { 전통격식: false, 표준실용: false, 경험연출: true, 본질미니멀: false, 탐색미결정: false },
  },

  // ── [드레스] ──
  {
    id: '드레스 지정',
    label: '드레스 지정',
    desc: '기본 외 드레스 선택비',
    group: '드레스',
    gainCategory: '스드메',
    defaultByType: { 전통격식: true, 표준실용: false, 경험연출: true, 본질미니멀: false, 탐색미결정: false },
  },
  {
    id: '본식 헬퍼',
    label: '본식 헬퍼',
    desc: '본식 당일 드레스 도우미',
    group: '드레스',
    gainCategory: '스드메',
    defaultByType: { 전통격식: true, 표준실용: true, 경험연출: true, 본질미니멀: false, 탐색미결정: true },
  },
  {
    id: '2부 드레스',
    label: '2부 드레스',
    desc: '폐백·2부 행사용 드레스',
    group: '드레스',
    gainCategory: '스드메',
    defaultByType: { 전통격식: true, 표준실용: false, 경험연출: true, 본질미니멀: false, 탐색미결정: false },
  },
  {
    id: '퍼스트웨어',
    label: '퍼스트웨어',
    desc: '신부 1차 의상 별도 준비',
    group: '드레스',
    gainCategory: '스드메',
    defaultByType: { 전통격식: false, 표준실용: false, 경험연출: true, 본질미니멀: false, 탐색미결정: false },
  },
  {
    id: '가봉 스냅',
    label: '가봉 스냅',
    desc: '가봉 시 스냅 촬영',
    group: '드레스',
    gainCategory: '스드메',
    defaultByType: { 전통격식: false, 표준실용: false, 경험연출: true, 본질미니멀: false, 탐색미결정: false },
  },
  {
    id: '턱시도 대여',
    label: '턱시도 대여',
    desc: '신랑 턱시도 대여',
    group: '드레스',
    gainCategory: '스드메',
    defaultByType: { 전통격식: true, 표준실용: true, 경험연출: true, 본질미니멀: true, 탐색미결정: true },
  },

  // ── [메이크업] ──
  {
    id: '혼주 메이크업',
    label: '혼주 메이크업',
    desc: '양가 혼주 헤어·메이크업',
    group: '메이크업',
    gainCategory: '스드메',
    defaultByType: { 전통격식: true, 표준실용: false, 경험연출: false, 본질미니멀: false, 탐색미결정: false },
  },
  {
    id: '헤어변형',
    label: '헤어변형',
    desc: '본식 중 헤어스타일 변경',
    group: '메이크업',
    gainCategory: '스드메',
    defaultByType: { 전통격식: false, 표준실용: false, 경험연출: true, 본질미니멀: false, 탐색미결정: false },
  },

  // ── [예식장 연출] ──
  {
    id: '생화 꽃장식',
    label: '생화 꽃장식',
    desc: '생화 데코 (지역별 단가)',
    group: '예식장',
    gainCategory: '예식장',
    defaultByType: { 전통격식: true, 표준실용: false, 경험연출: true, 본질미니멀: false, 탐색미결정: false },
  },
  {
    id: '부케',
    label: '부케',
    desc: '신부 부케',
    group: '예식장',
    gainCategory: '예식장',
    defaultByType: { 전통격식: true, 표준실용: true, 경험연출: true, 본질미니멀: true, 탐색미결정: true },
  },
  {
    id: '플라워 샤워',
    label: '플라워 샤워',
    desc: '식 후 플라워 샤워 연출',
    group: '예식장',
    gainCategory: '예식장',
    defaultByType: { 전통격식: false, 표준실용: false, 경험연출: true, 본질미니멀: false, 탐색미결정: false },
  },
  {
    id: '포토테이블',
    label: '포토테이블',
    desc: '사진 디스플레이 테이블',
    group: '예식장',
    gainCategory: '예식장',
    defaultByType: { 전통격식: true, 표준실용: false, 경험연출: true, 본질미니멀: false, 탐색미결정: false },
  },
  {
    id: '웨딩 케이크',
    label: '웨딩 케이크',
    desc: '컷팅용 웨딩 케이크',
    group: '예식장',
    gainCategory: '예식장',
    defaultByType: { 전통격식: true, 표준실용: true, 경험연출: true, 본질미니멀: false, 탐색미결정: true },
  },

  // ── [예식장 진행·가족] (UI 그룹은 '예식장'에 통합) ──
  {
    id: '본식 사회자',
    label: '본식 사회자',
    desc: '전문 사회자 섭외',
    group: '예식장',
    gainCategory: '예식장',
    defaultByType: { 전통격식: true, 표준실용: true, 경험연출: false, 본질미니멀: false, 탐색미결정: true },
  },
  {
    id: '주례',
    label: '주례',
    desc: '주례 섭외',
    group: '예식장',
    gainCategory: '예식장',
    defaultByType: { 전통격식: true, 표준실용: false, 경험연출: false, 본질미니멀: false, 탐색미결정: false },
  },
  {
    id: '축하공연 섭외',
    label: '축하공연 섭외',
    desc: '축가·라이브 공연',
    group: '예식장',
    gainCategory: '예식장',
    defaultByType: { 전통격식: true, 표준실용: false, 경험연출: false, 본질미니멀: false, 탐색미결정: false },
  },
  {
    id: '본식 도우미',
    label: '본식 도우미',
    desc: '본식 진행 도우미',
    group: '예식장',
    gainCategory: '예식장',
    defaultByType: { 전통격식: true, 표준실용: true, 경험연출: true, 본질미니멀: false, 탐색미결정: true },
  },
  {
    id: '폐백 음식',
    label: '폐백 음식',
    desc: '폐백 상차림',
    group: '예식장',
    gainCategory: '예식장',
    defaultByType: { 전통격식: true, 표준실용: false, 경험연출: false, 본질미니멀: false, 탐색미결정: false },
  },
  {
    id: '폐백 수모',
    label: '폐백 수모',
    desc: '폐백 진행 도우미',
    group: '예식장',
    gainCategory: '예식장',
    defaultByType: { 전통격식: true, 표준실용: false, 경험연출: false, 본질미니멀: false, 탐색미결정: false },
  },
  {
    id: '한복 대여',
    label: '한복 대여',
    desc: '양가 한복 대여',
    group: '예식장',
    gainCategory: '예식장',
    defaultByType: { 전통격식: true, 표준실용: false, 경험연출: false, 본질미니멀: false, 탐색미결정: false },
  },
];

// 빠른 lookup용 Map
export const TOGGLES_BY_ID = new Map(TOGGLES_META.map((t) => [t.id, t] as const));
