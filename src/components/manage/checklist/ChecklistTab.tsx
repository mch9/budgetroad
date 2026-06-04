'use client';

import { CHECKLIST_GROUPS } from '@/lib/checklist-data';
import { useChecklistState } from '@/hooks/useChecklistState';
import { ChecklistGroup } from './ChecklistGroup';

export function ChecklistTab() {
  const { checked, toggle, dynamicItems, highlightedIds, preservedIds, userItems, addUserItem, removeUserItem, hiddenIds, hideItem, unhideAll } = useChecklistState();

  return (
    <div className="space-y-3 px-5 py-4">
      {hiddenIds.size > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-[rgba(170,199,225,0.12)] px-4 py-2.5">
          <p className="text-xs text-[#7499BA]">숨겨진 항목 {hiddenIds.size}개</p>
          <button
            type="button"
            onClick={unhideAll}
            className="text-xs font-medium text-[#7499BA] underline underline-offset-2"
          >
            전체 보기
          </button>
        </div>
      )}
      {CHECKLIST_GROUPS.map((group) => (
        <ChecklistGroup
          key={group.id}
          group={group}
          checked={checked}
          onToggle={toggle}
          dynamicItems={dynamicItems.filter((d) => d.groupId === group.id)}
          highlightedIds={highlightedIds}
          preservedIds={preservedIds}
          userItems={userItems.filter((u) => u.groupId === group.id)}
          onAddUserItem={addUserItem}
          onRemoveUserItem={removeUserItem}
          hiddenIds={hiddenIds}
          onHideItem={hideItem}
        />
      ))}
    </div>
  );
}
