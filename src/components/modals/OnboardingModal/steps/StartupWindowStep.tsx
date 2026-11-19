import AlertTriangle from 'lucide-react/icons/alert-triangle';
import LogIn from 'lucide-react/icons/log-in';
import PanelTop from 'lucide-react/icons/panel-top';
import Rocket from 'lucide-react/icons/rocket';
import { TrayHostWarningBanner } from '$components/banners/TrayHostWarningBanner';
import { LoadingSpinner } from '$components/LoadingSpinner';
import { ToggleRow } from '$components/modals/OnboardingModal/ToggleRow';

interface StartupWindowStepProps {
  autostartEnabled: boolean | null;
  autostartPending: boolean;
  autostartError: string | null;
  onAutostartChange: (enabled: boolean) => void;
  startHiddenOptionsDisabled: boolean;
  showWindowOnLoginLaunch: boolean;
  onShowWindowOnLoginLaunchChange: (enabled: boolean) => void;
  enableSystemTray: boolean;
  onEnableSystemTrayChange: (enabled: boolean) => void;
}

export const StartupWindowStep = ({
  autostartEnabled,
  autostartPending,
  autostartError,
  onAutostartChange,
  startHiddenOptionsDisabled,
  showWindowOnLoginLaunch,
  onShowWindowOnLoginLaunchChange,
  enableSystemTray,
  onEnableSystemTrayChange,
}: StartupWindowStepProps) => (
  <div className="flex flex-col gap-5">
    <section className="space-y-2 rounded-lg border border-surface-200 p-3 dark:border-surface-700">
      <ToggleRow
        icon={
          autostartEnabled === null || autostartPending ? (
            <LoadingSpinner className="h-4 w-4" />
          ) : (
            <Rocket className="h-4 w-4" />
          )
        }
        label="Beim Anmelden starten"
        description="Chiri automatisch starten, wenn du dich anmeldest."
        checked={autostartEnabled ?? false}
        disabled={autostartEnabled === null || autostartPending}
        onChange={onAutostartChange}
      />
      {autostartEnabled === true && (
        <div className="border-surface-200 border-l-2 pl-4 dark:border-surface-600">
          <ToggleRow
            icon={<LogIn className="h-4 w-4" />}
            label="Beim Anmelden minimiert im Infobereich starten"
            description="Das Hauptfenster beim automatischen Start von Chiri ausblenden. Erfordert den Infobereich."
            checked={!showWindowOnLoginLaunch}
            disabled={startHiddenOptionsDisabled}
            onChange={onShowWindowOnLoginLaunchChange}
          />
        </div>
      )}
      <ToggleRow
        icon={<PanelTop className="h-4 w-4" />}
        label="Infobereich aktivieren"
        description="Chiri beim Schließen des Fensters im Hintergrund geöffnet lassen."
        checked={enableSystemTray}
        onChange={onEnableSystemTrayChange}
      />
    </section>

    {autostartError && (
      <div className="flex gap-2 rounded-lg border border-semantic-error/30 bg-semantic-error/10 p-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-semantic-error" />
        <p className="text-semantic-error text-xs">{autostartError}</p>
      </div>
    )}

    <TrayHostWarningBanner />
  </div>
);
