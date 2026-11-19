import { invoke } from '@tauri-apps/api/core';
import { openUrl } from '@tauri-apps/plugin-opener';
import { relaunch } from '@tauri-apps/plugin-process';
import AlertTriangle from 'lucide-react/icons/alert-triangle';
import { useEffect, useState } from 'react';
import { TrayHostWarningBanner } from '$components/banners/TrayHostWarningBanner';
import { LoadingSpinner } from '$components/LoadingSpinner';
import { Select } from '$components/Select';
import { useSettingsStore } from '$context/settingsContext';
import { useAutostart } from '$hooks/system/useAutostart';
import { useTrayHostAvailability } from '$hooks/system/useTrayHostAvailability';
import { flushLocalState } from '$lib/shutdown';
import {
  installAppImageDesktopIntegration,
  isAppImageDesktopFileInstalled,
  isAppImageInstall,
  isLinuxPlatform,
  isMacPlatform,
  removeAppImageDesktopIntegration,
} from '$utils/platform';

const formatRestartReasons = (reasons: string[]) => {
  if (reasons.length <= 1) return reasons[0] ?? 'Änderungen';
  if (reasons.length === 2) return `${reasons[0]} und ${reasons[1]}`;

  return `${reasons.slice(0, -1).join(', ')} und ${reasons[reasons.length - 1]}`;
};

export const SystemSettings = () => {
  const autostart = useAutostart();
  const isLinux = isLinuxPlatform();
  const isMac = isMacPlatform();
  const [isAppImage, setIsAppImage] = useState<boolean | null>(null);
  const [isDesktopFileInstalled, setIsDesktopFileInstalled] = useState<boolean | null>(null);
  const [isTogglingIntegration, setIsTogglingIntegration] = useState(false);
  const {
    enableSystemTray,
    setEnableSystemTray,
    enableSystemTrayExplicitlySet,
    setEnableSystemTrayExplicitlySet,
    showWindowOnLoginLaunch,
    setShowWindowOnLoginLaunch,
    hideDockIconWhenWindowClosed,
    setHideDockIconWhenWindowClosed,
    confirmBeforeQuit,
    setConfirmBeforeQuit,
    windowDecorationStyle,
    setWindowDecorationStyle,
    confirmBeforeQuitAppliedValue,
    setConfirmBeforeQuitAppliedValue,
  } = useSettingsStore();

  const confirmBeforeQuitChanged = isMac && confirmBeforeQuit !== confirmBeforeQuitAppliedValue;
  const restartReasons = [...(confirmBeforeQuitChanged ? ['Warnung beim Beenden'] : [])];
  const restartRequired = restartReasons.length > 0;
  const restartRequiredMessage = `Starte die App neu, um folgende Änderung(en) anzuwenden: ${formatRestartReasons(restartReasons)}`;
  const launchAtLoginLoading = autostart.enabled === null;
  const launchAtLoginBusy = launchAtLoginLoading || autostart.pending;
  const launchAtLoginDescription = launchAtLoginLoading
    ? 'Autostart-Status wird geprüft …'
    : autostart.pending
      ? 'Autostart wird aktualisiert …'
      : 'Chiri beim Anmelden automatisch starten';
  const launchAtLoginSpinnerClass =
    autostart.pending && autostart.enabled === true
      ? 'text-primary-ink dark:text-primary-400'
      : 'text-surface-500 dark:text-surface-400';
  const { isAvailable: isTrayHostAvailable } = useTrayHostAvailability();
  const startHiddenOptionsDisabled = !enableSystemTray || isTrayHostAvailable === false;
  const startQuietlyAtLoginDisabled = autostart.enabled !== true || startHiddenOptionsDisabled;

  useEffect(() => {
    if (!isLinux) {
      setIsAppImage(false);
      return;
    }
    isAppImageInstall().then(setIsAppImage);
  }, [isLinux]);

  useEffect(() => {
    if (isAppImage !== true) {
      setIsDesktopFileInstalled(null);
      return;
    }
    isAppImageDesktopFileInstalled().then(setIsDesktopFileInstalled);
  }, [isAppImage]);

  const handleToggleDesktopIntegration = async () => {
    setIsTogglingIntegration(true);
    try {
      if (isDesktopFileInstalled) {
        const success = await removeAppImageDesktopIntegration();
        if (success) setIsDesktopFileInstalled(false);
      } else {
        const success = await installAppImageDesktopIntegration();
        if (success) setIsDesktopFileInstalled(true);
      }
    } finally {
      setIsTogglingIntegration(false);
    }
  };

  const handleSystemTrayChange = (checked: boolean) => {
    setEnableSystemTray(checked);
    if (!enableSystemTrayExplicitlySet) {
      setEnableSystemTrayExplicitlySet(true);
    }
  };

  const handleHideDockIconWhenWindowClosedChange = async (checked: boolean) => {
    setHideDockIconWhenWindowClosed(checked);
    try {
      await invoke('set_hide_dock_icon_when_window_closed', { enabled: checked });
    } catch (error) {
      console.error('Failed to apply Dock icon preference:', error);
    }
  };

  const handleRestart = async () => {
    try {
      setConfirmBeforeQuitAppliedValue(confirmBeforeQuit);
      await flushLocalState();
      await relaunch();
    } catch (error) {
      console.error('Failed to relaunch app:', error);
    }
  };

  const handleOpenLoginItemsSettings = async () => {
    try {
      await openUrl('x-apple.systempreferences:com.apple.LoginItems-Settings.extension');
    } catch (error) {
      console.error('Failed to open Login Items & Extensions settings:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-base text-surface-800 dark:text-surface-200">
        Start und Fenster
      </h3>
      <div className="overflow-hidden rounded-lg border border-surface-300 bg-white dark:border-surface-700 dark:bg-surface-800">
        <label
          className={`flex items-center justify-between p-4 ${launchAtLoginBusy ? 'cursor-wait' : ''}`}
        >
          <div>
            <p className="text-sm text-surface-700 dark:text-surface-300">Beim Anmelden starten</p>
            <p className="flex items-center gap-1.5 text-surface-500 text-xs dark:text-surface-400">
              {launchAtLoginBusy && (
                <LoadingSpinner className={`size-3 ${launchAtLoginSpinnerClass}`} />
              )}
              {launchAtLoginDescription}
            </p>
          </div>
          <input
            type="checkbox"
            checked={autostart.enabled ?? false}
            disabled={launchAtLoginBusy}
            onChange={(e) => autostart.setEnabled(e.target.checked)}
            className={`shrink-0 rounded-sm border-surface-300 outline-hidden focus:ring-2 focus:ring-primary-ink focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${launchAtLoginBusy ? 'checkbox-busy' : ''}`}
          />
        </label>

        <div className="px-4 pb-4">
          <div className="space-y-3 border-surface-300 border-l-2 pl-4 dark:border-surface-600">
            <label
              className={`flex items-center justify-between ${startQuietlyAtLoginDisabled ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              <div>
                <p className="text-sm text-surface-700 dark:text-surface-300">
                  Beim Anmelden minimiert im Infobereich starten
                </p>
                <p className="text-surface-500 text-xs dark:text-surface-400">
                  Das Hauptfenster beim automatischen Start ausblenden. Erfordert den Infobereich.
                </p>
              </div>
              <input
                type="checkbox"
                checked={!showWindowOnLoginLaunch}
                disabled={startQuietlyAtLoginDisabled}
                onChange={(e) => setShowWindowOnLoginLaunch(!e.target.checked)}
                className="shrink-0 rounded-sm border-surface-300 outline-hidden focus:ring-2 focus:ring-primary-ink focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              />
            </label>
          </div>
        </div>

        {isMac && (
          <>
            <div className="border-surface-300 border-t dark:border-surface-700" />

            <div className="px-4 py-3">
              <button
                type="button"
                onClick={handleOpenLoginItemsSettings}
                className="inline-flex items-center gap-2 rounded-lg border border-surface-300 bg-surface-100 px-3 py-1.5 text-sm text-surface-800 outline-hidden transition-colors hover:border-surface-400 hover:bg-surface-200 focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset dark:border-surface-600 dark:bg-surface-700 dark:text-surface-200 dark:hover:border-surface-500 dark:hover:bg-surface-600"
              >
                macOS-Einstellungen öffnen
              </button>
            </div>
          </>
        )}

        {autostart.error && (
          <div className="px-4 pb-4">
            <div className="flex gap-2 rounded-lg border border-semantic-error/30 bg-semantic-error/10 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-semantic-error" />
              <p className="text-semantic-error text-xs">{autostart.error}</p>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-surface-300 bg-white dark:border-surface-700 dark:bg-surface-800">
        <label className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm text-surface-700 dark:text-surface-300">Infobereich aktivieren</p>
            <p className="text-surface-500 text-xs dark:text-surface-400">
              Ermöglicht Chiri, mit einem Symbol im Infobereich im Hintergrund weiterzulaufen
            </p>
          </div>
          <input
            type="checkbox"
            checked={enableSystemTray}
            onChange={(e) => handleSystemTrayChange(e.target.checked)}
            className="shrink-0 rounded-sm border-surface-300 outline-hidden focus:ring-2 focus:ring-primary-ink focus:ring-offset-2"
          />
        </label>

        {isMac && (
          <div className="px-4 pb-4">
            <div className="space-y-3 border-surface-300 border-l-2 pl-4 dark:border-surface-600">
              <label
                className={`flex items-center justify-between ${!enableSystemTray ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <div>
                  <p className="text-sm text-surface-700 dark:text-surface-300">Dock-Symbol ausblenden</p>
                  <p className="text-surface-500 text-xs dark:text-surface-400">
                    Das Dock-Symbol ausblenden, wenn alle Fenster geschlossen sind
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={hideDockIconWhenWindowClosed}
                  disabled={!enableSystemTray}
                  onChange={(e) => handleHideDockIconWhenWindowClosedChange(e.target.checked)}
                  className="shrink-0 rounded-sm border-surface-300 outline-hidden focus:ring-2 focus:ring-primary-ink focus:ring-offset-2 disabled:opacity-50"
                />
              </label>
            </div>
          </div>
        )}

        {isLinux && enableSystemTray && isTrayHostAvailable === false && (
          <div className="px-4 pb-4">
            <TrayHostWarningBanner />
          </div>
        )}
      </div>

      {isMac && (
        <div className="overflow-hidden rounded-lg border border-surface-300 bg-white dark:border-surface-700 dark:bg-surface-800">
          <label
            htmlFor="window-decoration-style"
            className="flex items-center justify-between gap-4 p-4"
          >
            <div>
              <p className="text-sm text-surface-700 dark:text-surface-300">Fensterrahmen</p>
              <p className="text-surface-500 text-xs dark:text-surface-400">
                Zwischen integrierten und standardmäßigen Fensterrahmen wählen
              </p>
            </div>
            <Select
              id="window-decoration-style"
              value={windowDecorationStyle}
              onChange={(event) =>
                setWindowDecorationStyle(event.target.value as 'integrated' | 'native')
              }
              className="shrink-0 rounded-lg border border-transparent bg-surface-100 text-sm text-surface-800 outline-hidden transition-colors focus:border-primary-ink focus:bg-white dark:bg-surface-700 dark:text-surface-200 dark:focus:bg-surface-800"
            >
              <option value="integrated">Integriert</option>
              <option value="native">Standard</option>
            </Select>
          </label>
        </div>
      )}

      {isMac && (
        <div className="overflow-hidden rounded-lg border border-surface-300 bg-white dark:border-surface-700 dark:bg-surface-800">
          <label className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-surface-700 dark:text-surface-300">
                Vor dem Beenden mit ⌘Q warnen
              </p>
              <p className="text-surface-500 text-xs dark:text-surface-400">
                Zum Beenden ⌘Q gedrückt halten oder zweimal drücken. Erfordert einen Neustart.
              </p>
            </div>
            <input
              type="checkbox"
              checked={confirmBeforeQuit}
              onChange={(e) => setConfirmBeforeQuit(e.target.checked)}
              className="shrink-0 rounded-sm border-surface-300 outline-hidden focus:ring-2 focus:ring-primary-ink focus:ring-offset-2"
            />
          </label>
        </div>
      )}

      {restartRequired && (
        <div className="overflow-hidden rounded-lg border border-surface-300 dark:border-surface-700">
          <div className="flex items-center justify-between gap-4 bg-surface-100 px-4 py-3 dark:bg-surface-700/50">
            <p className="text-sm text-surface-700 dark:text-surface-300">
              {restartRequiredMessage}
            </p>
            <button
              type="button"
              onClick={handleRestart}
              className="shrink-0 rounded-lg bg-primary-500 px-3 py-1.5 font-medium text-primary-contrast text-sm outline-hidden transition-colors hover:bg-primary-600 focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset"
            >
              Jetzt neu starten
            </button>
          </div>
        </div>
      )}
      {isAppImage === true && (
        <div className="overflow-hidden rounded-lg border border-surface-300 bg-white dark:border-surface-700 dark:bg-surface-800">
          <label
            className={`flex items-center justify-between gap-4 p-4 ${isDesktopFileInstalled === null || isTogglingIntegration ? 'cursor-wait' : ''}`}
          >
            <div className="min-w-0">
              <p className="text-sm text-surface-700 dark:text-surface-300">Desktop-Integration</p>
              <p className="text-surface-500 text-xs dark:text-surface-400">
                Chiri im Anwendungsmenü anzeigen
              </p>
            </div>
            <input
              type="checkbox"
              checked={isDesktopFileInstalled === true}
              disabled={isDesktopFileInstalled === null || isTogglingIntegration}
              onChange={() => void handleToggleDesktopIntegration()}
              className="shrink-0 rounded-sm border-surface-300 outline-hidden focus:ring-2 focus:ring-primary-ink focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </label>
        </div>
      )}
    </div>
  );
};
