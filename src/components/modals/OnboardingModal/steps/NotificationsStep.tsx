import Bell from 'lucide-react/icons/bell';
import BellOff from 'lucide-react/icons/bell-off';
import Clock from 'lucide-react/icons/clock';
import Hash from 'lucide-react/icons/hash';
import { MacNotificationCard } from '$components/MacNotificationCard';
import { ToggleRow } from '$components/modals/OnboardingModal/ToggleRow';

import type {
  NotificationPermissionResult,
  NotificationPermissionStatus,
} from '$types/notifications/permission';

interface NotificationsStepProps {
  isMac: boolean;
  permissionStatus: NotificationPermissionStatus | null;
  isCheckingPermission: boolean;
  requestPermission: () => Promise<NotificationPermissionResult>;
  macPermissionPending: boolean;
  notifications: boolean;
  onNotificationsChange: (enabled: boolean) => void;
  notifyReminders: boolean;
  onNotifyRemindersChange: (enabled: boolean) => void;
  notifyOverdue: boolean;
  onNotifyOverdueChange: (enabled: boolean) => void;
  showAppIconBadge: boolean;
  onShowAppIconBadgeChange: (enabled: boolean) => void;
}

export const NotificationsStep = ({
  isMac,
  permissionStatus,
  isCheckingPermission,
  requestPermission,
  macPermissionPending,
  notifications,
  onNotificationsChange,
  notifyReminders,
  onNotifyRemindersChange,
  notifyOverdue,
  onNotifyOverdueChange,
  showAppIconBadge,
  onShowAppIconBadgeChange,
}: NotificationsStepProps) => (
  <div className="flex flex-1 flex-col justify-between gap-5">
    {isMac && permissionStatus !== null && (
      <MacNotificationCard
        permissionStatus={permissionStatus}
        isCheckingPermission={isCheckingPermission}
        requestPermission={requestPermission}
        density="compact"
      />
    )}

    <section className="space-y-2 rounded-lg border border-surface-200 p-3 dark:border-surface-700">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-primary-ink" />
        <h3 className="font-semibold text-sm text-surface-900 dark:text-surface-100">Benachrichtigungen</h3>
      </div>
      <ToggleRow
        icon={<Bell className="h-4 w-4" />}
        label="Desktop-Benachrichtigungen"
        description="Chiri darf Systembenachrichtigungen senden."
        checked={notifications}
        disabled={macPermissionPending}
        onChange={onNotificationsChange}
      />
      {notifications && (
        <div className="space-y-2 border-surface-200 border-l-2 pl-4 dark:border-surface-600">
          <ToggleRow
            icon={<BellOff className="h-4 w-4" />}
            label="Erinnerungsbenachrichtigungen"
            description="Die in Aufgaben gespeicherten Erinnerungszeiten verwenden."
            checked={notifyReminders}
            disabled={macPermissionPending}
            onChange={onNotifyRemindersChange}
          />
          <ToggleRow
            icon={<Clock className="h-4 w-4" />}
            label="Überfällige Aufgaben"
            description="Benachrichtigen, wenn das Fälligkeitsdatum einer Aufgabe überschritten ist."
            checked={notifyOverdue}
            disabled={macPermissionPending}
            onChange={onNotifyOverdueChange}
          />
        </div>
      )}
    </section>

    <section className="space-y-2 rounded-lg border border-surface-200 p-3 dark:border-surface-700">
      <div className="flex items-center gap-2">
        <Hash className="h-4 w-4 text-primary-ink" />
        <h3 className="font-semibold text-sm text-surface-900 dark:text-surface-100">App-Symbol</h3>
      </div>
      <ToggleRow
        icon={<Hash className="h-4 w-4" />}
        label="Anzahl am App-Symbol anzeigen"
        description="Die Anzahl überfälliger Aufgaben am App-Symbol anzeigen."
        checked={showAppIconBadge}
        onChange={onShowAppIconBadgeChange}
      />
    </section>
  </div>
);
