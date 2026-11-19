import type { ReactNode } from 'react';
import type { ServerType } from '$types/account';

export interface CalDAVWarning {
  title: string;
  message: ReactNode;
  confirmLabel: string;
  delayConfirmSeconds?: number;
}

export type UnsupportedCalDAVProvider = 'google' | 'icloud';

export const UNSUPPORTED_CALDAV_WARNINGS: Record<UnsupportedCalDAVProvider, CalDAVWarning> = {
  google: {
    title: 'Google-CalDAV-Warnung',
    message: (
      <div className="space-y-3">
        <p>Der CalDAV-Server von Google unterstützt keine VTODO-Einträge.</p>
        <p className="text-surface-700 dark:text-surface-300">
          Chiri synchronisiert Aufgaben über VTODO. Daher können Google-Kalender-CalDAV-Konten keine Aufgaben synchronisieren.
        </p>
        <p className="font-extrabold text-surface-800 dark:text-surface-200">
          Dieses Konto wird nicht unterstützt. Es wird empfohlen, stattdessen einen CalDAV-Server mit VTODO-Unterstützung zu verwenden.
        </p>
      </div>
    ),
    confirmLabel: 'Trotzdem fortfahren',
    delayConfirmSeconds: 5,
  },
  icloud: {
    title: 'iCloud-CalDAV-Warnung',
    message: (
      <div className="space-y-3">
        <p>
          Die mit iOS 13 und macOS 10.15 eingeführte Apple-Erinnerungen-App verwendet ein proprietäres Format,
          das nicht mit Chiri kompatibel ist.
        </p>
        <p className="text-surface-700 dark:text-surface-300">
          Du kannst Aufgaben weiterhin mit iCloud synchronisieren. Aktualisierte Apple-Erinnerungsdaten
          werden jedoch nicht in iOS 13+, macOS 10.15+ oder auf iCloud.com angezeigt.
        </p>
        <p className="font-extrabold text-surface-800 dark:text-surface-200">
          iCloud-Konten werden nicht unterstützt. Wenn möglich, wird empfohlen, einen anderen CalDAV-Server zu verwenden.
        </p>
      </div>
    ),
    confirmLabel: 'Continue anyway',
    delayConfirmSeconds: 5,
  },
};

export const CALDAV_SERVER_WARNINGS: Partial<Record<ServerType, CalDAVWarning>> = {
  vikunja: {
    title: 'Vikunja-Serverwarnung',
    message: (
      <div className="space-y-3">
        <p>Die aktuelle CalDAV-Implementierung von Vikunja ist unvollständig und kann Probleme verursachen.</p>
        <p className="text-surface-700 dark:text-surface-300">
          Diese App funktioniert möglicherweise nicht zuverlässig mit Vikunja. Es kann zu Synchronisierungsproblemen, fehlenden
          Funktionen oder anderen Fehlern kommen.
        </p>
        <p className="font-extrabold text-surface-800 dark:text-surface-200">
          Es wird nur eingeschränkter Support angeboten. Wenn möglich, wird empfohlen, einen anderen CalDAV-Server zu verwenden.
        </p>
      </div>
    ),
    confirmLabel: 'Trotzdem fortfahren (riskant)',
    delayConfirmSeconds: 5,
  },
};
