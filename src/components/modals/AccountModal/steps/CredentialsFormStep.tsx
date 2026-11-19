import Info from 'lucide-react/icons/info';
import AlertTriangle from 'lucide-react/icons/triangle-alert';
import type { ReactNode, SubmitEvent } from 'react';
import { ConnectionNoticeBanner } from '$components/banners/ConnectionNoticeBanner';
import { ServerTypeDescriptionBanner } from '$components/banners/ServerTypeDescriptionBanner';
import { ComposedInput } from '$components/ComposedInput';
import { IconEmojiPicker } from '$components/IconEmojiPicker';
import { AdvancedSectionStep } from '$components/modals/AccountModal/steps/AdvancedSectionStep';
import { Tooltip } from '$components/Tooltip';
import { getPredefinedServerUrl } from '$constants/settings';
import { useInitialFocusRef } from '$hooks/ui/useInitialFocusRef';
import type { CalDAVSetupError, CalDAVSetupNotice } from '$lib/caldav/setup';
import type { Account, ServerType } from '$types/account';

interface CredentialsFormStepProps {
  serverType: ServerType;
  name: string;
  onNameChange: (v: string) => void;
  icon: string;
  onIconChange: (v: string) => void;
  emoji: string;
  onEmojiChange: (v: string) => void;
  serverUrl: string;
  onServerUrlChange: (v: string) => void;
  username: string;
  onBenutzernameChange: (v: string) => void;
  password: string;
  onPasswordChange: (v: string) => void;
  principalUrl: string;
  onPrincipalUrlChange: (v: string) => void;
  calendarHomeUrl: string;
  onCalendarHomeUrlChange: (v: string) => void;
  account: Account | null;
  error: CalDAVSetupError | null;
  setupNotice: CalDAVSetupNotice | null;
  testSuccess: boolean;
  testedCalendarCount: number;
  testedPushSupportedCount: number;
  onSubmit: (e: SubmitEvent<HTMLFormElement>) => void;
}

const SERVER_HINTS: Partial<Record<ServerType, { text: ReactNode; href: string }>> = {
  disrootCloud: {
    text: (
      <>
        Wenn die Zwei-Faktor-Authentifizierung (2FA) aktiviert ist, musst du{' '}
        <a
          href="https://cloud.disroot.org/settings/user/security#security:~:text=Devices%20%26%20sessions"
          target="_blank"
          rel="noreferrer"
          className="font-medium underline underline-offset-2 hover:opacity-80"
        >
          ein App-Passwort erstellen
        </a>{' '}
        in deinem Disroot-Cloud-Konto erstellen und es hier anstelle deines normalen Passworts verwenden.
      </>
    ),
    href: 'https://cloud.disroot.org/settings/user/security#security:~:text=Devices%20%26%20sessions',
  },
  fastmail: {
    text: (
      <>
        Um Chiri mit Fastmail zu verwenden,{' '}
        <a
          href="https://app.fastmail.com/settings/security/apps/new"
          target="_blank"
          rel="noreferrer"
          className="font-medium underline underline-offset-2 hover:opacity-80"
        >
          ein App-Passwort erstellen
        </a>{' '}
        mit Zugriff auf CalDAV.
      </>
    ),
    href: 'https://app.fastmail.com/settings/security/apps/new',
  },
  fruux: {
    text: (
      <>
        Für fruux empfiehlt es sich, gerätespezifische Zugangsdaten zu verwenden.{' '}
        <a
          href="https://fruux.com/sync/credentials/?deviceType=generic"
          target="_blank"
          rel="noreferrer"
          className="font-medium underline underline-offset-2 hover:opacity-80"
        >
          Neues Gerät erstellen
        </a>{' '}
        und anschließend den generierten Benutzernamen und das Passwort zu verwenden.
      </>
    ),
    href: 'https://fruux.com/sync/credentials/?deviceType=generic',
  },
  runbox: {
    text: (
      <>
        Wenn die Zwei-Faktor-Authentifizierung (2FA) aktiviert ist, musst du{' '}
        <a
          href="https://runbox.com/mail/account_security"
          target="_blank"
          rel="noreferrer"
          className="font-medium underline underline-offset-2 hover:opacity-80"
        >
          ein App-Passwort erstellen
        </a>{' '}
        und es hier anstelle deines normalen Passworts verwenden.
      </>
    ),
    href: 'https://runbox.com/mail/account_security',
  },
  purelymail: {
    text: (
      <>
        Wenn die Zwei-Faktor-Authentifizierung (2FA) aktiviert ist, musst du{' '}
        <a
          href="https://purelymail.com/manage/users"
          target="_blank"
          rel="noreferrer"
          className="font-medium underline underline-offset-2 hover:opacity-80"
        >
          ein App-Passwort erstellen
        </a>{' '}
        und es hier anstelle deines normalen Passworts verwenden.
      </>
    ),
    href: 'https://purelymail.com/manage/users',
  },
  migadu: {
    text: (
      <>
        Für eine bessere Trennung in Migadu{' '}
        <a
          href="https://migadu.com/guides/identities/"
          target="_blank"
          rel="noreferrer"
          className="font-medium underline underline-offset-2 hover:opacity-80"
        >
          eine separate Mailbox-Identität erstellen
        </a>{' '}
        mit einem eigenen Passwort einrichten und hier verwenden, damit der CalDAV-Zugriff von deiner Haupt-Mailbox getrennt ist.
      </>
    ),
    href: 'https://migadu.com/guides/identities/',
  },
  mailbox: {
    text: (
      <>
        Wenn die Zwei-Faktor-Authentifizierung (2FA) aktiviert ist, musst du{' '}
        <a
          href="https://kb.mailbox.org/en/private/security-and-privacy/application-passwords-for-external-programs/"
          target="_blank"
          rel="noreferrer"
          className="font-medium underline underline-offset-2 hover:opacity-80"
        >
          ein App-Passwort erstellen
        </a>{' '}
        with access to CalDAV/CardDAV und es hier anstelle deines normalen Passworts verwenden.
      </>
    ),
    href: 'https://kb.mailbox.org/en/private/security-and-privacy/application-passwords-for-external-programs/',
  },
  rustical: {
    text: (
      <>
        Für Chiri mit RustiCal wird ein App-Token benötigt. Du kannst es in deinem Dashboard erstellen.{' '}
        <a
          href="https://lennart-k.github.io/rustical/installation/#password-vs-app-tokens:~:text=respective%20principal%20URLs.-,Password%20vs%20app%20tokens,-The%20password%20is"
          target="_blank"
          rel="noreferrer"
          className="font-medium underline underline-offset-2 hover:opacity-80"
        >
          Weitere Informationen zu App-Passwörtern in RustiCal
        </a>
        .
      </>
    ),
    href: 'https://lennart-k.github.io/rustical/installation/#password-vs-app-tokens:~:text=respective%20principal%20URLs.-,Password%20vs%20app%20tokens,-The%20password%20is',
  },
  stalwart: {
    text: (
      <>
        Wenn die Zwei-Faktor-Authentifizierung (2FA) aktiviert ist, musst du{' '}
        <a
          href="https://stalw.art/docs/auth/authentication/app-password/"
          target="_blank"
          rel="noreferrer"
          className="font-medium underline underline-offset-2 hover:opacity-80"
        >
          ein App-Passwort erstellen
        </a>{' '}
        und es hier anstelle deines normalen Passworts verwenden.
      </>
    ),
    href: 'https://stalw.art/docs/auth/authentication/app-password/',
  },
};

const USERNAME_LABELS: Partial<Record<ServerType, string>> = {
  fastmail: 'E-Mail-Adresse',
  mailbox: 'E-Mail-Adresse',
  migadu: 'E-Mail-Adresse',
  purelymail: 'E-Mail-Adresse',
  runbox: 'Benutzername oder E-Mail-Adresse',
  fruux: 'E-Mail-Adresse oder Geräte-Benutzername',
  disrootCloud: 'Benutzername oder E-Mail-Adresse',
  nextcloud: 'Benutzername oder E-Mail-Adresse',
  stalwart: 'Benutzername oder E-Mail-Adresse',
};

const USERNAME_PLACEHOLDERS: Partial<Record<ServerType, string>> = {
  fastmail: 'email@example.com',
  mailbox: 'email@example.com',
  migadu: 'email@example.com',
  purelymail: 'email@example.com',
  runbox: 'Benutzername or email@example.com',
  fruux: 'email@example.com or b1234567890',
  disrootCloud: 'Benutzername or email@example.com',
  nextcloud: 'Benutzername or email@example.com',
  stalwart: 'Benutzername or email@example.com',
};

const PASSWORD_LABELS: Partial<Record<ServerType, string>> = {
  fastmail: 'App-Passwort',
  mailbox: 'Passwort oder App-Passwort',
  disrootCloud: 'Passwort oder App-Passwort',
  fruux: 'Passwort oder App-Passwort',
  purelymail: 'Passwort oder App-Passwort',
  runbox: 'Passwort oder App-Passwort',
  nextcloud: 'Passwort oder App-Passwort',
  rustical: 'App-Token',
  stalwart: 'Passwort oder App-Passwort',
};

const PASSWORD_PLACEHOLDERS: Partial<Record<ServerType, string>> = {
  fastmail: 'App-Passwort eingeben',
  mailbox: 'Passwort oder App-Passwort eingeben',
  disrootCloud: 'Passwort oder App-Passwort eingeben',
  fruux: 'Passwort oder App-Passwort eingeben',
  purelymail: 'Passwort oder App-Passwort eingeben',
  runbox: 'Passwort oder App-Passwort eingeben',
  nextcloud: 'Passwort oder App-Passwort eingeben',
  rustical: 'App-Token eingeben',
  stalwart: 'Passwort oder App-Passwort eingeben',
};

export const CredentialsFormStep = ({
  serverType,
  name,
  onNameChange,
  icon,
  onIconChange,
  emoji,
  onEmojiChange,
  serverUrl,
  onServerUrlChange,
  username,
  onBenutzernameChange,
  password,
  onPasswordChange,
  principalUrl,
  onPrincipalUrlChange,
  calendarHomeUrl,
  onCalendarHomeUrlChange,
  account,
  error,
  setupNotice,
  testSuccess,
  testedCalendarCount,
  testedPushSupportedCount,
  onSubmit,
}: CredentialsFormStepProps) => {
  const nameInputRef = useInitialFocusRef<HTMLInputElement>();
  const hint = SERVER_HINTS[serverType];

  return (
    <form onSubmit={onSubmit} className="space-y-4 p-4">
      <ServerTypeDescriptionBanner serverType={serverType} />

      <div>
        <label
          htmlFor="account-name"
          className="mb-1 block font-medium text-sm text-surface-700 dark:text-surface-300"
        >
          Anzeigename des Kontos
        </label>
        <div className="flex items-center gap-2">
          <IconEmojiPicker
            iconValue={icon}
            emojiValue={emoji}
            onIconChange={onIconChange}
            onEmojiChange={onEmojiChange}
          />
          <ComposedInput
            id="account-name"
            type="text"
            ref={nameInputRef}
            value={name}
            onChange={onNameChange}
            placeholder="Mein CalDAV-Konto"
            required
            className="flex-1 rounded-lg border border-transparent bg-surface-100 px-3 py-2 text-sm text-surface-800 transition-colors focus:border-primary-ink focus:bg-white focus:outline-hidden dark:bg-surface-700 dark:text-surface-200 dark:focus:bg-surface-800"
          />
        </div>
      </div>

      {!getPredefinedServerUrl(serverType) && (
        <div>
          <label
            htmlFor="server-url"
            className="mb-1 flex items-center gap-1.5 font-medium text-sm text-surface-700 dark:text-surface-300"
          >
            <span>Server-URL</span>
            {serverType === 'generic' && (
              <Tooltip
                content="Die App versucht, die Einstellungen anhand der Basis-URL automatisch zu ermitteln."
                position="top"
                allowInModal
              >
                <button
                  type="button"
                  aria-label="Hilfe zur Server-URL"
                  className="inline-flex rounded-sm text-surface-400 outline-none transition-colors hover:text-surface-600 focus-visible:ring-2 focus-visible:ring-primary-ink dark:hover:text-surface-300"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
            )}
          </label>
          <ComposedInput
            id="server-url"
            type="url"
            value={serverUrl}
            onChange={onServerUrlChange}
            placeholder="https://caldav.example.com"
            required
            className="w-full rounded-lg border border-transparent bg-surface-100 px-3 py-2 text-sm text-surface-800 transition-colors focus:border-primary-ink focus:bg-white focus:outline-hidden dark:bg-surface-700 dark:text-surface-200 dark:focus:bg-surface-800"
          />
        </div>
      )}

      <div>
        <label
          htmlFor="username"
          className="mb-1 block font-medium text-sm text-surface-700 dark:text-surface-300"
        >
          {USERNAME_LABELS[serverType] ?? 'Benutzername'}
        </label>
        <ComposedInput
          id="username"
          type="text"
          value={username}
          onChange={onBenutzernameChange}
          placeholder={USERNAME_PLACEHOLDERS[serverType] ?? 'Benutzernamen eingeben'}
          required
          className="w-full rounded-lg border border-transparent bg-surface-100 px-3 py-2 text-sm text-surface-800 transition-colors focus:border-primary-ink focus:bg-white focus:outline-hidden dark:bg-surface-700 dark:text-surface-200 dark:focus:bg-surface-800"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1 block font-medium text-sm text-surface-700 dark:text-surface-300"
        >
          {PASSWORD_LABELS[serverType] ?? 'Passwort'}
        </label>
        <ComposedInput
          id="password"
          type="password"
          value={password}
          onChange={onPasswordChange}
          placeholder={
            account ? '(unverändert)' : (PASSWORD_PLACEHOLDERS[serverType] ?? 'Passwort eingeben')
          }
          required={!account}
          className="w-full rounded-lg border border-transparent bg-surface-100 px-3 py-2 text-sm text-surface-800 transition-colors focus:border-primary-ink focus:bg-white focus:outline-hidden dark:bg-surface-700 dark:text-surface-200 dark:focus:bg-surface-800"
        />
        {hint && (
          <div className="mt-3 flex gap-2 rounded-lg border border-semantic-warning/30 bg-semantic-warning/10 px-3 py-2 text-surface-700 text-xs dark:text-surface-300">
            <AlertTriangle className="mt-px size-3.5 shrink-0 text-semantic-warning" />
            <span>{hint.text}</span>
          </div>
        )}
      </div>

      <AdvancedSectionStep
        serverType={serverType}
        principalUrl={principalUrl}
        onPrincipalUrlChange={onPrincipalUrlChange}
        calendarHomeUrl={calendarHomeUrl}
        onCalendarHomeUrlChange={onCalendarHomeUrlChange}
        initialOpen={!!account?.caldav?.calendarHomeUrl || !!account?.caldav?.principalUrl}
      />

      <ConnectionNoticeBanner
        success={testSuccess}
        error={error}
        notice={setupNotice}
        calendarCount={testedCalendarCount}
        pushSupported={testSuccess ? testedPushSupportedCount > 0 : undefined}
      />
    </form>
  );
};
