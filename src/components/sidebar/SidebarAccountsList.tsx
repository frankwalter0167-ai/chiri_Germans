import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type Modifier,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import ArrowUpDown from 'lucide-react/icons/arrow-up-down';
import ChevronDown from 'lucide-react/icons/chevron-down';
import Plus from 'lucide-react/icons/plus';
import { type MouseEvent, useCallback, useRef, useState } from 'react';
import { SidebarAccountItem } from '$components/sidebar/SidebarAccountItem';
import { SidebarKontenSortMenu } from '$components/sidebar/SidebarKontenSortMenu';
import { Tooltip } from '$components/Tooltip';
import { useReorderKonten } from '$hooks/queries/useKonten';
import { useAccountSortConfig, useCalendarSortConfig } from '$hooks/queries/useUIState';
import type { Account } from '$types/account';
import type { Task } from '$types/task/model';

interface SidebarKontenListProps {
  accounts: Account[];
  tasks: Task[];
  expandedKonten: Set<string>;
  activeCalendarId: string | null;
  contextMenu: { type: string; id: string; accountId?: string } | null;
  isAnyModalOpen: boolean;
  activeAccountMenuTriggerId: string | null;
  showTaskCounts: boolean;
  accountsSectionCollapsed: boolean;
  onToggleKontenSection: () => void;
  onContextMenu: (
    e: MouseEvent,
    type: 'account' | 'calendar' | 'tag' | 'accounts-section',
    id: string,
    accountId?: string,
  ) => void;
  onToggleAccount: (accountId: string) => void;
  onSelectCalendar: (accountId: string, calendarId: string) => void;
  onCreateCalendar: (accountId: string) => void;
  onAddAccount: () => void;
}

export const SidebarKontenList = ({
  accounts,
  tasks,
  expandedKonten,
  activeCalendarId,
  contextMenu,
  isAnyModalOpen,
  activeAccountMenuTriggerId,
  showTaskCounts,
  accountsSectionCollapsed,
  onToggleKontenSection,
  onContextMenu,
  onToggleAccount,
  onSelectCalendar,
  onCreateCalendar,
  onAddAccount,
}: SidebarKontenListProps) => {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [isDraggingAccount, setIsDraggingAccount] = useState(false);
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  const accountsDragBoundsRef = useRef<HTMLDivElement>(null);

  const accountSortConfig = useAccountSortConfig();
  const calendarSortConfig = useCalendarSortConfig();
  const reorderKontenMutation = useReorderKonten();
  const accountSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const closeSortMenu = useCallback(() => setShowSortMenu(false), []);

  const getAccountTaskCount = (accountId: string) =>
    tasks.filter(
      (t) =>
        t.accountId === accountId &&
        !t.deletedAt &&
        t.status !== 'completed' &&
        t.status !== 'cancelled',
    ).length;

  const sortedKonten = (() => {
    const sorted = [...accounts];
    if (accountSortConfig.mode === 'title') {
      sorted.sort((a, b) => {
        const cmp = a.name.localeCompare(b.name);
        return accountSortConfig.direction === 'desc' ? -cmp : cmp;
      });
    } else if (accountSortConfig.mode === 'task-count') {
      sorted.sort((a, b) => {
        const cmp = getAccountTaskCount(a.id) - getAccountTaskCount(b.id);
        return accountSortConfig.direction === 'desc' ? -cmp : cmp;
      });
    } else if (accountSortConfig.mode === 'calendar-count') {
      sorted.sort((a, b) => {
        const cmp = a.calendars.length - b.calendars.length;
        return accountSortConfig.direction === 'desc' ? -cmp : cmp;
      });
    } else {
      sorted.sort((a, b) => {
        const cmp = a.sortOrder - b.sortOrder;
        return accountSortConfig.direction === 'desc' ? -cmp : cmp;
      });
    }
    return sorted;
  })();

  const handleAccountDragEnd = (event: DragEndEvent) => {
    setIsDraggingAccount(false);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    reorderKontenMutation.mutate({ activeId: active.id as string, overId: over.id as string });
  };

  const restrictAccountDragToSection = useCallback<Modifier>(({ draggingNodeRect, transform }) => {
    const bounds = accountsDragBoundsRef.current?.getBoundingClientRect();
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

  const sharedAccountProps = (account: Account) => ({
    account,
    tasks,
    expandedKonten,
    activeCalendarId,
    contextMenu,
    isAnyModalOpen,
    isAccountMenuTriggerActive: activeAccountMenuTriggerId === account.id,
    isAnyAccountDragging: isDraggingAccount,
    showTaskCounts,
    calendarSortConfig,
    onToggleAccount,
    onSelectCalendar,
    onCreateCalendar,
    onContextMenu,
  });

  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onToggleKontenSection}
          onContextMenu={(e) => onContextMenu(e, 'accounts-section', 'accounts')}
          aria-expanded={!accountsSectionCollapsed}
          className="flex h-9 min-w-0 flex-1 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-left outline-hidden transition-colors hover:bg-surface-200 focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset dark:hover:bg-surface-700"
        >
          <ChevronDown
            className={`h-4 w-4 text-surface-500 motion-safe:transition-transform motion-safe:duration-200 dark:text-surface-400 ${accountsSectionCollapsed ? '-rotate-90' : 'rotate-0'}`}
          />
          <span className="font-semibold text-sm text-surface-500 dark:text-surface-400">
            Konten
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <Tooltip content="Listenreihenfolge" position="top">
            <button
              ref={sortButtonRef}
              type="button"
              onClick={() => {
                setShowSortMenu((v) => !v);
              }}
              className={`flex h-9 w-8 shrink-0 items-center justify-center rounded-lg outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset ${
                showSortMenu
                  ? 'bg-surface-300 text-surface-700 dark:bg-surface-600 dark:text-surface-200'
                  : `text-surface-500 dark:text-surface-400 ${!isAnyModalOpen ? 'hover:bg-surface-300 hover:text-surface-700 dark:hover:bg-surface-600 dark:hover:text-surface-300' : ''}`
              }`}
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </Tooltip>

          <Tooltip content="Konto hinzufügen" position="top">
            <button
              type="button"
              onClick={() => {
                onAddAccount();
              }}
              className={`flex h-9 w-8 shrink-0 items-center justify-center rounded-lg ${!isAnyModalOpen ? 'hover:bg-surface-300 hover:text-surface-700 dark:hover:bg-surface-600 dark:hover:text-surface-300' : ''} text-surface-500 outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset dark:text-surface-400`}
            >
              <Plus className="h-4 w-4" />
            </button>
          </Tooltip>
        </div>
      </div>

      {showSortMenu && (
        <SidebarKontenSortMenu
          anchorRef={sortButtonRef}
          accountSortConfig={accountSortConfig}
          calendarSortConfig={calendarSortConfig}
          onClose={closeSortMenu}
        />
      )}

      <div
        className={`grid motion-safe:transition-[grid-template-rows] motion-safe:duration-200 motion-safe:ease-in-out ${accountsSectionCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'} pt-1`}
      >
        <div
          className="overflow-hidden"
          aria-hidden={accountsSectionCollapsed}
          inert={accountsSectionCollapsed}
        >
          {accounts.length === 0 ? (
            <div className="px-3 py-1 text-sm text-surface-500 dark:text-surface-400">
              Keine Konten. Klicke auf +, um eines hinzuzufügen!
            </div>
          ) : accountSortConfig.mode === 'manual' ? (
            <div ref={accountsDragBoundsRef}>
              <DndContext
                sensors={accountSensors}
                collisionDetection={closestCenter}
                modifiers={[restrictAccountDragToSection]}
                onDragStart={() => setIsDraggingAccount(true)}
                onDragEnd={handleAccountDragEnd}
                onDragCancel={() => setIsDraggingAccount(false)}
              >
                <SortableContext
                  items={sortedKonten.map((a) => a.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {sortedKonten.map((account) => (
                    <SidebarAccountItem
                      key={account.id}
                      {...sharedAccountProps(account)}
                      sortable
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          ) : (
            <div ref={accountsDragBoundsRef}>
              {sortedKonten.map((account) => (
                <SidebarAccountItem key={account.id} {...sharedAccountProps(account)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
