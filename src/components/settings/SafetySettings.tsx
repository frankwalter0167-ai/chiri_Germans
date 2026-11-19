import type { ReactNode } from 'react';
import { Select } from '$components/Select';
import { useSettingsStore } from '$context/settingsContext';
import type { SubtaskDeletionBehavior } from '$types/settings/categories/safety';

const RETENTION_OPTIONS = [7, 14, 30, 60, 90];

const Section = ({ children, title }: { children: ReactNode; title: string }) => (
  <div className="space-y-4">
    <h4 className="font-semibold text-sm text-surface-700 dark:text-surface-300">{title}</h4>
    {children}
  </div>
);

const Card = ({ children }: { children: ReactNode }) => (
  <div className="overflow-hidden rounded-lg border border-surface-300 bg-white dark:border-surface-700 dark:bg-surface-800">
    {children}
  </div>
);

const RowDivider = () => <div className="border-surface-300 border-t dark:border-surface-700" />;

const Label = ({ children }: { children: ReactNode }) => (
  <p className="text-sm text-surface-700 dark:text-surface-300">{children}</p>
);

const Hint = ({ children }: { children: ReactNode }) => (
  <p className="text-surface-500 text-xs dark:text-surface-400">{children}</p>
);

export const SafetySettings = () => {
  const {
    confirmBeforeMoveToRecentlyDeleted,
    setConfirmBeforeMoveToRecentlyDeleted,
    deleteSubtasksWithParent,
    setDeleteSubtasksWithParent,
    autoEmptyRecentlyDeleted,
    setAutoEmptyRecentlyDeleted,
    recentlyDeletedRetentionDays,
    setRecentlyDeletedRetentionDays,
  } = useSettingsStore();

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-base text-surface-800 dark:text-surface-200">Sicherheit</h3>

      <Section title="Aufgaben löschen">
        <Card>
          <label className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <Label>Vor dem Verschieben in „Kürzlich gelöscht“ bestätigen</Label>
              <Hint>Vor dem vorläufigen Löschen von Aufgaben nachfragen</Hint>
            </div>
            <input
              type="checkbox"
              checked={confirmBeforeMoveToRecentlyDeleted}
              onChange={(event) => setConfirmBeforeMoveToRecentlyDeleted(event.target.checked)}
              className="shrink-0 rounded-sm border-surface-300 outline-hidden focus:ring-2 focus:ring-primary-ink focus:ring-offset-2"
            />
          </label>

          <RowDivider />

          <div className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <Label>Aufgaben mit Unteraufgaben</Label>
              <Hint>Lege fest, was mit Unteraufgaben geschieht, wenn die übergeordnete Aufgabe gelöscht wird</Hint>
            </div>
            <Select
              value={deleteSubtasksWithParent}
              onChange={(event) =>
                setDeleteSubtasksWithParent(event.target.value as SubtaskDeletionBehavior)
              }
              className="shrink-0 rounded-lg border border-transparent bg-surface-100 text-sm text-surface-800 outline-hidden transition-colors focus:border-primary-ink focus:bg-white dark:bg-surface-700 dark:text-surface-200 dark:focus:bg-surface-800"
            >
              <option value="delete">Unteraufgaben löschen</option>
              <option value="keep">Unteraufgaben behalten</option>
            </Select>
          </div>
        </Card>
      </Section>

      <Section title="Kürzlich gelöscht">
        <Card>
          <label className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <Label>„Kürzlich gelöscht“ automatisch leeren</Label>
              <Hint>Alte gelöschte Aufgaben endgültig löschen</Hint>
            </div>
            <input
              type="checkbox"
              checked={autoEmptyRecentlyDeleted}
              onChange={(event) => setAutoEmptyRecentlyDeleted(event.target.checked)}
              className="shrink-0 rounded-sm border-surface-300 outline-hidden focus:ring-2 focus:ring-primary-ink focus:ring-offset-2"
            />
          </label>

          {autoEmptyRecentlyDeleted && (
            <div className="px-4 pb-4">
              <div className="border-surface-300 border-l-2 pl-4 dark:border-surface-600">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <Label>Aufbewahrungsdauer für „Kürzlich gelöscht“</Label>
                    <Hint>Gelöschte Aufgaben bis zur endgültigen Löschung aufbewahren</Hint>
                  </div>
                  <Select
                    value={recentlyDeletedRetentionDays.toString()}
                    onChange={(event) =>
                      setRecentlyDeletedRetentionDays(Number(event.target.value))
                    }
                    className="shrink-0 rounded-lg border border-transparent bg-surface-100 text-sm text-surface-800 outline-hidden transition-colors focus:border-primary-ink focus:bg-white dark:bg-surface-700 dark:text-surface-200 dark:focus:bg-surface-800"
                  >
                    {RETENTION_OPTIONS.map((days) => (
                      <option key={days} value={days}>
                        {days} {days === 1 ? 'Tag' : 'Tage'}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
          )}
        </Card>
      </Section>
    </div>
  );
};
