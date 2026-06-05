import { describe, it, expect } from 'vitest';
import { filterCategoryToLabel } from '../useBudgetTrackingState';

describe('filterCategoryToLabel', () => {
  it('venue → 예식장', () => expect(filterCategoryToLabel('venue')).toBe('예식장'));
  it('studio → 스드메', () => expect(filterCategoryToLabel('studio')).toBe('스드메'));
  it('dress → 스드메', () => expect(filterCategoryToLabel('dress')).toBe('스드메'));
  it('makeup → 스드메', () => expect(filterCategoryToLabel('makeup')).toBe('스드메'));
  it('other → 기타', () => expect(filterCategoryToLabel('other')).toBe('기타'));
});
