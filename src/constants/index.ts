import type { KeyboardShortcut } from '$types/shortcuts';
import type {
  AccountSortMode,
  CalendarSortMode,
  FilterSortMode,
  SortDirection,
  SortMode,
  TagSortMode,
  TaskGroupConfig,
  TaskGroupMode,
} from '$types/sort';
import type { Status } from '$types/task/model';

export const DEFAULT_DAY_OF_WEEK = 'monday';

export const DEFAULT_CALENDAR_NAME = 'Standardkalender';

export const APPLE_DEFAULT_TASK_CALENDAR_NAME = 'DEFAULT_TASK_CALENDAR_NAME';
export const APPLE_DEFAULT_TASK_CALENDAR_DISPLAY_NAME = 'Reminders';

export const RECENTLY_DELETED_RETENTION_DAYS = 30;
export const RECENTLY_DELETED_CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

export const MAX_NOTIFICATION_ACTIONS = 5;

// default time for date pickers when no time is specified
export const DEFAULT_TIME = {
  hours: 12,
  minutes: 0,
} as const;

export const MODAL_SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
} as const;

export const JUST_NOW_SYNC_TEXT_MS_THRESHOLD = 60000;

export const STATUS_ORDER: Record<Status, number> = {
  'needs-action': 0,
  'in-process': 1,
  completed: 2,
  cancelled: 3,
};

export const DEFAULT_SORT_CONFIG = {
  mode: 'manual' as const satisfies SortMode,
  direction: 'asc' as const satisfies SortDirection,
};

export const DEFAULT_TASK_GROUP_CONFIG = {
  mode: 'none',
  direction: 'asc',
} as const satisfies TaskGroupConfig;

export const DEFAULT_ACCOUNT_SORT_CONFIG = {
  mode: 'manual' as const satisfies AccountSortMode,
  direction: 'asc' as const satisfies SortDirection,
};

export const ACCOUNT_SORT_OPTIONS: Array<{ value: AccountSortMode; label: string }> = [
  { value: 'manual', label: 'Manuell' },
  { value: 'title', label: 'Titel' },
  { value: 'task-count', label: 'Aufgabenanzahl' },
  { value: 'calendar-count', label: 'Kalenderanzahl' },
];

export const DEFAULT_CALENDAR_SORT_CONFIG = {
  mode: 'manual' as const satisfies CalendarSortMode,
  direction: 'asc' as const satisfies SortDirection,
};

export const CALENDAR_SORT_OPTIONS: Array<{ value: CalendarSortMode; label: string }> = [
  { value: 'manual', label: 'Manuell' },
  { value: 'server', label: 'Serverreihenfolge' },
  { value: 'title', label: 'Titel' },
  { value: 'task-count', label: 'Aufgabenanzahl' },
];

export const LOCAL_CALENDAR_SORT_OPTIONS = CALENDAR_SORT_OPTIONS.filter(
  (option) => option.value !== 'server',
);

export const DEFAULT_TAG_SORT_CONFIG = {
  mode: 'manual' as const satisfies TagSortMode,
  direction: 'asc' as const satisfies SortDirection,
};

export const TAG_SORT_OPTIONS: Array<{ value: TagSortMode; label: string }> = [
  { value: 'manual', label: 'Manuell' },
  { value: 'title', label: 'Titel' },
  { value: 'task-count', label: 'Aufgabenanzahl' },
];

export const DEFAULT_FILTER_SORT_CONFIG = {
  mode: 'manual' as const satisfies FilterSortMode,
  direction: 'asc' as const satisfies SortDirection,
};

export const FILTER_SORT_OPTIONS: Array<{ value: FilterSortMode; label: string }> = [
  { value: 'manual', label: 'Manuell' },
  { value: 'title', label: 'Titel' },
  { value: 'task-count', label: 'Aufgabenanzahl' },
];

export const SORT_OPTIONS: Array<{ value: SortMode; label: string }> = [
  { value: 'manual', label: 'Manuell' },
  { value: 'smart', label: 'Intelligente Sortierung' },
  { value: 'status', label: 'Status' },
  { value: 'start-date', label: 'Startdatum' },
  { value: 'due-date', label: 'Fälligkeitsdatum' },
  { value: 'priority', label: 'Priorität' },
  { value: 'title', label: 'Titel' },
  { value: 'modified', label: 'Zuletzt geändert' },
  { value: 'created', label: 'Erstellt' },
];

export const TASK_GROUP_OPTIONS: Array<{ value: TaskGroupMode; label: string }> = [
  { value: 'none', label: 'Keine' },
  { value: 'status', label: 'Status' },
  { value: 'calendar', label: 'Kalender' },
  { value: 'start-date', label: 'Startdatum' },
  { value: 'due-date', label: 'Fälligkeitsdatum' },
  { value: 'priority', label: 'Priorität' },
  { value: 'modified', label: 'Zuletzt geändert' },
  { value: 'created', label: 'Erstellt' },
];

export const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  { id: 'new-task', key: 'n', meta: true, description: 'Neue Aufgabe erstellen' },
  {
    id: 'select-all-tasks',
    key: 'a',
    meta: true,
    description: 'Alle sichtbaren Aufgaben auswählen',
  },
  { id: 'search', key: 'f', meta: true, description: 'Suchfeld fokussieren' },
  { id: 'settings', key: ',', meta: true, description: 'Einstellungen öffnen' },
  {
    id: 'keyboard-shortcuts',
    key: '/',
    meta: true,
    description: 'Tastenkürzel öffnen',
  },
  { id: 'sync', key: 'r', meta: true, description: 'Mit Server synchronisieren' },
  { id: 'import-tasks', key: 'i', meta: true, description: 'Aufgaben importieren' },
  {
    id: 'delete',
    key: 'Backspace',
    meta: true,
    description: 'Ausgewählte Aufgabe löschen',
  },
  { id: 'toggle-complete', key: 'x', description: 'Aufgabenerledigung umschalten' },
  {
    id: 'toggle-show-completed',
    key: 'h',
    meta: true,
    shift: true,
    description: 'Anzeige erledigter Aufgaben umschalten',
  },
  {
    id: 'toggle-completed-to-bottom',
    key: 'b',
    meta: true,
    shift: true,
    description: 'Erledigte Aufgaben nach unten verschieben',
  },
  { id: 'toggle-show-unstarted', key: 'u', meta: true, description: 'Anzeige nicht begonnener Aufgaben umschalten' },
  { id: 'nav-up', key: 'ArrowUp', description: 'Zur vorherigen Aufgabe wechseln' },
  { id: 'nav-down', key: 'ArrowDown', description: 'Zur nächsten Aufgabe wechseln' },
  { id: 'nav-prev-list', key: '[', meta: true, description: 'Zur vorherigen Liste wechseln' },
  { id: 'nav-next-list', key: ']', meta: true, description: 'Zur nächsten Liste wechseln' },
  { id: 'toggle-sidebar', key: 'e', meta: true, description: 'Seitenleiste ein- oder ausblenden' },
];

export const TASK_LIST_INDENT_SHIFT_SIZE = 28;

export const MIN_SIDEBAR_WIDTH = 256;
export const MAX_SIDEBAR_WIDTH = 600;
export const DEFAULT_SIDEBAR_WIDTH = 300;

export const MIN_EDITOR_WIDTH = 330;
export const MAX_EDITOR_WIDTH = 600;
export const DEFAULT_EDITOR_WIDTH = 400;
