import type { ResultCategory } from '@/lib/budget-engine';

// 도넛/레전드 카테고리 색 — 단일 accent 톤 그라데이션. tab-itemized와 share-card 공유.
export const CATEGORY_COLORS: Record<ResultCategory, string> = {
  예식장: '#AAC7E1',
  스드메: '#7499BA',
  '예물·예단': '#CEE7FE',
  혼수: '#B8D4E8',
  신혼여행: '#9BB8D4',
};
