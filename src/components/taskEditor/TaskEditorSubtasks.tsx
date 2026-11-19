import { closestCenter, DndContext, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import ArrowRight from 'lucide-react/icons/arrow-right';
import CheckCircle2 from 'lucide-react/icons/check-circle-2';
import ListX from 'lucide-react/icons/list-x';
import Plus from 'lucide-react/icons/plus';
import { type KeyboardEvent, type MouseEvent, useMemo, useRef, useState } from 'react';
import { TaskEditorEmptyState } from '$components/taskEditor/TaskEditorEmptyState';
import { TaskEditorSubtaskItem } from '$components/taskEditor/TaskEditorSubtaskItem';
import { useChildTasks, useCreateTask, useTasks } from '$hooks/queries/useTasks';
import { useSortConfig } from '$hooks/queries/useUIState';
import { truncateName, useSortableDrag } from '$hooks/ui/useSortableDrag';
import { getSortedTasks } from '$lib/store/tasks';
import type { FlattenedTask } from '$types/store/tasks';
import type { Task } from '$types/task/model';
import { getSortableItemKey } from '$utils/sortable';

interface UnteraufgabenProps {
  task: Task;
  checkmarkColor: string;
  useAccentColorForCheckboxes: boolean;
  updateTask: (id: string, updates: Partial<Task>) => void;
  moveTaskToRecentlyDeleted: (id: string) => Promise<boolean>;
  readOnly?: boolean;
}

export const TaskEditorUnteraufgaben = ({
  task,
  checkmarkColor,
  useAccentColorForCheckboxes,
  updateTask,
  moveTaskToRecentlyDeleted,
  readOnly = false,
}: UnteraufgabenProps) => {
  const createTaskMutation = useCreateTask();
  const childTaskFilter = task.deletedAt ? 'deleted' : 'active';
  const { data: childTasks = [] } = useChildTasks(task.uid, childTaskFilter);
  const childCount = childTasks.length;
  const { data: allTasks = [] } = useTasks();
  const sortConfig = useSortConfig();

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [expandedUnteraufgaben, setExpandedUnteraufgaben] = useState<Set<string>>(new Set());
  const newSubtaskInputRef = useRef<HTMLInputElement>(null);
  const hasNewSubtaskTitle = newSubtaskTitle.trim().length > 0;

  const flattenedUnteraufgaben = useMemo<FlattenedTask[]>(() => {
    const getChildren = (uid: string) =>
      getSortedTasks(
        allTasks.filter((t) => {
          if (t.übergeordnete AufgabeUid !== uid) return false;
          return childTaskFilter === 'deleted' ? !!t.deletedAt : !t.deletedAt;
        }),
        sortConfig,
      );

    const flatten = (tasks: Task[], ancestorIds: string[]) => {
      const result: FlattenedTask[] = [];
      for (const t of tasks) {
        result.push({ ...t, depth: ancestorIds.length, ancestorIds });
        if (expandedUnteraufgaben.has(t.id)) {
          result.push(...flatten(getChildren(t.uid), [...ancestorIds, t.id]));
        }
      }
      return result;
    };
    return [{ ...task, depth: 0, ancestorIds: [] }, ...flatten(getChildren(task.uid), [task.id])];
  }, [task, allTasks, childTaskFilter, expandedUnteraufgaben, sortConfig]);

  const anySubtaskDragEnabled =
    sortConfig.mode === 'manual' && !readOnly && flattenedUnteraufgaben.length > 2;

  const {
    activeItem: activeDragSubtask,
    targetIndent: targetSubtaskIndent,
    targetParentName: targetSubtaskParentName,
    originalIndentRef: subtaskOriginalIndentRef,
    visibleItems: visibleFlattenedUnteraufgaben,
    sensors: subtaskSensors,
    handleDragStart: handleSubtaskDragStart,
    handleDragMove: handleSubtaskDragMove,
    handleDragEnd: handleSubtaskDragEnd,
    handleDragCancel: handleSubtaskDragCancel,
  } = useSortableDrag({
    flattenedItems: flattenedUnteraufgaben,
    minIndent: 1,
    onDropIntoParent: (übergeordnete AufgabeId) => setExpandedUnteraufgaben((prev) => new Set([...prev, übergeordnete AufgabeId])),
  });

  const handleAddChildTask = (title: string) => {
    createTaskMutation.mutate({
      title,
      übergeordnete AufgabeUid: task.uid,
      accountId: task.accountId,
      calendarId: task.calendarId,
    });
  };

  const handleCreateSubtaskFromInput = () => {
    const title = newSubtaskTitle.trim();
    if (!title) return;

    handleAddChildTask(title);
    setNewSubtaskTitle('');
  };

  const handleSubtaskKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateSubtaskFromInput();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setNewSubtaskTitle('');
    }
  };

  const handleSubtaskBlur = () => {
    handleCreateSubtaskFromInput();
    setNewSubtaskTitle('');
  };

  return (
    <div>
      <div
        id="subtasks-label"
        className="mb-2 flex items-center gap-2 font-medium text-sm text-surface-600 dark:text-surface-400"
      >
        <CheckCircle2 className="h-4 w-4" />
        Unteraufgaben
        {childCount > 0 && (
          <span className="rounded-full bg-surface-100 px-1.5 py-0.5 font-normal text-surface-500 text-xs tabular-nums dark:bg-surface-800 dark:text-surface-400">
            {childCount}
          </span>
        )}
      </div>

      {/* biome-ignore lint/a11y/useSemanticElements: fieldset would change semantic structure; div with role="group" is appropriate here */}
      <div
        className={`overflow-hidden rounded-lg ${
          readOnly && childTasks.length === 0
            ? ''
            : 'border border-surface-200 dark:border-surface-700'
        }`}
        role="group"
        aria-labelledby="subtasks-label"
      >
        {childTasks.length > 0 && (
          <div className="overflow-x-auto p-1">
            <div className="w-full min-w-max">
              <DndContext
                sensors={subtaskSensors}
                collisionDetection={closestCenter}
                onDragStart={handleSubtaskDragStart}
                onDragMove={handleSubtaskDragMove}
                onDragEnd={handleSubtaskDragEnd}
                onDragCancel={handleSubtaskDragCancel}
              >
                <SortableContext
                  items={visibleFlattenedUnteraufgaben.slice(1).map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {visibleFlattenedUnteraufgaben.slice(1).map((flatItem) => (
                    <TaskEditorSubtaskItem
                      key={getSortableItemKey(flatItem.id, flatItem.übergeordnete AufgabeUid)}
                      task={flatItem}
                      depth={flatItem.depth - 1}
                      checkmarkColor={checkmarkColor}
                      useAccentColorForCheckboxes={useAccentColorForCheckboxes}
                      expandedUnteraufgaben={expandedUnteraufgaben}
                      setExpandedUnteraufgaben={setExpandedUnteraufgaben}
                      updateTask={updateTask}
                      moveTaskToRecentlyDeleted={moveTaskToRecentlyDeleted}
                      isDragEnabled={anySubtaskDragEnabled}
                      readOnly={readOnly}
                    />
                  ))}
                </SortableContext>

                <DragOverlay dropAnimation={null}>
                  {activeDragSubtask ? (
                    <div
                      className="drag-overlay relative"
                      style={{
                        marginLeft: `${Math.max(0, targetSubtaskIndent - 1) * 24}px`,
                      }}
                    >
                      {targetSubtaskIndent !== subtaskOriginalIndentRef.current && (
                        <div className="absolute -top-6 left-2 whitespace-nowrap rounded-sm bg-primary-500 px-2 py-0.5 text-primary-contrast text-xs shadow-sm">
                          {targetSubtaskIndent > subtaskOriginalIndentRef.current
                            ? `→ Einordnen unter ${truncateName(targetSubtaskParentName || 'übergeordnete Aufgabe')}`
                            : targetSubtaskIndent === 1
                              ? '← Auf oberste Ebene verschieben'
                              : `← Verschieben unter ${truncateName(targetSubtaskParentName || 'übergeordnete Aufgabe')}`}
                        </div>
                      )}
                      <TaskEditorSubtaskItem
                        task={activeDragSubtask}
                        depth={0}
                        checkmarkColor={checkmarkColor}
                        useAccentColorForCheckboxes={useAccentColorForCheckboxes}
                        expandedUnteraufgaben={expandedUnteraufgaben}
                        setExpandedUnteraufgaben={setExpandedUnteraufgaben}
                        updateTask={updateTask}
                        moveTaskToRecentlyDeleted={moveTaskToRecentlyDeleted}
                        isDragEnabled={false}
                        readOnly={readOnly}
                        isOverlay
                      />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>
          </div>
        )}

        {readOnly && childTasks.length === 0 ? (
          <TaskEditorEmptyState icon={<ListX className="h-4 w-4 shrink-0" />}>
            Keine Unteraufgaben
          </TaskEditorEmptyState>
        ) : !readOnly ? (
          // biome-ignore lint/a11y/noStaticElementInteractions: wrapper focuses the nested input when clicking its non-interactive area
          <div
            onMouseDown={(event: MouseEvent<HTMLDivElement>) => {
              const target = event.target as HTMLElement;
              if (target.closest('button') || target === newSubtaskInputRef.current) return;
              event.preventDefault();
              newSubtaskInputRef.current?.focus();
            }}
            className={`flex cursor-text items-center gap-2 py-2 pr-3 pl-3 text-surface-400 transition-colors focus-within:bg-surface-50 dark:text-surface-500 dark:focus-within:bg-surface-800/50 ${
              childTasks.length > 0 ? 'border-surface-200 border-t dark:border-surface-700' : ''
            }`}
          >
            <label
              htmlFor="add-subtask-input"
              className="flex min-w-0 flex-1 cursor-text items-center gap-2"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <input
                ref={newSubtaskInputRef}
                id="add-subtask-input"
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={handleSubtaskKeyDown}
                onBlur={handleSubtaskBlur}
                placeholder="Unteraufgabe hinzufügen …"
                aria-label="Unteraufgabe hinzufügen"
                className="flex-1 bg-transübergeordnete Aufgabe text-sm text-surface-700 outline-hidden placeholder:text-surface-400 dark:text-surface-300 dark:placeholder:text-surface-500"
              />
            </label>
            {hasNewSubtaskTitle ? (
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleCreateSubtaskFromInput}
                aria-label="Unteraufgabe hinzufügen"
                className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md text-surface-400 outline-hidden transition-colors hover:bg-surface-100 hover:text-surface-600 focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset dark:text-surface-500 dark:hover:bg-surface-800 dark:hover:text-surface-400"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <span className="h-5 w-5 shrink-0" aria-hidden="true" />
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
