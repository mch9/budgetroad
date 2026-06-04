'use client';

import { useState, useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ChecklistGroup as ChecklistGroupType } from '@/lib/checklist-data';
import type { DynamicChecklistItem, UserChecklistItem } from '@/hooks/useChecklistState';
import { ChecklistItem } from './ChecklistItem';

type Props = {
  group: ChecklistGroupType;
  checked: Record<string, boolean>;
  onToggle: (id: string) => void;
  dynamicItems: DynamicChecklistItem[];
  highlightedIds: Set<string>;
  userItems: UserChecklistItem[];
  onAddUserItem: (text: string, groupId: string) => void;
  onRemoveUserItem: (id: string) => void;
  hiddenIds: Set<string>;
  onHideItem: (id: string) => void;
};

export function ChecklistGroup({
  group, checked, onToggle, dynamicItems, highlightedIds,
  userItems, onAddUserItem, onRemoveUserItem, hiddenIds, onHideItem,
}: Props) {
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const allStaticItems = group.sections.flatMap((s) => s.items);
  const visibleStatic = allStaticItems.filter((i) => !hiddenIds.has(i.id));
  const visibleDynamic = dynamicItems.filter((d) => !hiddenIds.has(d.id));

  const total = visibleStatic.length + visibleDynamic.length + userItems.length;
  const done =
    visibleStatic.filter((i) => checked[i.id]).length +
    visibleDynamic.filter((d) => checked[d.id]).length +
    userItems.filter((u) => checked[u.id]).length;
  const progress = total > 0 ? (done / total) * 100 : 0;

  function openAdding() {
    setAdding(true);
    setNewText('');
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function submitAdd() {
    if (!newText.trim()) { setAdding(false); return; }
    onAddUserItem(newText.trim(), group.id);
    setNewText('');
    setAdding(false);
  }

  function toggleEditing() {
    setEditing((v) => !v);
    if (adding) setAdding(false);
  }

  function hideAll() {
    visibleStatic.forEach((i) => onHideItem(i.id));
    visibleDynamic.forEach((d) => onHideItem(d.id));
    userItems.forEach((u) => onRemoveUserItem(u.id));
    setEditing(false);
  }

  return (
    <div className="rounded-2xl border border-[rgba(170,199,225,0.3)] bg-white p-5">
      {/* 헤더 — button 중첩 방지를 위해 div로 래핑 */}
      <div className="flex w-full items-center justify-between">
        <button
          type="button"
          className="flex flex-1 items-center gap-2 text-left"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="rounded-full bg-[rgba(170,199,225,0.3)] px-3 py-0.5 text-xs font-medium text-[#364153]">
            {group.timeLabel}
          </span>
          <span className="text-sm font-semibold text-[#1E2939]">{group.title}</span>
        </button>

        <div className="flex items-center gap-2">
          {open && (
            <button
              type="button"
              onClick={toggleEditing}
              className={`text-xs font-medium transition-colors ${editing ? 'text-[#7499BA]' : 'text-[#C4C9D4] hover:text-[#99A1AF]'}`}
            >
              {editing ? '완료' : '편집'}
            </button>
          )}
          <span className="text-xs text-[#99A1AF]">{done}/{total}</span>
          <div className="h-[3px] w-12 overflow-hidden rounded-full bg-[#E5E7EB]">
            <div className="h-full rounded-full bg-[#AAC7E1] transition-all" style={{ width: `${progress}%` }} />
          </div>
          <button type="button" onClick={() => setOpen((v) => !v)}>
            {open
              ? <ChevronUp size={16} className="text-[#99A1AF]" />
              : <ChevronDown size={16} className="text-[#99A1AF]" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-4 space-y-4">
          {/* 편집 모드 — 모두 제거 */}
          {editing && total > 0 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={hideAll}
                className="text-xs text-red-400 transition-colors hover:text-red-500"
              >
                모두 제거
              </button>
            </div>
          )}

          {group.sections.map((section) => {
            const sectionDynamic = visibleDynamic.filter((d) => d.sectionTitle === section.title);
            const sectionStatic = section.items.filter((i) => !hiddenIds.has(i.id));
            if (sectionStatic.length === 0 && sectionDynamic.length === 0) return null;
            return (
              <div key={section.title}>
                <p className="mb-2 text-xs font-medium text-[#6A7282]">{section.title}</p>
                <div className="space-y-0.5">
                  {sectionStatic.map((item) => (
                    <ChecklistItem
                      key={item.id}
                      item={item}
                      checked={!!checked[item.id]}
                      onToggle={onToggle}
                      highlight={highlightedIds.has(item.id)}
                      onDelete={editing ? () => onHideItem(item.id) : undefined}
                    />
                  ))}
                  {sectionDynamic.map((item) => (
                    <ChecklistItem
                      key={item.id}
                      item={{ id: item.id, text: item.text }}
                      checked={!!checked[item.id]}
                      onToggle={onToggle}
                      dynamic
                      onDelete={editing ? () => onHideItem(item.id) : undefined}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* 직접 추가한 항목 */}
          {userItems.length > 0 && (
            <div className="space-y-0.5">
              {userItems.map((item) => (
                <ChecklistItem
                  key={item.id}
                  item={{ id: item.id, text: item.text }}
                  checked={!!checked[item.id]}
                  onToggle={onToggle}
                  onDelete={() => onRemoveUserItem(item.id)}
                />
              ))}
            </div>
          )}

          {/* 항목 추가 */}
          {!editing && (
            adding ? (
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') submitAdd(); if (e.key === 'Escape') setAdding(false); }}
                  placeholder="항목 이름 입력"
                  className="flex-1 rounded-xl border border-[#AAC7E1] px-3 py-2 text-sm outline-none"
                />
                <button type="button" onClick={submitAdd} className="rounded-xl bg-[#373737] px-3 py-2 text-sm font-medium text-white">
                  추가
                </button>
                <button type="button" onClick={() => setAdding(false)} className="rounded-xl bg-[#F5F5F5] px-3 py-2 text-sm text-[#666]">
                  취소
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openAdding}
                className="w-full rounded-xl border border-dashed border-[#D1D5DC] py-2 text-sm text-[#99A1AF] transition-colors hover:border-[#AAC7E1] hover:text-[#7499BA]"
              >
                + 항목 추가
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
