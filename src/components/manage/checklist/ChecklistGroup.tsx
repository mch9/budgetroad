'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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

type FlatItem = { id: string; text: string; highlight?: boolean; isDynamic?: boolean };

function SortableRow({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-1 ${isDragging ? 'opacity-50' : ''}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab touch-none p-1 text-[#D1D5DC] active:cursor-grabbing"
        aria-label="순서 변경"
      >
        <GripVertical size={16} />
      </button>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export function ChecklistGroup({
  group, checked, onToggle, dynamicItems, highlightedIds,
  userItems, onAddUserItem, onRemoveUserItem, hiddenIds, onHideItem,
}: Props) {
  const storageKey = `budgetroad_checklist_order_${group.id}`;

  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [localOrder, setLocalOrder] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setLocalOrder(JSON.parse(raw) as string[]);
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const visibleStatic = group.sections.flatMap((s) => s.items).filter((i) => !hiddenIds.has(i.id));
  const visibleDynamic = dynamicItems.filter((d) => !hiddenIds.has(d.id));

  // flat list combining all visible items
  const allFlat: FlatItem[] = [
    ...visibleStatic.map((i) => ({ id: i.id, text: i.text, highlight: highlightedIds.has(i.id) })),
    ...visibleDynamic.map((d) => ({ id: d.id, text: d.text, isDynamic: true })),
    ...userItems.map((u) => ({ id: u.id, text: u.text })),
  ];

  const applyOrder = useCallback(<T extends { id: string }>(items: T[]): T[] => {
    if (localOrder.length === 0) return items;
    const inOrder = localOrder.map((id) => items.find((i) => i.id === id)).filter(Boolean) as T[];
    const rest = items.filter((i) => !localOrder.includes(i.id));
    return [...inOrder, ...rest];
  }, [localOrder]);

  const orderedFlat = applyOrder(allFlat);
  const orderedIds = orderedFlat.map((i) => i.id);

  const total = orderedIds.length;
  const done = orderedFlat.filter((i) => checked[i.id]).length;
  const progress = total > 0 ? (done / total) * 100 : 0;

  const allSelected = total > 0 && orderedIds.every((id) => selectedIds.has(id));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedIds.indexOf(active.id as string);
    const newIndex = orderedIds.indexOf(over.id as string);
    const newIds = arrayMove(orderedIds, oldIndex, newIndex);
    setLocalOrder(newIds);
    try { localStorage.setItem(storageKey, JSON.stringify(newIds)); } catch { /* ignore */ }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(allSelected ? new Set() : new Set(orderedIds));
  }

  function deleteSelected() {
    const remaining = orderedIds.filter((id) => !selectedIds.has(id));
    selectedIds.forEach((id) => {
      if (userItems.some((u) => u.id === id)) onRemoveUserItem(id);
      else onHideItem(id);
    });
    setSelectedIds(new Set());
    if (remaining.length === 0) setEditing(false);
  }

  function toggleEditing() {
    setEditing((v) => !v);
    setSelectedIds(new Set());
    if (adding) setAdding(false);
  }

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

  return (
    <div className="rounded-2xl border border-[rgba(170,199,225,0.3)] bg-white p-5">
      {/* 헤더 */}
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
          {/* ── 편집 모드 ── */}
          {editing ? (
            <>
              {/* 전체 선택 / 선택 삭제 바 */}
              <div className="flex items-center justify-between border-b border-[#F4F4F4] pb-3">
                <button type="button" onClick={selectAll} className="text-sm font-medium text-[#7499BA]">
                  {allSelected ? '전체 해제' : '전체 선택'}
                </button>
                <button
                  type="button"
                  onClick={deleteSelected}
                  disabled={selectedIds.size === 0}
                  className={`text-sm font-medium transition-colors ${selectedIds.size > 0 ? 'text-red-400' : 'text-[#D1D5DC]'}`}
                >
                  선택 삭제{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
                </button>
              </div>

              {/* 드래그 정렬 flat 리스트 */}
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={orderedIds} strategy={verticalListSortingStrategy}>
                  <div className="space-y-0.5">
                    {orderedFlat.map((item) => (
                      <SortableRow key={item.id} id={item.id}>
                        <ChecklistItem
                          item={{ id: item.id, text: item.text }}
                          checked={!!checked[item.id]}
                          onToggle={onToggle}
                          selectable
                          selected={selectedIds.has(item.id)}
                          onSelect={() => toggleSelect(item.id)}
                        />
                      </SortableRow>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </>
          ) : (
            /* ── 일반 모드 (섹션 뷰, 커스텀 순서 반영) ── */
            <>
              {group.sections.map((section) => {
                const sectionDynamic = applyOrder(visibleDynamic.filter((d) => d.sectionTitle === section.title));
                const sectionStatic = applyOrder(section.items.filter((i) => !hiddenIds.has(i.id)));
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
                  {applyOrder(userItems).map((item) => (
                    <ChecklistItem
                      key={item.id}
                      item={{ id: item.id, text: item.text }}
                      checked={!!checked[item.id]}
                      onToggle={onToggle}
                    />
                  ))}
                </div>
              )}

              {/* 항목 추가 */}
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
                  <button type="button" onClick={submitAdd} className="rounded-xl bg-[#373737] px-3 py-2 text-sm font-medium text-white">추가</button>
                  <button type="button" onClick={() => setAdding(false)} className="rounded-xl bg-[#F5F5F5] px-3 py-2 text-sm text-[#666]">취소</button>
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
            </>
          )}
        </div>
      )}
    </div>
  );
}
