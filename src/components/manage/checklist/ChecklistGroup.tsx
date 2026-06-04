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
};

export function ChecklistGroup({ group, checked, onToggle, dynamicItems, highlightedIds, userItems, onAddUserItem, onRemoveUserItem }: Props) {
  const [open, setOpen] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const allStaticItems = group.sections.flatMap((s) => s.items);
  const total = allStaticItems.length + dynamicItems.length + userItems.length;
  const done =
    allStaticItems.filter((item) => checked[item.id]).length +
    dynamicItems.filter((d) => checked[d.id]).length +
    userItems.filter((u) => checked[u.id]).length;

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
  const progress = total > 0 ? (done / total) * 100 : 0;

  return (
    <div className="rounded-2xl border border-[rgba(170,199,225,0.3)] bg-white p-5">
      <button
        type="button"
        className="flex w-full items-center justify-between"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[rgba(170,199,225,0.3)] px-3 py-0.5 text-xs font-medium text-[#364153]">
            {group.timeLabel}
          </span>
          <span className="text-sm font-semibold text-[#1E2939]">{group.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#99A1AF]">
            {done}/{total}
          </span>
          <div className="h-[3px] w-12 overflow-hidden rounded-full bg-[#E5E7EB]">
            <div
              className="h-full rounded-full bg-[#AAC7E1] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          {open ? (
            <ChevronUp size={16} className="text-[#99A1AF]" />
          ) : (
            <ChevronDown size={16} className="text-[#99A1AF]" />
          )}
        </div>
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          {group.sections.map((section) => {
            const sectionDynamic = dynamicItems.filter((d) => d.sectionTitle === section.title);
            return (
              <div key={section.title}>
                <p className="mb-2 text-xs font-medium text-[#6A7282]">{section.title}</p>
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <ChecklistItem
                      key={item.id}
                      item={item}
                      checked={!!checked[item.id]}
                      onToggle={onToggle}
                      highlight={highlightedIds.has(item.id)}
                    />
                  ))}
                  {sectionDynamic.map((item) => (
                    <ChecklistItem
                      key={item.id}
                      item={{ id: item.id, text: item.text }}
                      checked={!!checked[item.id]}
                      onToggle={onToggle}
                      dynamic
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

          {/* 항목 추가 인풋 or 버튼 */}
          {adding ? (
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
              <button
                type="button"
                onClick={submitAdd}
                className="rounded-xl bg-[#373737] px-3 py-2 text-sm font-medium text-white"
              >
                추가
              </button>
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="rounded-xl bg-[#F5F5F5] px-3 py-2 text-sm text-[#666]"
              >
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
          )}
        </div>
      )}
    </div>
  );
}
