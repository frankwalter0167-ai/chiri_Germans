import { listen } from '@tauri-apps/api/event';
import { type RefObject, useEffect } from 'react';
import { DEFAULT_SORT_CONFIG } from '$constants';
import { MENU_EVENTS } from '$constants/menu';
import { useModalState } from '$context/modalStateContext';
import { useUIState } from '$hooks/queries/useUIState';
import { loggers } from '$lib/logger';
import type { SortDirection, SortMode } from '$types/sort';

const log = loggers.menu;

interface MenuCallbacks {
  onNewTask?: RefObject<(() => void) | null>;
  onOpenSettings?: RefObject<(() => void) | null>;
  onOpenImport?: RefObject<(() => void) | null>;
  onOpenAccount?: RefObject<(() => void) | null>;
  onEditAccount?: RefObject<((accountId: string, reauthorize?: boolean) => void) | null>;
  onOpenCreateCalendar?: RefObject<((accountId?: string) => void) | null>;
  onSearch?: RefObject<(() => void) | null>;
  onOpenAbout?: RefObject<(() => void) | null>;
  onOpenKeyboardShortcuts?: RefObject<(() => void) | null>;
  onToggleCompleted?: RefObject<((currentValue: boolean) => void) | null>;
  onToggleCompletedToBottom?: RefObject<((currentValue: boolean) => void) | null>;
  onToggleUnstarted?: RefObject<((currentValue: boolean) => void) | null>;
  onSync?: RefObject<(() => void) | null>;
  onAllTasks?: RefObject<(() => void) | null>;
  onRecentlyDeleted?: RefObject<(() => void) | null>;
  onSetSortMode?: RefObject<
    ((mode: SortMode, currentMode: SortMode, currentDirection: SortDirection) => void) | null
  >;
  onSetSortDirection?: RefObject<
    ((direction: SortDirection, currentMode: SortMode) => void) | null
  >;
  onSelectFilter?: RefObject<((filterId: string) => void) | null>;
  onSelectCalendar?: RefObject<((accountId: string, calendarId: string) => void) | null>;
  onSelectTag?: RefObject<((tagId: string) => void) | null>;
  onToggleSidebar?: RefObject<(() => void) | null>;
  onSelectAllTasks?: RefObject<(() => void) | null>;
  onNavPrevList?: RefObject<(() => void) | null>;
  onNavNextList?: RefObject<(() => void) | null>;
  onCheckForUpdates?: RefObject<(() => void) | null>;
  onShowChangelog?: RefObject<(() => void) | null>;
  onRemoveAccount?: RefObject<((accountId: string) => void) | null>;
  onSyncCalendar?: RefObject<((calendarId: string, accountId: string) => void) | null>;
  onEditCalendar?: RefObject<((calendarId: string, accountId: string) => void) | null>;
  onExportCalendar?: RefObject<((calendarId: string, accountId: string) => void) | null>;
  onDeleteCalendar?: RefObject<((calendarId: string, accountId: string) => void) | null>;
}

// simple event configuration for events that just call a callback
type SimpleEventConfig = {
  event: string;
  callback: keyof MenuCallbacks;
  label: string;
};

// parameterized event configuration for events with payloads
type ParamEventConfig = {
  event: string;
  label: string;
  handler: (callbacks: MenuCallbacks, payload: Record<string, unknown>) => void;
};

const SIMPLE_EVENTS: SimpleEventConfig[] = [
  { event: MENU_EVENTS.NEW_TASK, callback: 'onNewTask', label: 'Neue Aufgabe' },
  { event: MENU_EVENTS.SYNC, callback: 'onSync', label: 'Synchronisieren' },
  { event: MENU_EVENTS.ALL_TASKS, callback: 'onAllTasks', label: 'Alle Aufgaben' },
  {
    event: MENU_EVENTS.RECENTLY_DELETED,
    callback: 'onRecentlyDeleted',
    label: 'Zuletzt gelöscht',
  },
  { event: MENU_EVENTS.PREFERENCES, callback: 'onOpenSettings', label: 'Einstellungen' },
  { event: MENU_EVENTS.ADD_ACCOUNT, callback: 'onOpenAccount', label: 'Konto hinzufügen' },
  { event: MENU_EVENTS.IMPORT_TASKS, callback: 'onOpenImport', label: 'Aufgaben importieren' },
  { event: MENU_EVENTS.SEARCH, callback: 'onSearch', label: 'Suchen' },
  { event: MENU_EVENTS.ABOUT, callback: 'onOpenAbout', label: 'Über Chiri' },
  {
    event: MENU_EVENTS.SHOW_KEYBOARD_SHORTCUTS,
    callback: 'onOpenKeyboardShortcuts',
    label: 'Tastenkombinationen anzeigen',
  },
  { event: MENU_EVENTS.TOGGLE_SIDEBAR, callback: 'onToggleSidebar', label: 'Seitenleiste ein-/ausblenden' },
  { event: MENU_EVENTS.SELECT_ALL, callback: 'onSelectAllTasks', label: 'Alle auswählen' },
  { event: MENU_EVENTS.NAV_PREV_LIST, callback: 'onNavPrevList', label: 'Vorherige Liste' },
  { event: MENU_EVENTS.NAV_NEXT_LIST, callback: 'onNavNextList', label: 'Nächste Liste' },
  {
    event: MENU_EVENTS.CHECK_FOR_UPDATES,
    callback: 'onCheckForUpdates',
    label: 'Nach Updates suchen',
  },
  { event: MENU_EVENTS.SHOW_CHANGELOG, callback: 'onShowChangelog', label: 'Änderungsprotokoll anzeigen' },
];

const PARAM_EVENTS: ParamEventConfig[] = [
  {
    event: MENU_EVENTS.SELECT_FILTER,
    label: 'Filter auswählen',
    handler: (cb, p) => cb.onSelectFilter?.current?.(p.filterId as string),
  },
  {
    event: MENU_EVENTS.SELECT_CALENDAR,
    label: 'Kalender auswählen',
    handler: (cb, p) =>
      cb.onSelectCalendar?.current?.(p.accountId as string, p.calendarId as string),
  },
  {
    event: MENU_EVENTS.SELECT_TAG,
    label: 'Schlagwort auswählen',
    handler: (cb, p) => cb.onSelectTag?.current?.(p.tagId as string),
  },
  {
    event: MENU_EVENTS.EDIT_ACCOUNT,
    label: 'Konto bearbeiten',
    handler: (cb, p) => cb.onEditAccount?.current?.(p.accountId as string, p.reauthorize === true),
  },
  {
    event: MENU_EVENTS.ADD_CALENDAR,
    label: 'Kalender hinzufügen',
    handler: (cb, p) => cb.onOpenCreateCalendar?.current?.((p.accountId as string) ?? undefined),
  },
  {
    event: MENU_EVENTS.REMOVE_ACCOUNT,
    label: 'Konto entfernen',
    handler: (cb, p) => cb.onRemoveAccount?.current?.(p.accountId as string),
  },
  {
    event: MENU_EVENTS.SYNC_CALENDAR,
    label: 'Kalender synchronisieren',
    handler: (cb, p) => cb.onSyncCalendar?.current?.(p.calendarId as string, p.accountId as string),
  },
  {
    event: MENU_EVENTS.EDIT_CALENDAR,
    label: 'Kalender bearbeiten',
    handler: (cb, p) => cb.onEditCalendar?.current?.(p.calendarId as string, p.accountId as string),
  },
  {
    event: MENU_EVENTS.EXPORT_CALENDAR,
    label: 'Kalender exportieren',
    handler: (cb, p) =>
      cb.onExportCalendar?.current?.(p.calendarId as string, p.accountId as string),
  },
  {
    event: MENU_EVENTS.DELETE_CALENDAR,
    label: 'Kalender löschen',
    handler: (cb, p) =>
      cb.onDeleteCalendar?.current?.(p.calendarId as string, p.accountId as string),
  },
];

const SORT_MODE_MAP: Record<string, SortMode> = {
  [MENU_EVENTS.SORT_MANUAL]: 'manual',
  [MENU_EVENTS.SORT_SMART]: 'smart',
  [MENU_EVENTS.SORT_START_DATE]: 'start-date',
  [MENU_EVENTS.SORT_DUE_DATE]: 'due-date',
  [MENU_EVENTS.SORT_PRIORITY]: 'priority',
  [MENU_EVENTS.SORT_TITLE]: 'title',
  [MENU_EVENTS.SORT_CREATED]: 'created',
  [MENU_EVENTS.SORT_MODIFIED]: 'modified',
};

const MODAL_BLOCKED_MENU_EVENTS = new Set<string>([
  MENU_EVENTS.NEW_TASK,
  MENU_EVENTS.SYNC,
  MENU_EVENTS.PREFERENCES,
  MENU_EVENTS.ADD_ACCOUNT,
  MENU_EVENTS.EDIT_ACCOUNT,
  MENU_EVENTS.ADD_CALENDAR,
  MENU_EVENTS.IMPORT_TASKS,
  MENU_EVENTS.SEARCH,
  MENU_EVENTS.SHOW_KEYBOARD_SHORTCUTS,
  MENU_EVENTS.TOGGLE_COMPLETED,
  MENU_EVENTS.TOGGLE_COMPLETED_TO_BOTTOM,
  MENU_EVENTS.TOGGLE_UNSTARTED,
  MENU_EVENTS.ALL_TASKS,
  MENU_EVENTS.RECENTLY_DELETED,
  MENU_EVENTS.SORT_MANUAL,
  MENU_EVENTS.SORT_SMART,
  MENU_EVENTS.SORT_START_DATE,
  MENU_EVENTS.SORT_DUE_DATE,
  MENU_EVENTS.SORT_PRIORITY,
  MENU_EVENTS.SORT_TITLE,
  MENU_EVENTS.SORT_CREATED,
  MENU_EVENTS.SORT_MODIFIED,
  MENU_EVENTS.SORT_DIRECTION_ASC,
  MENU_EVENTS.SORT_DIRECTION_DESC,
  MENU_EVENTS.SELECT_FILTER,
  MENU_EVENTS.SELECT_CALENDAR,
  MENU_EVENTS.SELECT_TAG,
  MENU_EVENTS.TOGGLE_SIDEBAR,
  MENU_EVENTS.SELECT_ALL,
  MENU_EVENTS.NAV_PREV_LIST,
  MENU_EVENTS.NAV_NEXT_LIST,
  MENU_EVENTS.CHECK_FOR_UPDATES,
  MENU_EVENTS.SHOW_CHANGELOG,
  MENU_EVENTS.ABOUT,
  MENU_EVENTS.REMOVE_ACCOUNT,
  MENU_EVENTS.SYNC_CALENDAR,
  MENU_EVENTS.EDIT_CALENDAR,
  MENU_EVENTS.EXPORT_CALENDAR,
  MENU_EVENTS.DELETE_CALENDAR,
]);

export const isMenuEventBlockedByModal = (event: string, isModalOpen: boolean) =>
  isModalOpen && MODAL_BLOCKED_MENU_EVENTS.has(event);

type MenuEventBlocker = (event: string, label: string) => boolean;

/**
 * register a single listener and track cleanup
 */
const registerListener = async <T = unknown>(
  event: string,
  handler: (payload: T) => void,
  unlistenCallbacks: (() => void)[],
  isActiveRef: { current: boolean },
) => {
  const unlisten = await listen<T>(event, (e) => handler(e.payload as T));
  if (!isActiveRef.current) {
    unlisten();
    return false;
  }
  unlistenCallbacks.push(unlisten);
  return true;
};

// helper: register all simple events
const registerSimpleEvents = async (
  callbacks: MenuCallbacks,
  unlistenCallbacks: (() => void)[],
  isActiveRef: { current: boolean },
  isBlocked: MenuEventBlocker,
) => {
  for (const config of SIMPLE_EVENTS) {
    const success = await registerListener(
      config.event,
      () => {
        if (isBlocked(config.event, config.label)) return;
        log.debug(`${config.label} triggered`);
        const cb = callbacks[config.callback];
        if (cb && 'current' in cb) {
          (cb.current as (() => void) | null)?.();
        }
      },
      unlistenCallbacks,
      isActiveRef,
    );
    if (!success) return false;
  }
  return true;
};

// helper: register parameterized events
const registerParamEvents = async (
  callbacks: MenuCallbacks,
  unlistenCallbacks: (() => void)[],
  isActiveRef: { current: boolean },
  isBlocked: MenuEventBlocker,
) => {
  for (const config of PARAM_EVENTS) {
    const success = await registerListener<Record<string, unknown>>(
      config.event,
      (payload) => {
        const isOAuthReauthorization =
          config.event === MENU_EVENTS.EDIT_ACCOUNT && payload.reauthorize === true;
        if (!isOAuthReauthorization && isBlocked(config.event, config.label)) return;
        log.debug(`${config.label} triggered`, payload);
        config.handler(callbacks, payload);
      },
      unlistenCallbacks,
      isActiveRef,
    );
    if (!success) return false;
  }
  return true;
};

// helper: register sort mode events
const registerSortModeEvents = async (
  callbacks: MenuCallbacks,
  uiState: ReturnType<typeof useUIState>['data'],
  unlistenCallbacks: (() => void)[],
  isActiveRef: { current: boolean },
  isBlocked: MenuEventBlocker,
) => {
  for (const [event, mode] of Object.entries(SORT_MODE_MAP)) {
    const success = await registerListener(
      event,
      () => {
        if (isBlocked(event, `Sort ${mode}`)) return;
        log.debug(`Sort ${mode} triggered`);
        const currentMode = uiState?.sortConfig?.mode ?? DEFAULT_SORT_CONFIG.mode;
        const currentDirection = uiState?.sortConfig?.direction ?? DEFAULT_SORT_CONFIG.direction;
        callbacks.onSetSortMode?.current?.(mode, currentMode, currentDirection);
      },
      unlistenCallbacks,
      isActiveRef,
    );
    if (!success) return false;
  }
  return true;
};

// helper: register sort direction events
const registerSortDirectionEvents = async (
  callbacks: MenuCallbacks,
  uiState: ReturnType<typeof useUIState>['data'],
  unlistenCallbacks: (() => void)[],
  isActiveRef: { current: boolean },
  isBlocked: MenuEventBlocker,
) => {
  const sortDirections: Array<{ event: string; direction: SortDirection; label: string }> = [
    { event: MENU_EVENTS.SORT_DIRECTION_ASC, direction: 'asc', label: 'Aufsteigend' },
    { event: MENU_EVENTS.SORT_DIRECTION_DESC, direction: 'desc', label: 'Absteigend' },
  ];

  for (const { event, direction, label } of sortDirections) {
    const success = await registerListener(
      event,
      () => {
        if (isBlocked(event, `Sort Direction ${label}`)) return;
        log.debug(`Sort Direction ${label} triggered`);
        const currentMode = uiState?.sortConfig?.mode ?? DEFAULT_SORT_CONFIG.mode;
        callbacks.onSetSortDirection?.current?.(direction, currentMode);
      },
      unlistenCallbacks,
      isActiveRef,
    );
    if (!success) return false;
  }
  return true;
};

/**
 * hook to listen for menu events and handle them appropriately
 * should be used in the root App component
 */
export const useMenuEvents = (callbacks: MenuCallbacks) => {
  const { data: uiState } = useUIState();
  const { isAnyModalOpen } = useModalState();

  useEffect(() => {
    const isActiveRef = { current: true };
    const unlistenCallbacks: (() => void)[] = [];
    const isBlocked: MenuEventBlocker = (event, label) => {
      if (!isMenuEventBlockedByModal(event, isAnyModalOpen)) return false;
      log.debug(`${label} ignored while a modal is open`);
      return true;
    };

    const setupListeners = async () => {
      // register simple events (no payload)
      if (!(await registerSimpleEvents(callbacks, unlistenCallbacks, isActiveRef, isBlocked)))
        return;

      // register toggle events (need current UI state)
      const toggleSuccess = await registerListener(
        MENU_EVENTS.TOGGLE_COMPLETED,
        () => {
          if (isBlocked(MENU_EVENTS.TOGGLE_COMPLETED, 'Erledigte Aufgaben umschalten')) return;
          log.debug('Toggle Completed triggered');
          callbacks.onToggleCompleted?.current?.(uiState?.showCompletedTasks ?? true);
        },
        unlistenCallbacks,
        isActiveRef,
      );
      if (!toggleSuccess) return;

      const toggleCompletedToBottomSuccess = await registerListener(
        MENU_EVENTS.TOGGLE_COMPLETED_TO_BOTTOM,
        () => {
          if (isBlocked(MENU_EVENTS.TOGGLE_COMPLETED_TO_BOTTOM, 'Erledigte Aufgaben nach unten verschieben'))
            return;
          log.debug('Toggle Completed to Bottom triggered');
          callbacks.onToggleCompletedToBottom?.current?.(
            uiState?.moveCompletedTasksToBottom ?? false,
          );
        },
        unlistenCallbacks,
        isActiveRef,
      );
      if (!toggleCompletedToBottomSuccess) return;

      const toggleUnstartedSuccess = await registerListener(
        MENU_EVENTS.TOGGLE_UNSTARTED,
        () => {
          if (isBlocked(MENU_EVENTS.TOGGLE_UNSTARTED, 'Noch nicht begonnene Aufgaben umschalten')) return;
          log.debug('Toggle Unstarted triggered');
          callbacks.onToggleUnstarted?.current?.(uiState?.showUnstartedTasks ?? true);
        },
        unlistenCallbacks,
        isActiveRef,
      );
      if (!toggleUnstartedSuccess) return;

      // register parameterized events (with payload)
      if (!(await registerParamEvents(callbacks, unlistenCallbacks, isActiveRef, isBlocked)))
        return;

      // register sort mode events
      if (
        !(await registerSortModeEvents(
          callbacks,
          uiState,
          unlistenCallbacks,
          isActiveRef,
          isBlocked,
        ))
      )
        return;

      // register sort direction events
      if (
        !(await registerSortDirectionEvents(
          callbacks,
          uiState,
          unlistenCallbacks,
          isActiveRef,
          isBlocked,
        ))
      )
        return;
    };

    setupListeners().catch((error) => {
      log.error('Failed to setup menu event listeners:', error);
    });

    return () => {
      isActiveRef.current = false;
      for (const unlisten of unlistenCallbacks) {
        unlisten();
      }
    };
  }, [callbacks, uiState, isAnyModalOpen]);
};
