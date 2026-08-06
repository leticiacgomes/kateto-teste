"use client";

import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { Badge } from "@/components/ui/display/Badge";
import { STATUS } from "@/components/ui/display/StatusPill";
import { KanbanCard } from "@/components/ui/surfaces/KanbanCard";
import { cn } from "@/lib/cn";

export type LeadStatusKey = keyof typeof STATUS;

export type KanbanLead = {
  id: string;
  name: string;
  phone: string;
  status: LeadStatusKey;
  skinName: string;
  djName: string;
  skinPrice: number;
  updatedLabel: string;
};

const COLUMN_ORDER: LeadStatusKey[] = [
  "SEM_CONTATO",
  "EM_CONTATO",
  "PERDIDO",
  "FINALIZADO",
];

function SortableCard({
  lead,
  onOpen,
}: {
  lead: KanbanLead;
  onOpen: (leadId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      {...attributes}
      {...listeners}
    >
      <KanbanCard
        name={lead.name}
        handle={lead.phone}
        want={`${lead.djName} — ${lead.skinName}`}
        value={lead.skinPrice}
        status={lead.status}
        updated={lead.updatedLabel}
        onClick={() => onOpen(lead.id)}
      />
    </div>
  );
}

function Column({
  statusKey,
  items,
  onOpen,
}: {
  statusKey: LeadStatusKey;
  items: KanbanLead[];
  onOpen: (leadId: string) => void;
}) {
  const { setNodeRef } = useDroppable({ id: statusKey });
  const s = STATUS[statusKey];
  const total = items.reduce((sum, l) => sum + l.skinPrice, 0);

  return (
    <div className="flex max-h-full w-[280px] shrink-0 flex-col rounded-card border border-line-subtle bg-surface-1">
      <div className="flex items-center justify-between border-b border-line-subtle px-3.5 py-3">
        <div className="flex items-center gap-2.5">
          <span className={cn("h-2 w-2 rounded-full", s.dot, s.glow)} />
          <span className="font-display text-body font-semibold text-fg-strong">
            {s.label}
          </span>
          <Badge>{items.length}</Badge>
        </div>
        {total > 0 && (
          <span className="font-mono text-micro text-fg-faint">
            ${total.toLocaleString()}
          </span>
        )}
      </div>
      <SortableContext
        items={items.map((l) => l.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className="flex min-h-[40px] flex-col gap-2.5 overflow-y-auto p-3"
        >
          {items.map((lead) => (
            <SortableCard key={lead.id} lead={lead} onOpen={onOpen} />
          ))}
          {items.length === 0 && (
            <div className="py-4.5 text-center font-mono text-micro text-fg-faint">
              Vazio
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function KanbanBoard({
  initialLeads,
  onOpen,
  onMove,
}: {
  initialLeads: KanbanLead[];
  onOpen: (leadId: string) => void;
  onMove: (leadId: string, status: LeadStatusKey, index: number) => void;
}) {
  const [leads, setLeads] = useState(initialLeads);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  function findColumn(id: string): LeadStatusKey | undefined {
    if ((COLUMN_ORDER as string[]).includes(id)) return id as LeadStatusKey;
    return leads.find((l) => l.id === id)?.status;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId);
    if (!activeColumn || !overColumn || activeColumn === overColumn) return;

    setLeads((prev) => {
      const activeIndex = prev.findIndex((l) => l.id === activeId);
      if (activeIndex === -1) return prev;
      const updated = [...prev];
      updated[activeIndex] = { ...updated[activeIndex], status: overColumn };
      return updated;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const finalColumn = findColumn(overId);
    if (!finalColumn) return;

    const activeIndex = leads.findIndex((l) => l.id === activeId);
    if (activeIndex === -1) return;

    const updated = [...leads];
    updated[activeIndex] = { ...updated[activeIndex], status: finalColumn };

    const columnItems = updated.filter((l) => l.status === finalColumn);
    const otherItems = updated.filter((l) => l.status !== finalColumn);
    const oldIndex = columnItems.findIndex((l) => l.id === activeId);
    const overIndex = columnItems.findIndex((l) => l.id === overId);

    const reordered =
      overIndex !== -1 && oldIndex !== -1 && oldIndex !== overIndex
        ? arrayMove(columnItems, oldIndex, overIndex)
        : columnItems;

    const finalIndex = reordered.findIndex((l) => l.id === activeId);

    setLeads([...otherItems, ...reordered]);
    onMove(activeId, finalColumn, finalIndex);
  }

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

  return (
    <DndContext
      id="kanban-board"
      sensors={sensors}
      autoScroll={false}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-1 gap-4 overflow-x-auto overflow-y-hidden px-6 py-5">
        {COLUMN_ORDER.map((key) => (
          <Column
            key={key}
            statusKey={key}
            items={leads.filter((l) => l.status === key)}
            onOpen={onOpen}
          />
        ))}
      </div>
      <DragOverlay>
        {activeLead ? (
          <KanbanCard
            name={activeLead.name}
            handle={activeLead.phone}
            want={`${activeLead.djName} — ${activeLead.skinName}`}
            value={activeLead.skinPrice}
            status={activeLead.status}
            updated={activeLead.updatedLabel}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
