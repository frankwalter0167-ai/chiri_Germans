import { openUrl } from '@tauri-apps/plugin-opener';
import { arch, exeExtension, locale, platform, version } from '@tauri-apps/plugin-os';
import Bug from 'lucide-react/icons/bug';
import RotateCcw from 'lucide-react/icons/rotate-ccw';
import Trash2 from 'lucide-react/icons/trash-2';
import { type ReactNode, useState } from 'react';
import { loggers } from '$lib/logger';
import { createErrorReportIssueUrl, getAppInfo } from '$utils/meta';
import { formatPlatformName } from '$utils/platform';

const log = loggers.bootstrap;

interface BootstrapErrorScreenProps {
  error: unknown;
  onZurücksetzenDatabase: () => Promise<void>;
  onZurücksetzenPreferences: () => Promise<void>;
}

interface ActionCardProps {
  title: string;
  description?: string | string[];
  children: ReactNode;
}

const primaryButtonClasses =
  'inline-flex items-center justify-center gap-2 rounded-md border border-transparent bg-primary-500 px-4 py-2 text-sm font-medium text-primary-contrast transition-colors hover:bg-primary-600 outline-hidden focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-offset-2 dark:focus-visible:ring-offset-surface-800';

const secondaryButtonClasses =
  'inline-flex items-center justify-center gap-2 rounded-md border border-surface-200 bg-surface-50 px-4 py-2 text-sm font-medium text-surface-800 transition-colors hover:bg-surface-100 outline-hidden focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-offset-2 dark:border-surface-600 dark:bg-surface-700/60 dark:text-surface-200 dark:hover:bg-surface-700 dark:focus-visible:ring-offset-surface-800';

const warningButtonClasses =
  'inline-flex items-center justify-center gap-2 rounded-md border border-transparent bg-semantic-warning px-4 py-2 text-sm font-medium text-surface-900 transition-colors hover:opacity-90 outline-hidden focus-visible:ring-2 focus-visible:ring-semantic-warning focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-surface-800';

const destructiveButtonClasses =
  'inline-flex items-center justify-center gap-2 rounded-md border border-transparent bg-semantic-error px-4 py-2 text-sm font-medium text-primary-contrast transition-colors hover:opacity-90 outline-hidden focus-visible:ring-2 focus-visible:ring-semantic-error focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-surface-800';

const cancelButtonClasses =
  'inline-flex items-center justify-center rounded-md border border-surface-200 bg-white px-4 py-2 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-100 outline-hidden focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-offset-2 dark:border-surface-600 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700 dark:focus-visible:ring-offset-surface-800';

const cardClasses =
  'rounded-lg border border-surface-200 bg-white shadow-lg dark:border-surface-700 dark:bg-surface-800';

const errorToString = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
};

const errorStack = (error: unknown) => {
  if (error instanceof Error && error.stack) {
    return error.stack;
  }

  return 'No stack trace available';
};

const ActionCard = ({ title, description, children }: ActionCardProps) => {
  const descriptionLines =
    typeof description === 'undefined'
      ? []
      : Array.isArray(description)
        ? description
        : [description];

  return (
    <section className={`${cardClasses} space-y-3 p-5`}>
      <div className="space-y-2">
        <h2 className="font-semibold text-surface-900 text-xl dark:text-surface-50">{title}</h2>
        {descriptionLines.map((line) => (
          <p key={line} className="text-sm text-surface-600 dark:text-surface-400">
            {line}
          </p>
        ))}
      </div>
      {children}
    </section>
  );
};

export const BootstrapErrorScreen = ({
  error,
  onZurücksetzenDatabase,
  onZurücksetzenPreferences,
}: BootstrapErrorScreenProps) => {
  const [confirmZurücksetzenDatabase, setConfirmZurücksetzenDatabase] = useState(false);
  const [confirmZurücksetzenPrefs, setConfirmZurücksetzenPrefs] = useState(false);
  const [isZurücksetzentingPreferences, setIsZurücksetzentingPreferences] = useState(false);
  const [resetPreferencesError, setZurücksetzenPreferencesError] = useState<string | null>(null);
  const [isZurücksetzentingDatabase, setIsZurücksetzentingDatabase] = useState(false);
  const [resetDatabaseError, setZurücksetzenDatabaseError] = useState<string | null>(null);

  const errorMessage = errorToString(error);

  const handleReportIssue = async () => {
    try {
      const [currentPlatform, currentArch, currentVersion, currentExtension, currentLocale] =
        await Promise.all([platform(), arch(), version(), exeExtension(), locale()]);
      const displayPlatform = formatPlatformName(currentPlatform);

      const errorTitle = `Critical startup error on ${displayPlatform} ${currentVersion}`;
      const systemInformation = `- App Version: ${getAppInfo().version}
- OS: ${displayPlatform}
- Version: ${currentVersion}
- Architecture: ${currentArch}
- App Extension: ${currentExtension || 'Unknown'}
- System Locale: ${currentLocale}`;

      const issueUrl = createErrorReportIssueUrl({
        title: errorTitle,
        steps: '1. Open Chiri\n2. See startup error',
        errorMessage,
        stackTrace: errorStack(error),
        systemInformation,
      });
      await openUrl(issueUrl);
    } catch (err) {
      log.error('Failed to open issue report:', err);
    }
  };

  const handleZurücksetzenPreferences = async () => {
    setIsZurücksetzentingPreferences(true);
    setZurücksetzenPreferencesError(null);

    try {
      await onZurücksetzenPreferences();
    } catch (err) {
      log.error('Failed to reset preferences:', err);
      setZurücksetzenPreferencesError(`Failed to reset preferences: ${errorToString(err)}`);
      setIsZurücksetzentingPreferences(false);
    }
  };

  const handleZurücksetzenDatabase = async () => {
    setIsZurücksetzentingDatabase(true);
    setZurücksetzenDatabaseError(null);

    try {
      await onZurücksetzenDatabase();
    } catch (err) {
      log.error('Failed to reset database:', err);
      setZurücksetzenDatabaseError(`Failed to reset database: ${errorToString(err)}`);
      setIsZurücksetzentingDatabase(false);
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-white p-6 dark:bg-surface-900">
      <main className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-2xl flex-col justify-center gap-6 py-10">
        <section className={`${cardClasses} space-y-6 p-6`}>
          <div className="space-y-2">
            <h1 className="font-bold text-3xl text-surface-900 dark:text-surface-50">
              Ein Fehler ist aufgetreten :(
            </h1>
            <p className="text-surface-600 dark:text-surface-400">
              Beim Start der Anwendung ist ein schwerwiegender Fehler aufgetreten.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-semibold text-lg text-surface-900 dark:text-surface-50">
              Fehlerdetails:
            </h2>
            <div className="max-h-48 overflow-auto rounded-md border border-surface-200 bg-surface-100 p-4 font-mono text-sm dark:border-surface-700 dark:bg-surface-900">
              <p className="selectable whitespace-pre-line text-semantic-error">{errorMessage}</p>
            </div>
          </div>
        </section>

        <ActionCard
          title="Problem melden"
          description="Hilf uns, diesen Fehler zu beheben, indem du einen Fehlerbericht auf GitHub erstellst."
        >
          <button type="button" onClick={handleReportIssue} className={primaryButtonClasses}>
            <Bug className="h-4 w-4" aria-hidden="true" />
            Fehler auf GitHub melden
          </button>
        </ActionCard>

        <ActionCard title="Wiederherstellung">
          <div className="divide-y divide-surface-200 dark:divide-surface-700">
            <section className="space-y-3 pb-5">
              <div className="space-y-1.5">
                <h3 className="font-semibold text-base text-surface-900 dark:text-surface-50">
                  Einstellungen zurücksetzen
                </h3>
                <p
                  className={
                    confirmZurücksetzenPrefs
                      ? 'font-semibold text-semantic-warning text-sm'
                      : 'text-sm text-surface-600 dark:text-surface-400'
                  }
                >
                  {confirmZurücksetzenPrefs
                    ? 'Einstellungen auf Standardwerte zurücksetzen und neu laden?'
                    : 'Standardwerte wiederherstellen. Konten und Aufgaben bleiben erhalten.'}
                </p>
              </div>
              {!confirmZurücksetzenPrefs ? (
                <button
                  type="button"
                  onClick={() => {
                    setConfirmZurücksetzenPrefs(true);
                    setConfirmZurücksetzenDatabase(false);
                    setZurücksetzenPreferencesError(null);
                    setZurücksetzenDatabaseError(null);
                  }}
                  className={secondaryButtonClasses}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Einstellungen zurücksetzen
                </button>
              ) : (
                <div className="space-y-3">
                  {resetPreferencesError && (
                    <p className="selectable text-semantic-error text-sm">
                      {resetPreferencesError}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleZurücksetzenPreferences}
                      disabled={isZurücksetzentingPreferences}
                      className={warningButtonClasses}
                    >
                      {isZurücksetzentingPreferences ? 'Wird zurückgesetzt...' : 'Zurücksetzen'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmZurücksetzenPrefs(false);
                        setZurücksetzenPreferencesError(null);
                      }}
                      disabled={isZurücksetzentingPreferences}
                      className={cancelButtonClasses}
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}
            </section>

            <section className="space-y-3 pt-5">
              <div className="space-y-1.5">
                <h3 className="font-semibold text-base text-surface-900 dark:text-surface-50">
                  Zurücksetzen Database
                </h3>
                <p
                  className={
                    confirmZurücksetzenDatabase
                      ? 'font-semibold text-semantic-error text-sm'
                      : 'text-sm text-surface-600 dark:text-surface-400'
                  }
                >
                  {confirmZurücksetzenDatabase
                    ? 'Lokale Daten löschen und neu laden? Dieser Vorgang kann nicht rückgängig gemacht werden.'
                    : 'Lokale Daten löschen. Die Daten auf dem CalDAV-Server bleiben erhalten.'}
                </p>
              </div>
              {!confirmZurücksetzenDatabase ? (
                <button
                  type="button"
                  onClick={() => {
                    setConfirmZurücksetzenDatabase(true);
                    setConfirmZurücksetzenPrefs(false);
                    setZurücksetzenPreferencesError(null);
                  }}
                  className={destructiveButtonClasses}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Zurücksetzen Database
                </button>
              ) : (
                <div className="space-y-3">
                  {resetDatabaseError && (
                    <p className="selectable text-semantic-error text-sm">{resetDatabaseError}</p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleZurücksetzenDatabase}
                      disabled={isZurücksetzentingDatabase}
                      className={destructiveButtonClasses}
                    >
                      {isZurücksetzentingDatabase ? 'Wird zurückgesetzt...' : 'Zurücksetzen'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmZurücksetzenDatabase(false);
                        setZurücksetzenDatabaseError(null);
                      }}
                      disabled={isZurücksetzentingDatabase}
                      className={cancelButtonClasses}
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </ActionCard>
      </main>
    </div>
  );
};
