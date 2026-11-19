import Globe from 'lucide-react/icons/globe';
import { LoadingSpinner } from '$components/LoadingSpinner';

interface BrowserAuthStepProps {
  providerName: string;
  phase: 'idle' | 'validating' | 'browser' | 'connecting' | 'done';
}

export const BrowserAuthStep = ({ providerName, phase }: BrowserAuthStepProps) => {
  if (phase === 'validating') {
    return (
      <div className="py-8 text-center">
        <LoadingSpinner className="mx-auto mb-3 h-10 w-10 text-primary-ink" />
        <h3 className="mb-1 font-medium text-base text-surface-800 dark:text-surface-200">
          Server wird überprüft …
        </h3>
        <p className="text-sm text-surface-500 dark:text-surface-400">
          Checking that {providerName} is reachable
        </p>
      </div>
    );
  }

  if (phase === 'browser') {
    return (
      <div className="py-8 text-center">
        <LoadingSpinner className="mx-auto mb-3 h-10 w-10 text-primary-ink" />
        <h3 className="mb-1 font-medium text-base text-surface-800 dark:text-surface-200">
          Warte auf Autorisierung …
        </h3>
        <p className="text-sm text-surface-500 dark:text-surface-400">
          Schließe die Anmeldung im Browser ab und kehre anschließend hierher zurück.
        </p>
      </div>
    );
  }

  if (phase === 'connecting') {
    return (
      <div className="py-8 text-center">
        <LoadingSpinner className="mx-auto mb-3 h-10 w-10 text-primary-ink" />
        <h3 className="mb-1 font-medium text-base text-surface-800 dark:text-surface-200">
          Konto wird eingerichtet …
        </h3>
        <p className="text-sm text-surface-500 dark:text-surface-400">Kalender werden importiert</p>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="py-8 text-center">
        <LoadingSpinner className="mx-auto mb-3 h-10 w-10 text-primary-ink" />
        <h3 className="mb-1 font-medium text-base text-surface-800 dark:text-surface-200">
          Wird abgeschlossen …
        </h3>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-surface-200 bg-surface-50 p-5 text-center dark:border-surface-600 dark:bg-surface-700/50">
      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-surface-200 dark:bg-surface-600">
        <Globe className="size-6 text-surface-600 dark:text-surface-300" />
      </div>
      <h3 className="mb-1 font-medium text-sm text-surface-800 dark:text-surface-200">
        Browser authentication with {providerName}
      </h3>
      <p className="text-sm text-surface-600 dark:text-surface-400">
        Chiri öffnet zur Authentifizierung deinen Browser.
      </p>
      <p className="mt-1 text-surface-500 text-xs dark:text-surface-400">
        Sobald du den Zugriff bestätigst, wirst du automatisch hierher zurückgeleitet.
      </p>
    </div>
  );
};
