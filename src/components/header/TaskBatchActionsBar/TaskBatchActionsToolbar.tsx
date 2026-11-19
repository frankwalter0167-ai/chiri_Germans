import CalendarClock from 'lucide-react/icons/calendar-clock';
import CheckCircle2 from 'lucide-react/icons/check-circle-2';
import ChevronDown from 'lucide-react/icons/chevron-down';
import Flag from 'lucide-react/icons/flag';
import CalendarMove from 'lucide-react/icons/folder-sync';
import RotateCcw from 'lucide-react/icons/rotate-ccw';
import Share2 from 'lucide-react/icons/share-2';
import Tag from 'lucide-react/icons/tag';
import Trash2 from 'lucide-react/icons/trash-2';
import X from 'lucide-react/icons/x';
import type { RefObject } from 'react';
import { TaskBatchActionTooltip } from '$components/header/TaskBatchActionsBar/TaskBatchActionTooltip';
import { Tooltip } from '$components/Tooltip';
import type { TaskBatchMenu } from '$hooks/ui/useTaskBatchActions';

interface TaskBatchActionsToolbarProps {
  ausgewähltCount: number;
  mode: 'active' | 'deleted';
  isTight: boolean;
  toolbarRef: RefObject<HTMLDivElement | null>;
  openMenu: TaskBatchMenu;
  statusButtonRef: RefObject<HTMLButtonElement | null>;
  priorityButtonRef: RefObject<HTMLButtonElement | null>;
  allCalendarsCount: number;
  dataDragRegionPassThrough?: boolean;
  onClearSelection: () => void;
  onToggleMenu: (menu: Exclude<TaskBatchMenu, null>) => void;
  onOpenTagsModal: () => void;
  onOpenDatesModal: () => void;
  onOpenMoveModal: () => void;
  onOpenExportModal: () => void;
  onDelete: () => void | Promise<void>;
  onPermanentDelete: () => void | Promise<void>;
  onRestore: () => void;
}

const actionButtonClass =
  'inline-flex h-8 shrink-0 items-center rounded-lg border border-surface-300 dark:border-surface-700 text-sm font-medium text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors outline-hidden focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset disabled:opacity-50 disabled:cursor-not-allowed';
const destructiveButtonClass =
  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-semantic-error text-sm font-medium text-primary-contrast hover:opacity-90 transition-colors outline-hidden focus-visible:ring-2 focus-visible:ring-semantic-error focus-visible:ring-inset';

const getActionButtonClass = ({
  isActive = false,
  hasDisclosure = false,
}: {
  isActive?: boolean;
  hasDisclosure?: boolean;
} = {}) =>
  `${actionButtonClass} ${
    hasDisclosure ? 'w-12 justify-center gap-0.5 px-1' : 'w-8 justify-center gap-0 px-0'
  }${
    isActive
      ? ' bg-surface-100 text-surface-900 border-surface-300 dark:bg-surface-700 dark:text-surface-50 dark:border-surface-600'
      : ''
  }`;

const getDisclosureChevronClass = (isOpen: boolean) =>
  `w-3.5 h-3.5 text-surface-500 shrink-0 motion-safe:transition-transform motion-safe:duration-200 dark:text-surface-400 ${
    isOpen ? 'rotate-0' : '-rotate-90'
  }`;

export const TaskBatchActionsToolbar = ({
  ausgewähltCount,
  mode,
  isTight,
  toolbarRef,
  openMenu,
  statusButtonRef,
  priorityButtonRef,
  allCalendarsCount,
  dataDragRegionPassThrough,
  onClearSelection,
  onToggleMenu,
  onOpenTagsModal,
  onOpenDatesModal,
  onOpenMoveModal,
  onOpenExportModal,
  onDelete,
  onPermanentDelete,
  onRestore,
}: TaskBatchActionsToolbarProps) => (
  <div
    ref={toolbarRef}
    data-drag-region-pass-through={dataDragRegionPassThrough ? '' : undefined}
    className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden"
  >
    <div className="flex shrink-0 items-center gap-2">
      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-sm bg-primary-500 px-2 font-semibold text-primary-contrast text-xs">
        {ausgewähltCount}
      </span>
      <span
        className={`font-medium text-sm text-surface-800 dark:text-surface-100 ${
          isTight ? 'sr-only' : ''
        }`}
      >
        ausgewählt
      </span>
    </div>

    <div className="ml-auto flex min-w-0 items-center gap-2 overflow-hidden">
      {mode === 'deleted' ? (
        <>
          <TaskBatchActionTooltip content="Restore ausgewählt tasks">
            <button type="button" onClick={onRestore} className={getActionButtonClass()}>
              <RotateCcw className="h-4 w-4" />
              <span className="sr-only">Wiederherstellen</span>
            </button>
          </TaskBatchActionTooltip>

          <TaskBatchActionTooltip content="Delete ausgewählt tasks permanently">
            <button type="button" onClick={onPermanentDelete} className={destructiveButtonClass}>
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Endgültig löschen</span>
            </button>
          </TaskBatchActionTooltip>
        </>
      ) : (
        <>
          <TaskBatchActionTooltip content="Schlagwörter bearbeiten">
            <button type="button" onClick={onOpenTagsModal} className={getActionButtonClass()}>
              <Tag className="h-4 w-4" />
              <span className="sr-only">Schlagwörter</span>
            </button>
          </TaskBatchActionTooltip>

          <TaskBatchActionTooltip content="Daten bearbeiten">
            <button type="button" onClick={onOpenDatesModal} className={getActionButtonClass()}>
              <CalendarClock className="h-4 w-4" />
              <span className="sr-only">Daten</span>
            </button>
          </TaskBatchActionTooltip>

          <TaskBatchActionTooltip
            content={
              allCalendarsCount === 0
                ? 'Füge einen Kalender hinzu, um Aufgaben verschieben zu können'
                : 'In Kalender verschieben'
            }
          >
            <button
              type="button"
              onClick={onOpenMoveModal}
              className={getActionButtonClass()}
              disabled={allCalendarsCount === 0}
            >
              <CalendarMove className="h-4 w-4" />
              <span className="sr-only">Verschieben</span>
            </button>
          </TaskBatchActionTooltip>

          <TaskBatchActionTooltip content="Status festlegen">
            <button
              type="button"
              ref={statusButtonRef}
              onClick={() => onToggleMenu('status')}
              className={getActionButtonClass({
                isActive: openMenu === 'status',
                hasDisclosure: true,
              })}
              aria-haspopup="menu"
              aria-expanded={openMenu === 'status'}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span className="sr-only">Status</span>
              <ChevronDown className={getDisclosureChevronClass(openMenu === 'status')} />
            </button>
          </TaskBatchActionTooltip>

          <TaskBatchActionTooltip content="Priorität ändern">
            <button
              type="button"
              ref={priorityButtonRef}
              onClick={() => onToggleMenu('priority')}
              className={getActionButtonClass({
                isActive: openMenu === 'priority',
                hasDisclosure: true,
              })}
              aria-haspopup="menu"
              aria-expanded={openMenu === 'priority'}
            >
              <Flag className="h-4 w-4" />
              <span className="sr-only">Priority</span>
              <ChevronDown className={getDisclosureChevronClass(openMenu === 'priority')} />
            </button>
          </TaskBatchActionTooltip>

          <TaskBatchActionTooltip content="Export ausgewählt tasks">
            <button type="button" onClick={onOpenExportModal} className={getActionButtonClass()}>
              <Share2 className="h-4 w-4" />
              <span className="sr-only">Exportieren</span>
            </button>
          </TaskBatchActionTooltip>

          <TaskBatchActionTooltip content="Delete ausgewählt tasks">
            <button type="button" onClick={onDelete} className={destructiveButtonClass}>
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Löschen</span>
            </button>
          </TaskBatchActionTooltip>
        </>
      )}

      <Tooltip content="Auswahl aufheben" position="bottom">
        <button
          type="button"
          onClick={onClearSelection}
          aria-label="Auswahl aufheben"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-surface-500 outline-hidden transition-colors hover:bg-surface-100 hover:text-surface-800 focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset dark:hover:bg-surface-700 dark:hover:text-surface-200"
        >
          <X className="h-4 w-4" />
        </button>
      </Tooltip>
    </div>
  </div>
);
