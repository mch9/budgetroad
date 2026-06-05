'use client';

import { useEffect, useState } from 'react';
import type { ToggleState } from '@/lib/budget-engine';
import { TOGGLE_CHECKLIST_MAP, PERSONA_HIDDEN_DEFAULT } from '@/lib/checklist-data';
import { scoreAxis, classifyPersona } from '@/lib/onboarding-v6';
import type { OnboardingAnswers } from '@/lib/onboarding-v6';
import { STORAGE_KEYS } from '@/lib/storage-keys';
import { trackEvent } from '@/lib/gtag';


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
      const raw = localStorage.getItem(STORAGE_KEYS.CHECKLIST);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setChecked(JSON.parse(raw) as CheckedState);
    } catch { /* ignore */ }

    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CHECKLIST_USER);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setUserItems(JSON.parse(raw) as UserChecklistItem[]);
    } catch { /* ignore */ }

    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CHECKLIST_HIDDEN);
      if (raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHiddenIds(new Set(JSON.parse(raw) as string[]));
      } else {
        // 첫 방문: 페르소나 기반 기본 숨김 적용
        const sessionRaw = localStorage.getItem(STORAGE_KEYS.MANAGE_SESSION);
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
            try { localStorage.setItem(STORAGE_KEYS.CHECKLIST_HIDDEN, JSON.stringify([...initial])); } catch { /* ignore */ }
          }
        }
      }
    } catch { /* ignore */ }

    try {
      const session = localStorage.getItem(STORAGE_KEYS.MANAGE_SESSION);
      if (session) {
        const { toggles } = JSON.parse(session) as { toggles: ToggleState };
        if (!toggles) return;

        let localChecked: Record<string, boolean> = {};
        try {
          const raw = localStorage.getItem(STORAGE_KEYS.CHECKLIST);
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
    // 네모 체크박스(일반 모드) 완료/해제 — checked는 토글 후 새 값
    trackEvent('checklist_item_toggled', { item_id: itemId, checked: checked[itemId] ? 0 : 1 });
    setChecked((prev: CheckedState) => {
      const next = { ...prev, [itemId]: !prev[itemId] };
      try {
        localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(next));
      } catch { /* ignore */ }
      return next;
    });
  }

  function addUserItem(text: string, groupId: string): string {
    trackEvent('checklist_item_added', { group: groupId });
    const id = `user-cl-${Date.now()}`;
    setUserItems((prev) => {
      const next = [...prev, { id, text, groupId }];
      try { localStorage.setItem(STORAGE_KEYS.CHECKLIST_USER, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
    return id;
  }

  function removeUserItem(id: string) {
    trackEvent('checklist_item_removed', { kind: 'user' });
    setUserItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      try { localStorage.setItem(STORAGE_KEYS.CHECKLIST_USER, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
    setChecked((prev) => {
      const next = { ...prev };
      delete next[id];
      try { localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }

  function hideItem(id: string) {
    trackEvent('checklist_item_removed', { kind: 'preset' });
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      try { localStorage.setItem(STORAGE_KEYS.CHECKLIST_HIDDEN, JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CHECKLIST_USER_HIDDEN);
      const prev: string[] = raw ? (JSON.parse(raw) as string[]) : [];
      if (!prev.includes(id)) {
        localStorage.setItem(STORAGE_KEYS.CHECKLIST_USER_HIDDEN, JSON.stringify([...prev, id]));
      }
    } catch { /* ignore */ }
  }

  function unhideAll() {
    setHiddenIds(new Set());
    try { localStorage.setItem(STORAGE_KEYS.CHECKLIST_HIDDEN, JSON.stringify([])); } catch { /* ignore */ }
    try { localStorage.setItem(STORAGE_KEYS.CHECKLIST_USER_HIDDEN, JSON.stringify([])); } catch { /* ignore */ }
  }

  return { checked, toggle, dynamicItems, highlightedIds, preservedIds, userItems, addUserItem, removeUserItem, hiddenIds, hideItem, unhideAll };
}
