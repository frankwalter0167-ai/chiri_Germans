import CheckCircle2 from 'lucide-react/icons/check-circle-2';
import Info from 'lucide-react/icons/info';
import Play from 'lucide-react/icons/play';
import TriangleAlert from 'lucide-react/icons/triangle-alert';
import XCircle from 'lucide-react/icons/x-circle';
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { LoadingSpinner } from '$components/LoadingSpinner';
import { Select } from '$components/Select';
import {
  CONNECTIVITY_CHECK_INTERVAL_OPTIONS,
  DEFAULT_HTTP_PROXY_PORT,
  DEFAULT_PROXY_HOST,
  DEFAULT_SOCKS_PROXY_PORT,
} from '$constants/settings';
import { useSettingsStore } from '$context/settingsContext';
import {
  DEFAULT_CONNECTIVITY_CHECK_URL,
  getIsConnectivityCheckRunning,
  getLastConnectivityCheckResult,
  runConnectivityCheck,
  subscribeConnectivityCheckResult,
  subscribeConnectivityCheckStatus,
} from '$lib/network/connectivity';
import type { NetworkProxyMode } from '$types/settings/categories/network';
import type { DateFormat, TimeFormat } from '$types/settings/categories/region';
import { formatDate, formatTime } from '$utils/date';

const formatCheckedAt = (checkedAt: string, dateFormat: DateFormat, timeFormat: TimeFormat) => {
  const date = new Date(checkedAt);
  return `${formatDate(date, true, dateFormat)} ${formatTime(date, timeFormat)}`;
};

const getExternalFallbackLabel = (fallbackType: 'default' | 'custom' | null) => {
  if (fallbackType === 'default') return 'Standardmäßige externe Ausweichprüfung verwendet';
  if (fallbackType === 'custom') return 'Benutzerdefinierte externe Ausweichprüfung verwendet';
  return 'Externe Ausweichprüfung verwendet';
};

const getDefaultProxyPort = (mode: NetworkProxyMode) =>
  mode === 'socks' ? DEFAULT_SOCKS_PROXY_PORT : DEFAULT_HTTP_PROXY_PORT;

const isDefaultProxyPort = (port: string) =>
  port === '' ||
  port === String(DEFAULT_HTTP_PROXY_PORT) ||
  port === String(DEFAULT_SOCKS_PROXY_PORT);

export const NetworkSettings = () => {
  const {
    connectivityCheckEnabled,
    setConnectivityCheckEnabled,
    connectivityCheckUrl,
    setConnectivityCheckUrl,
    connectivityCheckInterval,
    setConnectivityCheckInterval,
    connectivityRequestTimeout,
    setConnectivityRequestTimeout,
    networkProxyMode,
    setNetworkProxyMode,
    networkProxyHost,
    setNetworkProxyHost,
    networkProxyPort,
    setNetworkProxyPort,
    dateFormat,
    timeFormat,
  } = useSettingsStore();
  const lastResult = useSyncExternalStore(
    subscribeConnectivityCheckResult,
    getLastConnectivityCheckResult,
    getLastConnectivityCheckResult,
  );
  const isConnectivityCheckRunning = useSyncExternalStore(
    subscribeConnectivityCheckStatus,
    getIsConnectivityCheckRunning,
    getIsConnectivityCheckRunning,
  );
  const [isTesting, setIsTesting] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const defaultProxyPort = getDefaultProxyPort(networkProxyMode);
  const isCheckingConnectivity = isTesting || isConnectivityCheckRunning;

  const handleProxyModeChange = (mode: NetworkProxyMode) => {
    setNetworkProxyMode(mode);
    if (isDefaultProxyPort(String(networkProxyPort))) {
      setNetworkProxyPort('');
    }
  };

  const handleProxyPortChange = (value: string) => {
    if (value === '') {
      setNetworkProxyPort('');
      return;
    }

    const port = Number(value);
    if (!Number.isInteger(port)) return;
    setNetworkProxyPort(String(Math.min(65_535, Math.max(1, port))));
  };

  const handleTestConnectivity = useCallback(async () => {
    setIsTesting(true);
    setTestError(null);

    try {
      await runConnectivityCheck({
        externalCheckEnabled: connectivityCheckEnabled,
        requestTimeoutMs: connectivityRequestTimeout * 1000,
      });
    } catch (error) {
      setTestError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsTesting(false);
    }
  }, [connectivityCheckEnabled, connectivityRequestTimeout]);

  useEffect(() => {
    if (lastResult || isConnectivityCheckRunning || isTesting) return;
    void handleTestConnectivity();
  }, [handleTestConnectivity, isConnectivityCheckRunning, isTesting, lastResult]);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-base text-surface-800 dark:text-surface-200">Netzwerk</h3>

      <div className="flex gap-2 rounded-lg border border-semantic-info/30 bg-semantic-info/10 px-3 py-2 text-surface-700 text-xs dark:text-surface-300">
        <Info className="mt-px size-3.5 shrink-0 text-semantic-info" />
        <p>
          Chiri prüft deine CalDAV-Konten, um festzustellen, ob eine Internetverbindung besteht. Sind alle Konten nicht erreichbar, hilft die externe Ausweichprüfung dabei, einen Serverausfall von einer unterbrochenen Internetverbindung zu unterscheiden.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-surface-300 bg-white dark:border-surface-700 dark:bg-surface-800">
        <label className="flex items-center justify-between gap-4 p-4">
          <div className="min-w-0">
            <p className="text-sm text-surface-700 dark:text-surface-300">
              Externe Ausweichprüfung
            </p>
            <p className="text-surface-500 text-xs dark:text-surface-400">
              Eine Ausweich-URL prüfen, wenn die CalDAV-Konten nicht erreichbar sind
            </p>
          </div>
          <input
            type="checkbox"
            checked={connectivityCheckEnabled}
            onChange={(e) => setConnectivityCheckEnabled(e.target.checked)}
            className="shrink-0 rounded border-surface-300 outline-none focus:ring-2 focus:ring-primary-ink focus:ring-offset-2 dark:border-surface-600"
          />
        </label>

        {!connectivityCheckEnabled && (
          <div className="mx-4 mb-4 flex gap-2 rounded-lg border border-semantic-warning/30 bg-semantic-warning/10 px-3 py-2 text-surface-700 text-xs dark:text-surface-300">
            <TriangleAlert className="mt-px size-3.5 shrink-0 text-semantic-warning" />
            <span>
              Es werden nur die CalDAV-Server geprüft. Ist keiner der eingerichteten Server erreichbar, meldet Chiri „Offline“.
            </span>
          </div>
        )}

        {connectivityCheckEnabled && (
          <>
            <div className="border-surface-300 border-t dark:border-surface-700" />

            <div className="space-y-2 p-4">
              <div>
                <p className="text-sm text-surface-700 dark:text-surface-300">
                  Eigene Ausweich-URL
                </p>
                <p className="text-surface-500 text-xs dark:text-surface-400">
                  Leer lassen, um den standardmäßigen Firefox-Endpunkt zu verwenden
                </p>
              </div>
              <input
                type="url"
                value={connectivityCheckUrl}
                onChange={(e) => setConnectivityCheckUrl(e.target.value)}
                placeholder={DEFAULT_CONNECTIVITY_CHECK_URL}
                className="w-full rounded-lg border border-surface-300 bg-surface-50 px-3 py-1.5 text-sm text-surface-800 outline-none transition-colors focus:border-primary-ink focus:bg-white dark:border-surface-600 dark:bg-surface-700 dark:text-surface-200 dark:focus:bg-surface-800"
              />
            </div>
          </>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-surface-300 bg-white dark:border-surface-700 dark:bg-surface-800">
        <div className="flex items-center justify-between gap-4 p-4">
          <div className="min-w-0">
            <p className="text-sm text-surface-700 dark:text-surface-300">Verbindungstest</p>
            <p className="text-surface-500 text-xs dark:text-surface-400">
              CalDAV-Konten prüfen und bei Bedarf anschließend die externe Ausweichadresse
            </p>
          </div>
          <button
            type="button"
            onClick={handleTestConnectivity}
            disabled={isCheckingConnectivity}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-surface-100 px-3 py-1.5 text-sm text-surface-700 outline-hidden transition-colors hover:bg-surface-200 focus-visible:ring-2 focus-visible:ring-primary-ink disabled:cursor-not-allowed disabled:opacity-60 dark:bg-surface-700 dark:text-surface-200 dark:hover:bg-surface-600"
          >
            {isCheckingConnectivity ? (
              <LoadingSpinner className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Jetzt testen
          </button>
        </div>

        {(isCheckingConnectivity || lastResult || testError) && (
          <div className="mx-4 mb-4 rounded-lg border border-surface-300 bg-surface-50 px-3 py-2 text-xs dark:border-surface-700 dark:bg-surface-900/60">
            {isCheckingConnectivity && !lastResult && (
              <div className="flex gap-2">
                <LoadingSpinner className="mt-px h-4 w-4 text-semantic-info" />
                <div className="min-w-0 space-y-1">
                  <p className="font-medium text-surface-700 dark:text-surface-200">
                    Verbindung wird geprüft
                  </p>
                  <p className="text-surface-500 dark:text-surface-400">
                    CalDAV-Konten werden geprüft und bei Bedarf anschließend die externe Ausweichadresse.
                  </p>
                </div>
              </div>
            )}
            {lastResult && (
              <div className="flex gap-2">
                {lastResult.online ? (
                  <CheckCircle2 className="mt-px h-4 w-4 shrink-0 text-semantic-success" />
                ) : (
                  <XCircle className="mt-px h-4 w-4 shrink-0 text-semantic-error" />
                )}
                <div className="min-w-0 space-y-1">
                  <p className="font-medium text-surface-700 dark:text-surface-200">
                    {lastResult.online ? 'Online' : 'Offline'} · {lastResult.message}
                  </p>
                  <p className="text-surface-500 dark:text-surface-400">
                    {formatCheckedAt(lastResult.checkedAt, dateFormat, timeFormat)} ·{' '}
                    {lastResult.durationMs}ms
                    {lastResult.accountsChecked > 0
                      ? ` · ${lastResult.accountsChecked} CalDAV probe${lastResult.accountsChecked === 1 ? '' : 's'}`
                      : ''}
                    {lastResult.externalCheckUsed
                      ? ` · ${getExternalFallbackLabel(lastResult.externalFallbackType)}`
                      : ''}
                  </p>
                </div>
              </div>
            )}
            {testError && (
              <p className="mt-2 text-semantic-error dark:text-semantic-error">{testError}</p>
            )}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-surface-300 bg-white dark:border-surface-700 dark:bg-surface-800">
        <div className="flex items-center justify-between gap-4 p-4">
          <div className="min-w-0">
            <p className="text-sm text-surface-700 dark:text-surface-300">Prüfintervall</p>
            <p className="text-surface-500 text-xs dark:text-surface-400">
              Wie oft Chiri den Verbindungsstatus aktualisiert
            </p>
          </div>
          <Select
            id="connectivity-check-interval"
            value={connectivityCheckInterval.toString()}
            onChange={(e) => setConnectivityCheckInterval(Number(e.target.value))}
            className="shrink-0 rounded-lg border border-transparent bg-surface-100 text-sm text-surface-800 outline-none transition-colors focus:border-primary-ink focus:bg-white dark:bg-surface-700 dark:text-surface-200 dark:focus:bg-surface-800"
          >
            {CONNECTIVITY_CHECK_INTERVAL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="border-surface-300 border-t dark:border-surface-700" />

        <label className="flex items-center justify-between gap-4 p-4">
          <div className="min-w-0">
            <p className="text-sm text-surface-700 dark:text-surface-300">Zeitüberschreitung der Anfrage</p>
            <p className="text-surface-500 text-xs dark:text-surface-400">
              Nach dieser Anzahl von Sekunden wird die jeweilige Prüfung abgebrochen
            </p>
          </div>
          <input
            type="number"
            min={1}
            max={60}
            step={1}
            value={connectivityRequestTimeout}
            onChange={(e) =>
              setConnectivityRequestTimeout(Math.min(60, Math.max(1, Number(e.target.value) || 1)))
            }
            className="w-20 shrink-0 rounded-lg border border-surface-300 bg-surface-50 px-3 py-1.5 text-sm text-surface-800 outline-none transition-colors focus:border-primary-ink focus:bg-white dark:border-surface-600 dark:bg-surface-700 dark:text-surface-200 dark:focus:bg-surface-800"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-lg border border-surface-300 bg-white dark:border-surface-700 dark:bg-surface-800">
        <div className="flex items-center justify-between gap-4 p-4">
          <div className="min-w-0">
            <p className="text-sm text-surface-700 dark:text-surface-300">Proxy</p>
            <p className="text-surface-500 text-xs dark:text-surface-400">
              CalDAV-Anfragen und Verbindungsprüfungen über einen Proxy leiten
            </p>
          </div>
          <Select
            value={networkProxyMode}
            onChange={(event) => handleProxyModeChange(event.target.value as NetworkProxyMode)}
            className="shrink-0 rounded-lg border border-transparent bg-surface-100 text-sm text-surface-800 outline-none transition-colors focus:border-primary-ink focus:bg-white dark:bg-surface-700 dark:text-surface-200 dark:focus:bg-surface-800"
          >
            <option value="system">System</option>
            <option value="none">Keiner</option>
            <option value="http">HTTP</option>
            <option value="socks">SOCKS5</option>
          </Select>
        </div>

        {(networkProxyMode === 'http' || networkProxyMode === 'socks') && (
          <>
            <div className="border-surface-300 border-t dark:border-surface-700" />

            <div className="grid gap-3 p-4 sm:grid-cols-[1fr_auto]">
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-surface-700 dark:text-surface-300">Proxy-Adresse</p>
                  <p className="text-surface-500 text-xs dark:text-surface-400">
                    Bei einem lokalen Proxy normalerweise 127.0.0.1.
                  </p>
                </div>
                <input
                  type="text"
                  value={networkProxyHost}
                  onChange={(event) => setNetworkProxyHost(event.target.value)}
                  placeholder={DEFAULT_PROXY_HOST}
                  className="w-full rounded-lg border border-surface-300 bg-surface-50 px-3 py-1.5 text-sm text-surface-800 outline-none transition-colors focus:border-primary-ink focus:bg-white dark:border-surface-600 dark:bg-surface-700 dark:text-surface-200 dark:focus:bg-surface-800"
                />
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-sm text-surface-700 dark:text-surface-300">Port</p>
                  <p className="text-surface-500 text-xs dark:text-surface-400">
                    Üblicherweise {defaultProxyPort}.
                  </p>
                </div>
                <input
                  type="number"
                  min={1}
                  max={65_535}
                  step={1}
                  value={networkProxyPort}
                  onChange={(event) => handleProxyPortChange(event.target.value)}
                  placeholder={String(defaultProxyPort)}
                  className="w-28 shrink-0 rounded-lg border border-surface-300 bg-surface-50 px-3 py-1.5 text-sm text-surface-800 outline-none transition-colors focus:border-primary-ink focus:bg-white dark:border-surface-600 dark:bg-surface-700 dark:text-surface-200 dark:focus:bg-surface-800"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
