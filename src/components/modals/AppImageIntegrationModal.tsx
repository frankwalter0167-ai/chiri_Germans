import AppIcon from '$components/AppIcon';
import { ModalButton } from '$components/ModalButton';
import { ModalWrapper } from '$components/ModalWrapper';

interface AppImageIntegrationModalProps {
  isIntegrating: boolean;
  error: string | null;
  onIntegrate: () => void;
  onSkip: () => void;
}

export const AppImageIntegrationModal = ({
  isIntegrating,
  error,
  onIntegrate,
  onSkip,
}: AppImageIntegrationModalProps) => {
  return (
    <ModalWrapper
      onClose={onSkip}
      zIndex="z-70"
      className="max-w-md"
      backdropClassName="bg-black/35 backdrop-blur-md"
      footer={
        <div className="flex w-full justify-end gap-2">
          <ModalButton variant="secondary" onClick={onSkip} disabled={isIntegrating}>
            Nicht jetzt
          </ModalButton>
          <ModalButton onClick={onIntegrate} disabled={isIntegrating}>
            In den Desktop integrieren
          </ModalButton>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-500 text-primary-contrast">
          <AppIcon className="h-7 w-7" />
        </div>
        <div>
          <h2 className="font-semibold text-surface-950 text-xl dark:text-surface-50">
            Chiri zum Anwendungsmenü hinzufügen?
          </h2>
          <p className="mt-2 text-sm text-surface-600 leading-6 dark:text-surface-400">
            Dadurch kannst du Chiri über dein Anwendungsmenü starten. Die AppImage-Datei wird in deinen{' '}
            <code className="rounded bg-surface-100 px-1 py-0.5 font-mono text-xs dark:bg-surface-700">
              ~/Applications
            </code>{' '}
            verschoben.
          </p>
          {error && (
            <p className="mt-3 rounded-lg bg-error-100 p-2.5 text-error-700 text-sm dark:bg-error-900/30 dark:text-error-300">
              {error}
            </p>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};
