import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type Modifier,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import BellOff from 'lucide-react/icons/bell-off';
import CalendarClock from 'lucide-react/icons/calendar-clock';
import CheckCircle2 from 'lucide-react/icons/check-circle-2';
import Clock from 'lucide-react/icons/clock';
import FolderSync from 'lucide-react/icons/folder-sync';
import Link from 'lucide-react/icons/link';
import RefreshCw from 'lucide-react/icons/refresh-cw';
import RotateCcw from 'lucide-react/icons/rotate-ccw';
import Tag from 'lucide-react/icons/tag';
import Timer from 'lucide-react/icons/timer';
import { useCallback, useRef } from 'react';
import { BadgesSettingsPreview } from '$components/settings/BadgesSettings/BadgesSettingsPreview';
import {
  type BadgeConfig,
  BadgesSettingsSortableBadges,
} from '$components/settings/BadgesSettings/BadgesSettingsSortableBadges';
import { useSettingsStore } from '$context/settingsContext';
import { defaultState } from '$context/settingsDefaults';
import type { TaskBadgeKey } from '$types/settings/categories/editor';

const BADGES: BadgeConfig[] = [
  {
    key: 'startDate',
    label: 'Startdatum',
    description: 'Wird angezeigt, wenn eine Aufgabe ein zukünftiges Startdatum hat',
    icon: <CalendarClock className="h-4 w-4" />,
  },
  {
    key: 'dueDate',
    label: 'Fälligkeitsdatum',
    description: 'Wann die Aufgabe fällig ist',
    icon: <Clock className="h-4 w-4" />,
  },
  {
    key: 'tags',
    label: 'Schlagwörter',
    description: 'Der Aufgabe zugewiesene Schlagwörter',
    icon: <Tag className="h-4 w-4" />,
  },
  {
    key: 'calendar',
    label: 'Kalender',
    description: 'Zu welchem Kalender die Aufgabe gehört',
    icon: <FolderSync className="h-4 w-4" />,
  },
  {
    key: 'url',
    label: 'URL',
    description: 'Mit der Aufgabe verknüpfter Link',
    icon: <Link className="h-4 w-4" />,
  },
  {
    key: 'status',
    label: 'Status',
    description: 'In-progress status indicators with percent complete',
    icon: <Timer className="h-4 w-4" />,
  },
  {
    key: 'snooze',
    label: 'Schlummern',
    description: 'Wird angezeigt, wenn eine Aufgabe zurückgestellt ist',
    icon: <BellOff className="h-4 w-4" />,
  },
  {
    key: 'repeat',
    label: 'Wiederholen',
    description: 'Wird angezeigt, wenn eine Aufgabe eine Wiederholungsregel hat',
    icon: <RefreshCw className="h-4 w-4" />,
  },
  {
    key: 'subtasks',
    label: 'Unteraufgaben',
    description: 'Fortschrittsanzeige der Unteraufgaben und Einklappfunktion',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
];

const BADGE_MAP = new Map(BADGES.map((badge) => [badge.key, badge]));

export const BadgesSettings = () => {
  const { taskBadgeVisibility, taskBadgeOrder, setTaskBadgeVisibility, setTaskBadgeOrder } =
    useSettingsStore();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const badgesDragBoundsRef = useRef<HTMLDivElement>(null);
  const orderedBadges = taskBadgeOrder
    .map((key) => BADGE_MAP.get(key))
    .filter(Boolean) as BadgeConfig[];

  const toggle = (key: TaskBadgeKey, value: boolean) => {
    setTaskBadgeVisibility({ ...taskBadgeVisibility, [key]: value });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = taskBadgeOrder.indexOf(active.id as TaskBadgeKey);
    const newIndex = taskBadgeOrder.indexOf(over.id as TaskBadgeKey);
    if (oldIndex === -1 || newIndex === -1) return;
    setTaskBadgeOrder(arrayMove(taskBadgeOrder, oldIndex, newIndex));
  };

  const restrictBadgeDragToSection = useCallback<Modifier>(({ draggingNodeRect, transform }) => {
    const bounds = badgesDragBoundsRef.current?.getBoundingClientRect();
    if (!bounds || !draggingNodeRect) return transform;

    return {
      ...transform,
      x: Math.min(
        Math.max(transform.x, bounds.left - draggingNodeRect.left),
        bounds.right - draggingNodeRect.right,
      ),
      y: Math.min(
        Math.max(transform.y, bounds.top - draggingNodeRect.top),
        bounds.bottom - draggingNodeRect.bottom,
      ),
    };
  }, []);

  const handleReset = () => {
    setTaskBadgeVisibility(defaultState.taskBadgeVisibility);
    setTaskBadgeOrder(defaultState.taskBadgeOrder);
  };

  const hasChanged =
    BADGES.some(({ key }) => taskBadgeVisibility[key] !== defaultState.taskBadgeVisibility[key]) ||
    taskBadgeOrder.length !== defaultState.taskBadgeOrder.length ||
    taskBadgeOrder.some((key, index) => key !== defaultState.taskBadgeOrder[index]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base text-surface-800 dark:text-surface-200">Kennzeichnungen</h3>
        {hasChanged && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-surface-500 text-xs outline-hidden transition-colors hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200"
          >
            <RotateCcw className="h-3 w-3" />
            Zurücksetzen
          </button>
        )}
      </div>
      <BadgesSettingsPreview />
      <div
        ref={badgesDragBoundsRef}
        className="overflow-hidden rounded-lg border border-surface-300 bg-white dark:border-surface-700 dark:bg-surface-800"
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictBadgeDragToSection]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={taskBadgeOrder} strategy={verticalListSortingStrategy}>
            {orderedBadges.map((badge, index) => (
              <BadgesSettingsSortableBadges
                key={badge.key}
                badge={badge}
                showBorder={index > 0}
                checked={taskBadgeVisibility[badge.key]}
                onToggle={toggle}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};
