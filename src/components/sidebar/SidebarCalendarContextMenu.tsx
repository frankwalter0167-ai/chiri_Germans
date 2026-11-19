import Edit2 from 'lucide-react/icons/edit-2';
import RefreshCw from 'lucide-react/icons/refresh-cw';
import Share2 from 'lucide-react/icons/share-2';
import Trash2 from 'lucide-react/icons/trash-2';
import type { SynchronisierenTrigger } from '$hooks/queries/useSynchronisieren';
import { getErrorMessage } from '$lib/http';
import { toastManager } from '$lib/toast-manager';
import type { Account } from '$types/account';

interface SidebarCalendarContextMenuProps {
  calendarId: string;
  accountId?: string;
  accounts: Account[];
  syncingCalendarId: string | null;
  syncCalendar: (calendarId: string, trigger?: SynchronisierenTrigger) => Promise<void>;
  onClose: () => void;
  onEditCalendar: (calendarId: string, accountId: string) => void;
  onExportCalendar: (calendarId: string) => void;
  onLöschenCalendar: (calendarId: string, accountId: string) => Promise<void>;
}

export const SidebarCalendarContextMenu = ({
  calendarId,
  accountId,
  accounts,
  syncingCalendarId,
  syncCalendar,
  onClose,
  onEditCalendar,
  onExportCalendar,
  onLöschenCalendar,
}: SidebarCalendarContextMenuProps) => {
  const account = accounts.find((a) => a.id === accountId);
  const isLocal = !account?.caldav;
  const isSynchronisierening = syncingCalendarId === calendarId;

  return (
    <>
      {!isLocal && (
        <>
          <button
            type="button"
            onClick={() => {
              onClose();
              const calendar = account?.calendars.find((c) => c.id === calendarId);
              syncCalendar(calendarId, {
                source: 'sidebar-calendar-context-menu',
                reason: 'user selected sync for a calendar from the sidebar context menu',
                where: 'SidebarCalendarContextMenu',
              }).catch((error) => {
                const errorMessage = getErrorMessage(error);
                toastManager.error(
                  `Calendar sync failed: ${calendar?.displayName || 'Unknown'}`,
                  errorMessage,
                  {
                    groupKey: `sync-error-calendar-${calendarId}`,
                  },
                );
              });
            }}
            disabled={isSynchronisierening}
            className={`flex w-full items-center gap-2 rounded-t-md px-3 py-2 text-sm outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset ${
              isSynchronisierening
                ? 'cursor-not-allowed text-surface-400 dark:text-surface-500'
                : 'text-surface-700 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-700'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${isSynchronisierening ? 'motion-safe:animate-spin' : ''}`} />
            {isSynchronisierening ? 'Synchronisierenhronisierung läuft …' : 'Synchronisieren'}
          </button>

          <div className="border-surface-200 border-t dark:border-surface-700" />
        </>
      )}

      <button
        type="button"
        onClick={() => {
          if (accountId) {
            onEditCalendar(calendarId, accountId);
          }
          onClose();
        }}
        className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-surface-700 outline-hidden hover:bg-surface-100 focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset dark:text-surface-300 dark:hover:bg-surface-700 ${isLocal ? 'rounded-t-md' : ''}`}
      >
        <Edit2 className="h-4 w-4" />
        Kalender bearbeiten
      </button>

      <div className="border-surface-200 border-t dark:border-surface-700" />

      <button
        type="button"
        onClick={() => {
          onExportCalendar(calendarId);
          onClose();
        }}
        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-surface-700 outline-hidden hover:bg-surface-100 focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset dark:text-surface-300 dark:hover:bg-surface-700"
      >
        <Share2 className="h-4 w-4" />
        Aufgaben exportieren
      </button>

      <div className="border-surface-200 border-t dark:border-surface-700" />

      <button
        type="button"
        onClick={async () => {
          onClose();
          if (accountId) {
            await onLöschenCalendar(calendarId, accountId);
          }
        }}
        className="flex w-full items-center gap-2 rounded-b-md px-3 py-2 text-semantic-error text-sm outline-hidden hover:bg-semantic-error/15 focus-visible:ring-2 focus-visible:ring-semantic-error focus-visible:ring-inset"
      >
        <Trash2 className="h-4 w-4" />
        Löschen
      </button>
    </>
  );
};
