import RotateCcw from 'lucide-react/icons/rotate-ccw';
import { Select } from '$components/Select';
import { useSettingsStore } from '$context/settingsContext';
import { defaultState } from '$context/settingsDefaults';
import type { DefaultDateOffset } from '$types/settings/categories/defaults';

const DUE_DATE_OPTIONS = [
  { value: 'none', label: 'Keine' },
  { value: 'today', label: 'Heute' },
  { value: 'tomorrow', label: 'Morgen' },
  { value: 'next-working-day', label: 'Nächster Arbeitstag' },
  { value: '1week', label: 'In 1 Woche' },
  { value: '2weeks', label: 'In 2 Wochen' },
] as const;

const START_DATE_OPTION_GROUPS = [
  {
    label: 'Bezogen auf heute',
    options: [
      { value: 'today', label: 'Heute' },
      { value: 'tomorrow', label: 'Morgen' },
      { value: 'next-working-day', label: 'Nächster Arbeitstag' },
      { value: '1week', label: 'In 1 Woche' },
      { value: '2weeks', label: 'In 2 Wochen' },
    ],
  },
  {
    label: 'Bezogen auf das Fälligkeitsdatum',
    options: [
      { value: 'due-date', label: 'Fälligkeitsdatum' },
      { value: 'due-time', label: 'Fälligkeitszeit' },
      { value: '1day-before-due', label: 'Tag vor Fälligkeit' },
      { value: '1week-before-due', label: 'Woche vor Fälligkeit' },
    ],
  },
] as const;

const selectClassName =
  'w-[160px] text-sm border border-transparent bg-surface-100 dark:bg-surface-700 text-surface-800 dark:text-surface-200 rounded-lg outline-hidden focus:border-primary-ink focus:bg-white dark:focus:bg-surface-800 transition-colors shrink-0';

export const TaskDefaultsSettingsDateSection = () => {
  const { defaultStartDate, setDefaultStartDate, defaultDueDate, setDefaultDueDate } =
    useSettingsStore();

  const handleReset = () => {
    setDefaultStartDate(defaultState.defaultStartDate);
    setDefaultDueDate(defaultState.defaultDueDate);
  };

  const hasChanged =
    defaultStartDate !== defaultState.defaultStartDate ||
    defaultDueDate !== defaultState.defaultDueDate;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm text-surface-700 dark:text-surface-300">Datum</h4>
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

      <div className="overflow-hidden rounded-lg border border-surface-300 bg-white dark:border-surface-700 dark:bg-surface-800">
        <div className="flex items-center justify-between gap-4 p-4">
          <div>
            <p
              id="default-start-date-label"
              className="text-sm text-surface-700 dark:text-surface-300"
            >
              Startdatum
            </p>
            <p
              id="default-start-date-description"
              className="text-surface-500 text-xs dark:text-surface-400"
            >
              Wird beim Erstellen einer neuen Aufgabe angewendet
            </p>
          </div>
          <Select
            value={defaultStartDate}
            onChange={(e) => setDefaultStartDate(e.target.value as DefaultDateOffset)}
            aria-labelledby="default-start-date-label"
            aria-describedby="default-start-date-description"
            className={selectClassName}
          >
            <option value="none">Keine</option>
            {START_DATE_OPTION_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </Select>
        </div>

        <div className="border-surface-300 border-t dark:border-surface-700" />

        <div className="flex items-center justify-between gap-4 p-4">
          <div>
            <p
              id="default-due-date-label"
              className="text-sm text-surface-700 dark:text-surface-300"
            >
              Fälligkeitsdatum
            </p>
            <p
              id="default-due-date-description"
              className="text-surface-500 text-xs dark:text-surface-400"
            >
              Wird beim Erstellen einer neuen Aufgabe angewendet
            </p>
          </div>
          <Select
            value={defaultDueDate}
            onChange={(e) => setDefaultDueDate(e.target.value as typeof defaultDueDate)}
            aria-labelledby="default-due-date-label"
            aria-describedby="default-due-date-description"
            className={selectClassName}
          >
            {DUE_DATE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
};
