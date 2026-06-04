'use client';

import { useEffect, useState } from 'react';
import type { ToggleState } from '@/lib/budget-engine';
import { TOGGLE_CHECKLIST_MAP, PERSONA_HIDDEN_DEFAULT } from '@/lib/checklist-data';
import { scoreAxis, classifyPersona } from '@/lib/onboarding-v6';
import type { OnboardingAnswers } from '@/lib/onboarding-v6';

const STORAGE_KEY = 'budgetroad_checklist';
const SESSION_KEY = 'budgetroad_manage_session';
const USER_ITEMS_KEY = 'budgetroad_checklist_user';
const HIDDEN_KEY = 'budgetroad_checklist_hidden';
const USER_HIDDEN_KEY = 'budgetroad_checklist_user_hidden';

type CheckedState = Record<string, boolean>;

export type DynamicChecklistItem = {
  id: string;
  text: string;
  groupId: string;
  sectionTitle: string;
};

export type UserChecklistItem = {
  id: string;
  text: string;
  groupId: string;
};

export function useChecklistState() {
  const [checked, setChecked] = useState<CheckedState>({});
  const [dynamicItems, setDynamicItems] = useState<DynamicChecklistItem[]>([]);
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());
  const [preservedIds, setPreservedIds] = useState<Set<string>>(new Set());
  const [userItems, setUserItems] = useState<UserChecklistItem[]>([]);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setChecked(JSON.parse(raw) as CheckedState);
    } catch { /* ignore */ }

    try {
      const raw = localStorage.getItem(USER_ITEMS_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setUserItems(JSON.parse(raw) as UserChecklistItem[]);
    } catch { /* ignore */ }

    try {
      const raw = localStorage.getItem(HIDDEN_KEY);
      if (raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHiddenIds(new Set(JSON.parse(raw) as string[]));
      } else {
        // 첫 방문: 페르소나 기반 기본 숨김 적용
        const sessionRaw = localStorage.getItem(SESSION_KEY);
        if (sessionRaw) {
          const parsed = JSON.parse(sessionRaw) as { answers?: OnboardingAnswers; toggles?: ToggleState };
          if (parsed.answers) {
            const persona = classifyPersona(scoreAxis(parsed.answers));
            const defaults = PERSONA_HIDDEN_DEFAULT[persona] ?? [];
            // T3: 토글 ON으로 highlight된 항목은 숨김에서 제외
            const activeToggleIds = new Set(
              TOGGLE_CHECKLIST_MAP
                .filter((e): e is Extract<typeof e, { type: 'highlight' }> =>
                  e.type === 'highlight' && !!(parsed.toggles?.[e.toggleId as keyof ToggleState]))
                .map((e) => e.existingItemId),
            );
            const initial = new Set(defaults.filter((id) => !activeToggleIds.has(id)));
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setHiddenIds(initial);
            try { localStorage.setItem(HIDDEN_KEY, JSON.stringify([...initial])); } catch { /* ignore */ }
          }
        }
      }
    } catch { /* ignore */ }

    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        const { toggles } = JSON.parse(session) as { toggles: ToggleState };
        if (!toggles) return;

        let localChecked: Record<string, boolean> = {};
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) localChecked = JSON.parse(raw) as Record<string, boolean>;
        } catch { /* ignore */ }

        const items: DynamicChecklistItem[] = [];
        const ids = new Set<string>();
        const preserved = new Set<string>();
        for (const entry of TOGGLE_CHECKLIST_MAP) {
          if (!toggles[entry.toggleId as keyof ToggleState]) {
            if (entry.type !== 'highlight') {
              const itemId = `toggle-${entry.toggleId}`;
              if (localChecked[itemId]) {
                items.push({ id: itemId, text: entry.text, groupId: entry.groupId, sectionTitle: entry.sectionTitle });
                preserved.add(itemId);
              }
            }
            continue;
          }
          if (entry.type === 'highlight') {
            ids.add(entry.existingItemId);
          } else {
            items.push({
              id: `toggle-${entry.toggleId}`,
              text: entry.text,
              groupId: entry.groupId,
              sectionTitle: entry.sectionTitle,
            });
          }
        }
        setDynamicItems(items);
        setHighlightedIds(ids);
        setPreservedIds(preserved);
      }
    } catch { /* ignore */ }
  }, []);

  function toggle(itemId: string) {
    setChecked((prev: CheckedState) => {
      const next = { ...prev, [itemId]: !prev[itemId] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch { /* ignore */ }
      return next;
    });
  }

  function addUserItem(text: string, groupId: string) {
    const id = `user-cl-${Date.now()}`;
    console.log('[addUserItem] called', { text, groupId, id });
    setUserItems((prev) => {
      const next = [...prev, { id, text, groupId }];
      console.log('[addUserItem] setUserItems', { prevLen: prev.length, nextLen: next.length });
      try { localStorage.setItem(USER_ITEMS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }

  function removeUserItem(id: string) {
    setUserItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      try { localStorage.setItem(USER_ITEMS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
    setChecked((prev) => {
      const next = { ...prev };
      delete next[id];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }

  function hideItem(id: string) {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      try { localStorage.setItem(HIDDEN_KEY, JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
    try {
      const raw = localStorage.getItem(USER_HIDDEN_KEY);
      const prev: string[] = raw ? (JSON.parse(raw) as string[]) : [];
      if (!prev.includes(id)) {
        localStorage.setItem(USER_HIDDEN_KEY, JSON.stringify([...prev, id]));
      }
    } catch { /* ignore */ }
  }

  function unhideAll() {
    setHiddenIds(new Set());
    try { localStorage.setItem(HIDDEN_KEY, JSON.stringify([])); } catch { /* ignore */ }
    try { localStorage.setItem(USER_HIDDEN_KEY, JSON.stringify([])); } catch { /* ignore */ }
  }

  return { checked, toggle, dynamicItems, highlightedIds, preservedIds, userItems, addUserItem, removeUserItem, hiddenIds, hideItem, unhideAll };
}
