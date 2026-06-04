'use client';

import { useEffect, useState } from 'react';
import type { ToggleState } from '@/lib/budget-engine';
import { TOGGLE_CHECKLIST_MAP } from '@/lib/checklist-data';

const STORAGE_KEY = 'budgetroad_checklist';
const SESSION_KEY = 'budgetroad_manage_session';
const USER_ITEMS_KEY = 'budgetroad_checklist_user';

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
  const [userItems, setUserItems] = useState<UserChecklistItem[]>([]);

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
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        const { toggles } = JSON.parse(session) as { toggles: ToggleState };
        if (!toggles) return;
        const items: DynamicChecklistItem[] = [];
        const ids = new Set<string>();
        for (const entry of TOGGLE_CHECKLIST_MAP) {
          if (!toggles[entry.toggleId as keyof ToggleState]) continue;
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
    setUserItems((prev) => {
      const next = [...prev, { id, text, groupId }];
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

  return { checked, toggle, dynamicItems, highlightedIds, userItems, addUserItem, removeUserItem };
}
