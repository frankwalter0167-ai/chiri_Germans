import AlertTriangle from 'lucide-react/icons/alert-triangle';
import { useSettingsStore } from '$context/settingsContext';
import { usePlatform } from '$hooks/system/usePlatform';
import { useTrayHostAvailability } from '$hooks/system/useTrayHostAvailability';
import { isLinuxPlatform } from '$utils/platform';

export const TrayHostWarningBanner = () => {
  const { enableSystemTray } = useSettingsStore();
  const { isGNOME } = usePlatform();
  const { isAvailable } = useTrayHostAvailability();

  if (!isLinuxPlatform() || !enableSystemTray || isAvailable === null || isAvailable) {
    return null;
  }

  return (
    <div className="flex gap-2 rounded-lg border border-semantic-warning/30 bg-semantic-warning/10 p-3">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-semantic-warning" />
      <p className="text-semantic-warning text-xs">
        <span className="font-semibold">Kein Host für die Taskleiste erkannt.</span> Wenn du das Fenster schließt, wird Chiri beendet, statt im Hintergrund ausgeblendet zu werden.
        {isGNOME && (
          <>
            {' '}
            Für GNOME ist die Erweiterung{' '}
            <a
              href="https://extensions.gnome.org/extension/615/appindicator-support/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-80"
            >
              AppIndicator and KStatusNotifierItem Support
            </a>{' '}
            erforderlich, um Symbole im Infobereich anzuzeigen.
          </>
        )}
      </p>
    </div>
  );
};
