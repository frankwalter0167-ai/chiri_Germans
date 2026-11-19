import ChevronRight from 'lucide-react/icons/chevron-right';
import SlidersHorizontal from 'lucide-react/icons/sliders-horizontal';
import { useRef, useState } from 'react';
import { FloatingDropdownFrame } from '$components/FloatingDropdownFrame';
import { HoverFlyout, HoverFlyoutGroup } from '$components/HoverFlyout';
import { SortDirectionButton } from '$components/header/SortDirectionButton';
import { SortOptionButton } from '$components/header/SortOptionsButton';
import { TaskGroupOptionButton } from '$components/header/TaskGroupOptionButton';
import { AnsichtMenuCheckbox } from '$components/header/AnsichtMenuCheckbox';
import { Tooltip } from '$components/Tooltip';
import { SORT_OPTIONS, TASK_GROUP_OPTIONS } from '$constants';
import type { SortConfig, SortMode, TaskGroupConfig, TaskGroupMode } from '$types/sort';

interface HeaderAnsichtMenuProps {
  isAnyModalOpen: boolean;
  sortConfig: SortConfig;
  taskGroupConfig: TaskGroupConfig;
  activeCalendarId?: string | null;
  showCompletedAufgaben: boolean;
  showUnstartedAufgaben: boolean;
  moveCompletedAufgabenToBottom: boolean;
  onShowCompletedAufgabenChange: () => void;
  onShowUnstartedAufgabenChange: () => void;
  onMoveCompletedAufgabenToBottomChange: () => void;
  onSortDirectionToggle: () => void;
  onSortChange: (mode: SortMode) => void;
  onTaskGroupDirectionToggle: () => void;
  onTaskGroupChange: (mode: TaskGroupMode) => void;
}

export const HeaderAnsichtMenu = ({
  isAnyModalOpen,
  sortConfig,
  taskGroupConfig,
  activeCalendarId = null,
  showCompletedAufgaben,
  showUnstartedAufgaben,
  moveCompletedAufgabenToBottom,
  onShowCompletedAufgabenChange,
  onShowUnstartedAufgabenChange,
  onMoveCompletedAufgabenToBottomChange,
  onSortDirectionToggle,
  onSortChange,
  onTaskGroupDirectionToggle,
  onTaskGroupChange,
}: HeaderAnsichtMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  return (
    <div className="relative">
      <Tooltip content="Ansichtsoptionen" position="bottom">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          aria-label="Ansichtsoptionen"
          className={`flex h-9 w-9 items-center justify-center rounded-lg border border-transparent outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset ${
            isOpen
              ? 'bg-surface-200 text-surface-700 dark:bg-surface-600 dark:text-surface-200'
              : `text-surface-600 dark:text-surface-400 ${!isAnyModalOpen ? 'hover:bg-surface-100 dark:hover:bg-surface-700' : ''}`
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </Tooltip>

      {isOpen && (
        <FloatingDropdownFrame
          anchorRef={buttonRef}
          onClose={() => setIsOpen(false)}
          dropdownClassName="z-50 min-w-60"
          dataAttribute="data-context-menu-content"
        >
          <div className="border-surface-300 border-b px-3 py-2 dark:border-surface-700">
            <div className="pt-1 pb-1 font-medium text-sm text-surface-500 dark:text-surface-400">
              Ansicht
            </div>
            <AnsichtMenuCheckbox
              label="Erledigte anzeigen"
              checked={showCompletedAufgaben}
              onClick={onShowCompletedAufgabenChange}
            />
            <AnsichtMenuCheckbox
              label="Noch nicht begonnene anzeigen"
              checked={showUnstartedAufgaben}
              onClick={onShowUnstartedAufgabenChange}
            />
            <AnsichtMenuCheckbox
              label="Erledigte Aufgaben nach unten verschieben"
              checked={moveCompletedAufgabenToBottom}
              disabled={!showCompletedAufgaben}
              onClick={onMoveCompletedAufgabenToBottomChange}
            />
          </div>

          <div className="space-y-1 px-3 py-2">
            <div className="pt-1 pb-1 font-medium text-sm text-surface-500 dark:text-surface-400">
              Aufgaben
            </div>

            <HoverFlyoutGroup>
              <button
                type="button"
                className="-mx-2 flex w-[calc(100%+1rem)] items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm text-surface-700 outline-hidden transition-colors hover:bg-surface-100 focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset dark:text-surface-300 dark:hover:bg-surface-700"
              >
                <span>Sortieren nach</span>
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-surface-500 text-xs dark:text-surface-400">
                    {SORT_OPTIONS.find((option) => option.value === sortConfig.mode)?.label}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-surface-500 dark:text-surface-400" />
                </div>
              </button>

              <HoverFlyout side="left" gap={8} minWidthClassName="min-w-52">
                <div className="flex items-center justify-between px-3 pb-1 font-medium text-sm text-surface-500 dark:text-surface-400">
                  <span>Sortieren nach</span>
                  <SortDirectionButton
                    direction={sortConfig.direction}
                    disabled={sortConfig.mode === 'manual'}
                    disabledLabel="Bei manueller Sortierung wird keine Sortierrichtung verwendet"
                    onToggle={onSortDirectionToggle}
                  />
                </div>
                <div className="space-y-1 px-1">
                  {SORT_OPTIONS.map((option) => (
                    <SortOptionButton
                      key={option.value}
                      option={option}
                      isActive={sortConfig.mode === option.value}
                      onClick={() => onSortChange(option.value)}
                    />
                  ))}
                </div>
              </HoverFlyout>
            </HoverFlyoutGroup>

            <HoverFlyoutGroup>
              <button
                type="button"
                className="-mx-2 flex w-[calc(100%+1rem)] items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm text-surface-700 outline-hidden transition-colors hover:bg-surface-100 focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset dark:text-surface-300 dark:hover:bg-surface-700"
              >
                <span>Gruppieren nach</span>
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-surface-500 text-xs dark:text-surface-400">
                    {
                      TASK_GROUP_OPTIONS.find((option) => option.value === taskGroupConfig.mode)
                        ?.label
                    }
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-surface-500 dark:text-surface-400" />
                </div>
              </button>

              <HoverFlyout side="left" gap={8} minWidthClassName="min-w-52">
                <div className="flex items-center justify-between px-3 pb-1 font-medium text-sm text-surface-500 dark:text-surface-400">
                  Gruppieren nach
                  <SortDirectionButton
                    direction={taskGroupConfig.direction}
                    disabled={taskGroupConfig.mode === 'none' || activeCalendarId !== null}
                    disabledLabel={
                      activeCalendarId !== null
                        ? 'Bei Kalenderansicht nicht verfügbar'
                        : 'Gruppierung ist deaktiviert'
                    }
                    onToggle={onTaskGroupDirectionToggle}
                  />
                </div>
                <div className="space-y-1 px-1">
                  {TASK_GROUP_OPTIONS.map((option) => (
                    <TaskGroupOptionButton
                      key={option.value}
                      option={option}
                      isActive={taskGroupConfig.mode === option.value}
                      disabled={option.value === 'calendar' && activeCalendarId !== null}
                      disabledReason="Bei Kalenderansicht nicht verfügbar"
                      onClick={() => onTaskGroupChange(option.value)}
                    />
                  ))}
                </div>
              </HoverFlyout>
            </HoverFlyoutGroup>
          </div>
        </FloatingDropdownFrame>
      )}
    </div>
  );
};
