import Download from 'lucide-react/icons/download';
import KeyRound from 'lucide-react/icons/key-round';
import Share2 from 'lucide-react/icons/share-2';
import Smartphone from 'lucide-react/icons/smartphone';
import TriangleAlert from 'lucide-react/icons/triangle-alert';
import Wifi from 'lucide-react/icons/wifi';
import { useState } from 'react';
import { ModalButton } from '$components/ModalButton';
import { ModalWrapper } from '$components/ModalWrapper';
import { getErrorMessage } from '$lib/http';
import {
  getMobileConfigCredentialWarnings,
  getMobileConfigExportEligibility,
} from '$lib/mobileconfig/generate';
import { shareMobileConfig } from '$lib/mobileconfig/share';
import { toastManager } from '$lib/toast-manager';
import type { Account } from '$types/account';
import { isMacPlatform } from '$utils/platform';

interface MobileConfigExportModalProps {
  account: Account;
  onConfirm: (includePassword: boolean) => void;
  onClose: () => void;
}

export const MobileConfigExportModal = ({
  account,
  onConfirm,
  onClose,
}: MobileConfigExportModalProps) => {
  const [includePassword, setIncludePassword] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const credentialWarnings = getMobileConfigCredentialWarnings(account, includePassword);
  const eligibility = getMobileConfigExportEligibility(account);
  const hasOAuthTokenWarning = credentialWarnings.includes('oauth-token-may-expire');
  const credentialLabel =
    account.caldav?.authType === 'oauth' ? 'Aktuelles Zugriffstoken einschließen' : 'Passwort einschließen';

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const result = await shareMobileConfig(account, { includePassword });
      if (result === 'shared') {
        toastManager.success('Profil geteilt', 'Öffne es auf dem Zielgerät, um es zu installieren.');
      } else {
        toastManager.error(
          'Teilen nicht verfügbar',
          'Dein System unterstützt das Teilen dieser Datei nicht. Verwende stattdessen „Exportieren“, um sie zu speichern.',
        );
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      toastManager.error('Profil konnte nicht geteilt werden', getErrorMessage(error));
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <ModalWrapper
      onClose={onClose}
      title="Als .mobileconfig exportieren"
      description={`Richte „${account.name}“ auf deinem iPhone, iPad oder Mac ein`}
      size="md"
      zIndex="z-70"
      initialFocus="dialog"
      footerLeft={
        <ModalButton
          variant="secondary"
          onClick={handleShare}
          disabled={!eligibility.eligible || isSharing}
        >
          <Share2 className="h-4 w-4" />
          Teilen
        </ModalButton>
      }
      footer={
        <>
          <ModalButton variant="secondary" onClick={onClose}>
            Abbrechen
          </ModalButton>
          <ModalButton onClick={() => onConfirm(includePassword)} disabled={!eligibility.eligible}>
            <Download className="h-4 w-4" />
            Exportieren
          </ModalButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center gap-2 rounded-lg border border-surface-200 bg-surface-50 px-2 py-3 text-center dark:border-surface-700 dark:bg-surface-900/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/10 text-primary-ink">
              <Download className="h-4 w-4" />
            </div>
            <p className="text-surface-700 text-xs leading-snug dark:text-surface-300">
              Datei herunterladen
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-lg border border-surface-200 bg-surface-50 px-2 py-3 text-center dark:border-surface-700 dark:bg-surface-900/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/10 text-primary-ink">
              <Wifi className="h-4 w-4" />
            </div>
            <p className="text-surface-700 text-xs leading-snug dark:text-surface-300">
              {isMacPlatform() ? 'Per AirDrop senden oder teilen' : 'An dein Gerät senden'}
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-lg border border-surface-200 bg-surface-50 px-2 py-3 text-center dark:border-surface-700 dark:bg-surface-900/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/10 text-primary-ink">
              <Smartphone className="h-4 w-4" />
            </div>
            <p className="text-surface-700 text-xs leading-snug dark:text-surface-300">
              Auf dem Gerät installieren
            </p>
          </div>
        </div>

        <p className="text-sm text-surface-500 leading-relaxed dark:text-surface-400">
          Eine{' '}
          <span className="font-medium text-surface-700 dark:text-surface-300">.mobileconfig</span>{' '}
          file is an Apple Configuration Profile that automatically sets up your CalDAV account in
          one tap.{' '}
        </p>

        <p className="text-sm text-surface-500 leading-relaxed dark:text-surface-400">
          <a
            href="https://support.apple.com/guide/mdm/intro-to-device-management-profiles-mdm0d350920d/1/web/1.0"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary-ink hover:underline hover:opacity-80"
          >
            Mehr über .mobileconfig-Dateien erfahren
          </a>
        </p>

        {!eligibility.eligible && (
          <div className="flex gap-2 rounded-lg border border-semantic-error/30 bg-semantic-error/10 px-3 py-2 text-surface-700 text-xs dark:text-surface-300">
            <TriangleAlert className="mt-px size-3.5 shrink-0 text-semantic-error" />
            <span>
              {eligibility.reason === 'local-account'
                ? 'Lokale Konten können nicht als CalDAV-Konfigurationsprofile exportiert werden.'
                : 'Dieses Konto hat eine ungültige CalDAV-Server-URL. Chiri kann dafür kein Profil erstellen.'}
            </span>
          </div>
        )}

        <div className="rounded-lg border border-surface-200 dark:border-surface-700">
          <label className="flex cursor-pointer items-start gap-3 p-3">
            <input
              id="mobileconfig-include-password"
              type="checkbox"
              checked={includePassword}
              onChange={(e) => setIncludePassword(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded-sm border-surface-300 outline-hidden focus:ring-2 focus:ring-primary-ink focus:ring-offset-2 dark:border-surface-600"
            />
            <div>
              <p className="flex items-center gap-1.5 font-medium text-sm text-surface-700 dark:text-surface-300">
                <KeyRound className="h-3.5 w-3.5 shrink-0 text-surface-500 dark:text-surface-400" />
                {credentialLabel}
              </p>
              <p className="mt-0.5 text-surface-500 text-xs leading-relaxed dark:text-surface-400">
                {includePassword
                  ? 'Die Zugangsdaten werden eingebettet. Das Gerät meldet sich automatisch ohne Rückfrage an.'
                  : 'Das Passwort wird nicht in der Datei gespeichert. Das Gerät fragt während der Installation danach.'}
              </p>
            </div>
          </label>
        </div>

        {hasOAuthTokenWarning && (
          <div className="flex gap-2 rounded-lg border border-semantic-warning/30 bg-semantic-warning/10 px-3 py-2 text-surface-700 text-xs dark:text-surface-300">
            <TriangleAlert className="mt-px size-3.5 shrink-0 text-semantic-warning" />
            <span>
              Dieses Konto verwendet OAuth. Chiri kann das aktuelle Token exportieren, Apple kann es jedoch nicht über das Profil erneuern. Verwende ein App-Passwort, wenn du eine dauerhaft nutzbare Einrichtungsdatei benötigst.
            </span>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};
