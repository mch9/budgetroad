// @vitest-environment happy-dom

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChecklistState } from '@/hooks/useChecklistState';
import { STORAGE_KEYS } from '@/lib/storage-keys';
import { TOGGLE_CHECKLIST_MAP } from '@/lib/checklist-data';
import type { OnboardingAnswers } from '@/lib/onboarding-v6';
import { TOGGLES_META } from '@/lib/budget-engine';
import type { ToggleState } from '@/lib/budget-engine';

// ── helpers ──────────────────────────────────────────────────────────────────

function makeAnswers(overrides: Partial<OnboardingAnswers> = {}): OnboardingAnswers {
  return {
    Q1: 'A', Q2: 'A', Q3: 'A', Q4: 'A', Q7: 'A', Q8: 'A',
    T2: 'A', T5: 'A', T7: 'A',
    M1: 'C', M2: 'C', M3: 'B', M4: 'A', M5: 'A',
    ...overrides,
  };
}

function allTogglesOff(): ToggleState {
  return Object.fromEntries(TOGGLES_META.map((m) => [m.id, false])) as ToggleState;
}

function setSession(togglesOverride: Partial<ToggleState> = {}) {
  const toggles = { ...allTogglesOff(), ...togglesOverride };
  localStorage.setItem(
    STORAGE_KEYS.MANAGE_SESSION,
    JSON.stringify({ answers: makeAnswers(), toggles }),
  );
}

function renderChecklist() {
  return renderHook(() => useChecklistState());
}

// ── setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.clearAllMocks();
});

// ── 1. 토글 inject 동작 ───────────────────────────────────────────────────────

describe('토글 inject 동작', () => {
  // TOGGLE_CHECKLIST_MAP에서 inject 타입 첫 번째 항목을 대표로 사용
  const injectEntry = TOGGLE_CHECKLIST_MAP.find((e) => e.type === 'inject')!;

  it('토글 ON → dynamicItems에 inject 항목 포함', () => {
    setSession({ [injectEntry.toggleId]: true });
    const { result } = renderChecklist();
    const found = result.current.dynamicItems.find(
      (i) => i.text === injectEntry.text && i.groupId === injectEntry.groupId,
    );
    expect(found).toBeDefined();
  });

  it('토글 OFF → dynamicItems에 inject 항목 없음', () => {
    setSession({ [injectEntry.toggleId]: false });
    const { result } = renderChecklist();
    const found = result.current.dynamicItems.find((i) => i.text === injectEntry.text);
    expect(found).toBeUndefined();
  });

  it('inject 항목 id는 toggle-{toggleId} 패턴', () => {
    setSession({ [injectEntry.toggleId]: true });
    const { result } = renderChecklist();
    const found = result.current.dynamicItems.find((i) => i.text === injectEntry.text);
    expect(found?.id).toBe(`toggle-${injectEntry.toggleId}`);
  });
});

// ── 2. 토글 highlight 동작 ────────────────────────────────────────────────────

describe('토글 highlight 동작', () => {
  const hlEntry = TOGGLE_CHECKLIST_MAP.find(
    (e): e is Extract<typeof e, { type: 'highlight' }> => e.type === 'highlight',
  )!;

  it('토글 ON → highlightedIds에 existingItemId 포함', () => {
    setSession({ [hlEntry.toggleId]: true });
    const { result } = renderChecklist();
    expect(result.current.highlightedIds.has(hlEntry.existingItemId)).toBe(true);
  });

  it('토글 OFF → highlightedIds에 existingItemId 없음', () => {
    setSession({ [hlEntry.toggleId]: false });
    const { result } = renderChecklist();
    expect(result.current.highlightedIds.has(hlEntry.existingItemId)).toBe(false);
  });

  it('highlight 토글은 dynamicItems에 새 항목 추가하지 않음', () => {
    setSession({ [hlEntry.toggleId]: true });
    const { result } = renderChecklist();
    const injected = result.current.dynamicItems.find(
      (i) => i.id === `toggle-${hlEntry.toggleId}`,
    );
    expect(injected).toBeUndefined();
  });
});

// ── 3. preserved 동작 (토글 OFF지만 완료한 inject 항목) ───────────────────────

describe('preserved 동작', () => {
  const injectEntry = TOGGLE_CHECKLIST_MAP.find((e) => e.type === 'inject')!;
  const itemId = `toggle-${injectEntry.toggleId}`;

  it('토글 OFF이고 체크됐던 inject 항목 → preservedIds에 포함 + dynamicItems에 유지', () => {
    // 체크 상태 저장 (해당 항목이 이전에 체크됐다고 가정)
    localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify({ [itemId]: true }));
    // 토글은 OFF
    setSession({ [injectEntry.toggleId]: false });

    const { result } = renderChecklist();

    expect(result.current.preservedIds.has(itemId)).toBe(true);
    const found = result.current.dynamicItems.find((i) => i.id === itemId);
    expect(found).toBeDefined();
  });

  it('토글 OFF이고 체크 안 된 inject 항목 → preserved 아님, dynamicItems에도 없음', () => {
    setSession({ [injectEntry.toggleId]: false });

    const { result } = renderChecklist();

    expect(result.current.preservedIds.has(itemId)).toBe(false);
    const found = result.current.dynamicItems.find((i) => i.id === itemId);
    expect(found).toBeUndefined();
  });
});

// ── 4. userItems 추가/삭제 ────────────────────────────────────────────────────

describe('userItems 추가/삭제', () => {
  it('addUserItem → userItems에 즉시 반영', async () => {
    const { result } = renderChecklist();
    let id: string;
    await act(async () => {
      id = result.current.addUserItem('테스트 항목', 'group-sdm');
    });
    const found = result.current.userItems.find((i) => i.id === id!);
    expect(found).toMatchObject({ text: '테스트 항목', groupId: 'group-sdm' });
  });

  it('addUserItem → localStorage CHECKLIST_USER에 저장', async () => {
    const { result } = renderChecklist();
    await act(async () => {
      result.current.addUserItem('항목A', 'group-sdm');
    });
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECKLIST_USER)!);
    expect(stored).toHaveLength(1);
    expect(stored[0].text).toBe('항목A');
  });

  it('removeUserItem → userItems에서 제거', async () => {
    const { result } = renderChecklist();
    let id: string;
    await act(async () => {
      id = result.current.addUserItem('삭제할 항목', 'group-sdm');
    });
    await act(async () => {
      result.current.removeUserItem(id!);
    });
    expect(result.current.userItems.find((i) => i.id === id!)).toBeUndefined();
  });

  it('removeUserItem → localStorage CHECKLIST_USER에서도 제거', async () => {
    const { result } = renderChecklist();
    let id: string;
    await act(async () => {
      id = result.current.addUserItem('삭제할 항목', 'group-sdm');
    });
    await act(async () => {
      result.current.removeUserItem(id!);
    });
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECKLIST_USER) ?? '[]');
    expect(stored.find((i: { id: string }) => i.id === id!)).toBeUndefined();
  });

  it('removeUserItem → checked에서도 해당 id 제거', async () => {
    const { result } = renderChecklist();
    let id: string;
    await act(async () => {
      id = result.current.addUserItem('항목', 'group-sdm');
    });
    // 체크 후 삭제
    await act(async () => {
      result.current.toggle(id!);
    });
    await act(async () => {
      result.current.removeUserItem(id!);
    });
    expect(result.current.checked[id!]).toBeUndefined();
  });
});

// ── 5. 3레이어 핵심 불변: userItems는 토글 재계산에 영향받지 않음 ──────────────

describe('3레이어 불변 — userItems ↔ 토글 독립성', () => {
  it('userItems는 MANAGE_SESSION이 없어도 독립적으로 복원됨', () => {
    // 세션 없음 (토글 레이어 없음)
    localStorage.setItem(
      STORAGE_KEYS.CHECKLIST_USER,
      JSON.stringify([{ id: 'user-cl-1', text: '내 항목', groupId: 'group-sdm' }]),
    );
    const { result } = renderChecklist();
    expect(result.current.userItems).toHaveLength(1);
    expect(result.current.userItems[0].text).toBe('내 항목');
  });

  it('세션이 있을 때도 userItems와 dynamicItems는 독립적으로 공존', () => {
    const injectEntry = TOGGLE_CHECKLIST_MAP.find((e) => e.type === 'inject')!;
    setSession({ [injectEntry.toggleId]: true });
    localStorage.setItem(
      STORAGE_KEYS.CHECKLIST_USER,
      JSON.stringify([{ id: 'user-cl-99', text: '내 항목', groupId: 'group-sdm' }]),
    );

    const { result } = renderChecklist();

    // 토글 inject 항목 존재
    expect(result.current.dynamicItems.some((i) => i.text === injectEntry.text)).toBe(true);
    // 사용자 항목도 그대로 존재
    expect(result.current.userItems.some((i) => i.id === 'user-cl-99')).toBe(true);
  });

  it('userItems id는 toggle- 접두사를 가지지 않음 (레이어 혼동 방지)', async () => {
    const { result } = renderChecklist();
    let id: string;
    await act(async () => {
      id = result.current.addUserItem('사용자 항목', 'group-sdm');
    });
    expect(id!.startsWith('user-cl-')).toBe(true);
    expect(id!.startsWith('toggle-')).toBe(false);
  });
});

// ── 6. localStorage 왕복 저장·복원 ───────────────────────────────────────────

describe('localStorage 왕복', () => {
  it('toggle() 호출 후 checked 상태가 localStorage에 저장됨', async () => {
    setSession();
    const { result } = renderChecklist();
    await act(async () => {
      result.current.toggle('hall-1');
    });
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECKLIST) ?? '{}');
    expect(stored['hall-1']).toBe(true);
  });

  it('localStorage에 저장된 checked가 재마운트 시 복원됨', async () => {
    localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify({ 'hall-1': true, 'hall-2': false }));
    const { result } = renderChecklist();
    expect(result.current.checked['hall-1']).toBe(true);
    expect(result.current.checked['hall-2']).toBe(false);
  });

  it('hideItem → hiddenIds에 추가되고 localStorage에 저장', async () => {
    const { result } = renderChecklist();
    await act(async () => {
      result.current.hideItem('hall-1');
    });
    expect(result.current.hiddenIds.has('hall-1')).toBe(true);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECKLIST_HIDDEN) ?? '[]');
    expect(stored).toContain('hall-1');
  });

  it('unhideAll → hiddenIds 비워지고 localStorage 초기화', async () => {
    localStorage.setItem(STORAGE_KEYS.CHECKLIST_HIDDEN, JSON.stringify(['hall-1', 'hall-2']));
    const { result } = renderChecklist();
    await act(async () => {
      result.current.unhideAll();
    });
    expect(result.current.hiddenIds.size).toBe(0);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECKLIST_HIDDEN) ?? '["not-empty"]');
    expect(stored).toHaveLength(0);
  });
});
