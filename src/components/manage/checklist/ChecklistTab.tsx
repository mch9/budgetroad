'use client';

import { CHECKLIST_GROUPS } from '@/lib/checklist-data';
import { useChecklistState } from '@/hooks/useChecklistState';
import { ChecklistGroup } from './ChecklistGroup';

export function ChecklistTab() {
  const { checked, toggle, dynamicItems, highlightedIds } = useChecklistState();

  return (
    <div className="space-y-3 px-5 py-4">
      {CHECKLIST_GROUPS.map((group) => (
        <ChecklistGroup
          key={group.id}
          group={group}
          checked={checked}
          onToggle={toggle}
          dynamicItems={dynamicItems.filter((d) => d.groupId === group.id)}
          highlightedIds={highlightedIds}
        />
      ))}
    </div>
  );
}
