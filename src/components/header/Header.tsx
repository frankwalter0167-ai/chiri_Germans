import { formatDistanceToNow } from 'date-fns';

import RefreshCw from 'lucide-react/icons/refresh-cw';
import Search from 'lucide-react/icons/search';
import X from 'lucide-react/icons/x';
import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ComposedInput } from '$components/ComposedInput';
import { getHeaderContextTitle, HeaderContextTitle } from '$components/header/HeaderContextTitle';
import { HeaderViewMenu } from '$components/header/HeaderViewMenu';
import { TaskBatchActionsBar } from '$components/header/TaskBatchActionsBar/TaskBatchActionsBar';
import { Tooltip } from '$components/Tooltip';
import {
  DEFAULT_SORT_CONFIG,
  DEFAULT_TASK_GROUP_CONFIG,
  JUST_NOW_SYNC_TEXT_MS_THRESHOLD,
} from '$constants';
import { SYNC_SOURCE_LABELS } from '$constants/sync';
import { useModalState } from '$context/modalStateContext';
import { useTaskSelection } from '$context/taskSelectionContext';
import { useAccounts } from '$hooks/queries/useAccounts';
import { useFilters } from '$hooks/queries/useFilters';
import { useTags } from '$hooks/queries/useTags';
import {
  useSetMoveCompletedTasksToBottom,
  useSetSearchQuery,
  useSetShowCompletedTasks,
  useSetShowUnstartedTasks,
  useSetSortConfig,
  useSetTaskGroupConfig,
  useUIState,
} from '$hooks/queries/useUIState';
import { useVisibleTasks } from '$hooks/queries/useVisibleTasks';
import type { SortDirection, SortMode, TaskGroupMode } from '$types/sort';
import { getMetaKeyLabel, getModifierJoiner } from '$utils/keyboard';
import { pluralize } from '$utils/misc';

// extracted helper: get sync button tooltip content
const getSynchronisierenTooltip = (
  disableSynchronisieren: boolean,
  isConnectionTesting: boolean,
  isOffline: boolean,
  isSynchronisierening: boolean,
  lastSynchronisierenTime: Date | null | undefined,
  showJustNow: boolean,
  syncShortcut: string,
  syncingCalendarName: string | null,
  syncProgress: { current: number; total: number } | null,
  lastSynchronisierenSource: string | null,
  accountCount: number,
) => {
  if (isConnectionTesting) return 'Verbindungstest läuft …';
  if (disableSynchronisieren) return 'Füge ein Konto hinzu, um die Synchronisierenhronisierung zu nutzen';
  if (isOffline) return 'Keine Synchronisierenhronisierung im Offline-Modus möglich';
  if (isSynchronisierening) {
    const progress =
      syncingCalendarName && syncProgress ? ` (${syncProgress.current}/${syncProgress.total})` : '';
    return syncingCalendarName
      ? `Synchronisierening ${syncingCalendarName}...${progress}`
      : 'Synchronisierenhronisierung läuft …';
  }
  if (lastSynchronisierenTime) {
    const when = formatDistanceToNow(lastSynchronisierenTime, { addSuffix: true });
    const sourceLabel = lastSynchronisierenSource ? SYNC_SOURCE_LABELS[lastSynchronisierenSource] : null;
    const time = showJustNow ? 'gerade eben' : when;
    return sourceLabel ? `Zuletzt synchronisiert ${sourceLabel} ${time}` : `Zuletzt synchronisiert ${time}`;
  }
  return `Synchronisierenhronisieren mit ${pluralize(accountCount, 'server')} (${syncShortcut})`;
};

// extracted helper: get sync button class
const getSynchronisierenButtonClass = (
  isSynchronisierening: boolean,
  isOffline: boolean,
  disableSynchronisieren: boolean,
  isAnyModalOpen: boolean,
) => {
  const base =
    'flex h-9 w-9 items-center justify-center rounded-lg border border-transparent outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset';
  if (isSynchronisierening) {
    return `${base} text-primary-ink border-transparent cursor-not-allowed`;
  }
  if (isOffline || disableSynchronisieren) {
    return `${base} text-surface-500 dark:text-surface-600 border-transparent cursor-not-allowed`;
  }
  return `${base} text-surface-500 dark:text-surface-400 border-transparent ${!isAnyModalOpen ? 'hover:bg-surface-100 dark:hover:bg-surface-700' : ''}`;
};

interface HeaderProps {
  className?: string;
  isSynchronisierening?: boolean;
  syncingCalendarId?: string | null;
  syncProgress?: { current: number; total: number } | null;
  isOffline?: boolean;
  lastSynchronisierenTime?: Date | null;
  lastSynchronisierenSource?: string | null;
  onSynchronisieren?: () => void;
  disableSynchronisieren?: boolean;
  isConnectionTesting?: boolean;
}

export const Header = ({
  className = '',
  isSynchronisierening = false,
  syncingCalendarId = null,
  syncProgress = null,
  isOffline = false,
  lastSynchronisierenTime,
  lastSynchronisierenSource = null,
  onSynchronisieren,
  disableSynchronisieren = false,
  isConnectionTesting = false,
}: HeaderProps) => {
  const { data: uiState } = useUIState();
  const { data: accounts = [] } = useAccounts();
  const { data: filters = [] } = useFilters();
  const { data: tags = [] } = useTags();
  const setSearchQueryMutation = useSetSearchQuery();
  const setSortConfigMutation = useSetSortConfig();
  const setTaskGroupConfigMutation = useSetTaskGroupConfig();
  const setShowCompletedTasksMutation = useSetShowCompletedTasks();
  const setMoveCompletedTasksToBottomMutation = useSetMoveCompletedTasksToBottom();
  const setShowUnstartedTasksMutation = useSetShowUnstartedTasks();
  const visibleTasks = useVisibleTasks();
  const { selectedTaskIdSet, clearSelection } = useTaskSelection();

  const searchQuery = uiState?.searchQuery ?? '';
  const sortConfig = uiState?.sortConfig ?? DEFAULT_SORT_CONFIG;
  const taskGroupConfig = uiState?.taskGroupConfig ?? DEFAULT_TASK_GROUP_CONFIG;
  const activeCalendarId = uiState?.activeCalendarId ?? null;
  const activeTagId = uiState?.activeTagId ?? null;
  const activeFilterId = uiState?.activeFilterId ?? null;
  const showCompletedTasks = uiState?.showCompletedTasks ?? true;
  const moveCompletedTasksToBottom = uiState?.moveCompletedTasksToBottom ?? false;
  const showUnstartedTasks = uiState?.showUnstartedTasks ?? true;
  const activeView = uiState?.activeView ?? 'tasks';

  const { isAnyModalOpen } = useModalState();
  const [showJustNow, setShowJustNow] = useState(false);
  const justSynchronisierenedRef = useRef(false);
  const lastNonManualDirectionRef = useRef<SortDirection>(sortConfig.direction);
  const metaKey = getMetaKeyLabel();
  const modifierJoiner = getModifierJoiner();
  const searchShortcut = `${metaKey}${modifierJoiner}F`;
  const syncShortcut = `${metaKey}${modifierJoiner}R`;

  const selectedTasks = useMemo(
    () => visibleTasks.filter((task) => selectedTaskIdSet.has(task.id)),
    [selectedTaskIdSet, visibleTasks],
  );
  const [isSearchOpen, setIsSearchOpen] = useState(() => Boolean(searchQuery));
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchToggleRef = useRef<HTMLButtonElement>(null);

  const calendars = accounts.flatMap((account) => account.calendars);
  const searchContextTitle = getHeaderContextTitle({
    activeView,
    activeCalendarId,
    activeTagId,
    activeFilterId,
    calendars,
    tags,
    filters,
  });
  const syncingCalendarName = syncingCalendarId
    ? (calendars.find((calendar) => calendar.id === syncingCalendarId)?.displayName ?? null)
    : null;

  // track when sync completes and show "gerade eben" for 3 seconds
  useEffect(() => {
    if (!isSynchronisierening && justSynchronisierenedRef.current) {
      // sync just completed
      setShowJustNow(true);
      justSynchronisierenedRef.current = false;

      const timer = setTimeout(() => setShowJustNow(false), JUST_NOW_SYNC_TEXT_MS_THRESHOLD);

      return () => clearTimeout(timer);
    } else if (isSynchronisierening) {
      // mark that we're syncing
      justSynchronisierenedRef.current = true;
    }
  }, [isSynchronisierening]);

  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);

  const closeSearch = () => {
    setSearchQueryMutation.mutate('');
    setIsSearchOpen(false);
    requestAnimationFrame(() => {
      searchToggleRef.current?.focus();
    });
  };

  const handleSearchKeyDown = (event: ReactKeyboardEvent<HTMLInputElement | HTMLButtonElement>) => {
    if (isAnyModalOpen || event.key !== 'Escape') return;
    event.preventDefault();
    closeSearch();
  };

  const headerIconButtonClass = `flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-transparent text-surface-600 outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset dark:text-surface-400 ${!isAnyModalOpen ? 'hover:bg-surface-100 dark:hover:bg-surface-700' : ''}`;

  const toggleSortDirection = () => {
    const newDirection = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    // save direction preference for non-manual modes
    if (sortConfig.mode !== 'manual') {
      lastNonManualDirectionRef.current = newDirection;
    }
    setSortConfigMutation.mutate({
      ...sortConfig,
      direction: newDirection,
    });
  };

  const handleSortChange = (mode: SortMode) => {
    let direction = sortConfig.direction;

    // save current direction if leaving a non-manual mode
    if (sortConfig.mode !== 'manual') {
      lastNonManualDirectionRef.current = sortConfig.direction;
    }

    // determine direction for new mode
    if (mode === 'manual') {
      // manual mode always uses 'asc' (though it's not actually used)
      direction = 'asc';
    } else if (sortConfig.mode === 'manual') {
      // switching from manual to another mode: restore saved direction
      direction = lastNonManualDirectionRef.current;
    }
    // otherwise keep current direction (switching between non-manual modes)

    setSortConfigMutation.mutate({
      ...sortConfig,
      mode,
      direction,
    });
  };

  const handleTaskGroupChange = (mode: TaskGroupMode) => {
    setTaskGroupConfigMutation.mutate({ ...taskGroupConfig, mode });
  };

  const toggleTaskGroupDirection = () => {
    setTaskGroupConfigMutation.mutate({
      ...taskGroupConfig,
      direction: taskGroupConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  if (selectedTasks.length > 0) {
    return (
      <header
        className={`app-main-header flex h-13 items-center bg-surface-50 pr-4.25 pl-4 dark:bg-surface-900 ${className}`}
      >
        <TaskBatchActionsBar
          data-drag-region-pass-through
          selectedTasks={selectedTasks}
          onClearSelection={clearSelection}
          mode={activeView === 'recently-deleted' ? 'deleted' : 'active'}
        />
      </header>
    );
  }

  return (
    <header
      className={`app-main-header flex h-13 items-center bg-surface-50 pr-4.25 pl-4 dark:bg-surface-900 ${className}`}
    >
      <div
        data-drag-region-pass-through
        className="@container flex min-w-0 flex-1 items-center justify-between gap-2"
      >
        {isSearchOpen ? (
          <div data-drag-region-pass-through className="flex min-w-0 flex-1 items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-surface-500 dark:text-surface-400" />
              <ComposedInput
                ref={searchInputRef}
                type="text"
                data-search-input
                placeholder={`Aufgaben suchen in ${searchContextTitle}...`}
                value={searchQuery}
                onChange={(value) => setSearchQueryMutation.mutate(value)}
                onKeyDown={handleSearchKeyDown}
                className="h-9 w-full rounded-lg border border-surface-300 bg-white py-0 pr-10 pl-9 text-sm text-surface-800 outline-hidden transition-colors placeholder:text-surface-400 hover:border-surface-400 focus:border-primary-ink focus:bg-white focus:hover:border-primary-ink dark:border-surface-700 dark:bg-surface-800/80 dark:text-surface-200 dark:focus:bg-surface-800 dark:hover:border-surface-600 dark:focus:hover:border-primary-ink"
              />
              <button
                type="button"
                data-search-close
                aria-label="Suche schließen"
                title="Suche schließen"
                onClick={closeSearch}
                onKeyDown={handleSearchKeyDown}
                className={`absolute top-1/2 right-1 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-surface-500 outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset dark:text-surface-400 ${!isAnyModalOpen ? 'hover:bg-surface-100 dark:hover:bg-surface-700' : ''}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <HeaderContextTitle
              activeView={activeView}
              activeCalendarId={activeCalendarId}
              activeTagId={activeTagId}
              activeFilterId={activeFilterId}
              calendars={calendars}
              tags={tags}
              filters={filters}
            />

            <div data-drag-region-pass-through className="flex shrink-0 items-center gap-2">
              {onSynchronisieren && (
                <Tooltip
                  content={getSynchronisierenTooltip(
                    disableSynchronisieren,
                    isConnectionTesting,
                    isOffline,
                    isSynchronisierening,
                    lastSynchronisierenTime,
                    showJustNow,
                    syncShortcut,
                    syncingCalendarName,
                    syncProgress,
                    lastSynchronisierenSource,
                    accounts.filter((a) => a.caldav).length,
                  )}
                  position="bottom"
                >
                  <button
                    type="button"
                    onClick={onSynchronisieren}
                    aria-label="Synchronisieren"
                    disabled={isSynchronisierening || isOffline || disableSynchronisieren || isConnectionTesting}
                    className={getSynchronisierenButtonClass(
                      isSynchronisierening,
                      isOffline,
                      disableSynchronisieren || isConnectionTesting,
                      isAnyModalOpen,
                    )}
                  >
                    <RefreshCw
                      className={`h-4 w-4 shrink-0 ${isSynchronisierening ? 'motion-safe:animate-spin' : ''}`}
                    />
                  </button>
                </Tooltip>
              )}

              <HeaderViewMenu
                isAnyModalOpen={isAnyModalOpen}
                sortConfig={sortConfig}
                taskGroupConfig={taskGroupConfig}
                activeCalendarId={activeCalendarId}
                showCompletedTasks={showCompletedTasks}
                showUnstartedTasks={showUnstartedTasks}
                moveCompletedTasksToBottom={moveCompletedTasksToBottom}
                onShowCompletedTasksChange={() =>
                  setShowCompletedTasksMutation.mutate(!showCompletedTasks)
                }
                onShowUnstartedTasksChange={() =>
                  setShowUnstartedTasksMutation.mutate(!showUnstartedTasks)
                }
                onMoveCompletedTasksToBottomChange={() =>
                  setMoveCompletedTasksToBottomMutation.mutate(!moveCompletedTasksToBottom)
                }
                onSortDirectionToggle={toggleSortDirection}
                onSortChange={handleSortChange}
                onTaskGroupDirectionToggle={toggleTaskGroupDirection}
                onTaskGroupChange={handleTaskGroupChange}
              />

              <Tooltip content={`Search tasks (${searchShortcut})`} position="bottom">
                <button
                  ref={searchToggleRef}
                  type="button"
                  data-search-toggle
                  aria-label="Search tasks"
                  onClick={() => setIsSearchOpen(true)}
                  className={headerIconButtonClass}
                >
                  <Search className="h-4 w-4" />
                </button>
              </Tooltip>
            </div>
          </>
        )}
      </div>
    </header>
  );
};
