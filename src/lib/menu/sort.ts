import type { SortMode } from '$types/sort';

/** sort modes exposed in the View › Sort By menu ('status' has no menu entry) */
type MenuSortMode = Exclude<SortMode, 'status'>;

export const SORT_LABELS: Record<MenuSortMode, string> = {
  manual: 'Manuell',
  smart: 'Intelligente Sortierung',
  priority: 'Priorität',
  'start-date': 'Startdatum',
  'due-date': 'Fälligkeitsdatum',
  title: 'Titel',
  created: 'Erstellt am',
  modified: 'Geändert am',
};

/** the active sort mode is marked with a leading checkmark (radio button behavior) */
export const withCheckmark = (label: string, checked: boolean) => (checked ? `✓ ${label}` : label);
