import type { ServerType } from '$types/account';
import type { DateFormat, StartOfWeek } from '$types/settings/categories/region';

interface ServerTypeOption {
  value: ServerType;
  label: string;
  description?: string;
  homepageUrl?: string;
}

interface ServerTypeGroup {
  label: string;
  options: ServerTypeOption[];
}

/**
 * date format options
 */
export const DATE_FORMAT_OPTIONS: Array<{ value: DateFormat; label: string; example: string }> = [
  { value: 'MMM d, yyyy', label: 'Jan 15, 2025', example: 'Jan 15, 2025' },
  { value: 'd MMM yyyy', label: '15 Jan 2025', example: '15 Jan 2025' },
  { value: 'MM/dd/yyyy', label: '01/15/2025', example: '01/15/2025' },
  { value: 'dd/MM/yyyy', label: '15/01/2025', example: '15/01/2025' },
  { value: 'yyyy-MM-dd', label: '2025-01-15', example: '2025-01-15' },
];

/**
 * days of week options for calendar start day
 */
export const WEEK_START_OPTIONS: Array<{ value: StartOfWeek; label: string }> = [
  { value: 'sunday', label: 'Sonntag' },
  { value: 'monday', label: 'Montag' },
  { value: 'tuesday', label: 'Dienstag' },
  { value: 'wednesday', label: 'Mittwoch' },
  { value: 'thursday', label: 'Donnerstag' },
  { value: 'friday', label: 'Freitag' },
  { value: 'saturday', label: 'Samstag' },
];

/**
 * connectivity check interval options (in seconds)
 */
export const CONNECTIVITY_CHECK_INTERVAL_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 15, label: 'Alle 15 Sekunden' },
  { value: 30, label: 'Alle 30 Sekunden' },
  { value: 60, label: 'Jede Minute' },
  { value: 120, label: 'Alle 2 Minuten' },
  { value: 300, label: 'Alle 5 Minuten' },
];

export const DEFAULT_PROXY_HOST = '127.0.0.1';
export const DEFAULT_HTTP_PROXY_PORT = 8080;
export const DEFAULT_SOCKS_PROXY_PORT = 1080;

/**
 * sync interval options (in minutes)
 */
export const SYNC_INTERVAL_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 1, label: 'Jede Minute' },
  { value: 5, label: 'Alle 5 Minuten' },
  { value: 15, label: 'Alle 15 Minuten' },
  { value: 30, label: 'Alle 30 Minuten' },
  { value: 60, label: 'Jede Stunde' },
];

export const SERVER_TYPE_GROUPS: ServerTypeGroup[] = [
  {
    label: 'Allgemein',
    options: [
      {
        value: 'generic',
        label: 'Allgemein (automatische Erkennung)',
        description:
          "Chiri versucht, die CalDAV-URLs deines Servers automatisch zu erkennen. Verwende diese Option, wenn dein Server nicht aufgeführt ist.",
      },
    ],
  },
  {
    label: 'Verwaltete Dienste',
    options: [
      {
        value: 'fastmail',
        label: 'Fastmail',
        description:
          'Fastmail ist ein unabhängiger, mitarbeitergeführter E-Mail- und Kalenderdienst aus Australien mit Fokus auf Datenschutz, Sicherheit und offene Standards.',
        homepageUrl: 'https://fastmail.com',
      },
      {
        value: 'fruux',
        label: 'fruux',
        description:
          'fruux ist ein plattformübergreifender Synchronisierungsdienst für Kontakte, Kalender und Aufgaben auf Basis von SabreDAV.',
        homepageUrl: 'https://fruux.com/',
      },
      {
        value: 'mailbox',
        label: 'Mailbox.org',
        description:
          'mailbox.org ist eine sichere, in Deutschland gehostete E-Mail- und Office-Suite mit CalDAV-/CardDAV-Unterstützung.',
        homepageUrl: 'https://mailbox.org/en/',
      },
      {
        value: 'migadu',
        label: 'Migadu',
        description:
          'Migadu ist ein einfacher, datenschutzfreundlicher E-Mail-Hosting-Dienst für eigene Domains zum Pauschalpreis.',
        homepageUrl: 'https://migadu.com/',
      },
      {
        value: 'purelymail',
        label: 'Purelymail',
        description:
          'Purelymail ist ein günstiger, unkomplizierter E-Mail-Hosting-Dienst, bei dem du deine eigene Domain verwenden kannst.',
        homepageUrl: 'https://purelymail.com/',
      },
      {
        value: 'runbox',
        label: 'Runbox',
        description:
          'Runbox ist ein datenschutzorientierter, nachhaltiger E-Mail-Dienst mit Hosting in Norwegen, der auch Kalender und Kontakte anbietet.',
        homepageUrl: 'https://runbox.com/',
      },
      {
        value: 'disrootCloud',
        label: 'Disroot Cloud',
        description:
          'Disroot ist eine ehrenamtlich betriebene Plattform aus den Niederlanden mit datenschutzfreundlichen, offenen und föderierten Onlinediensten, darunter E-Mail, Cloud-Speicher und Chat.',
        homepageUrl: 'https://disroot.org',
      },
    ],
  },
  {
    label: 'Selbst gehostet',
    options: [
      {
        value: 'baikal',
        label: 'Baikal',
        description:
          'Baïkal ist ein schlanker Open-Source-CalDAV- und CardDAV-Server auf Basis von SabreDAV.',
        homepageUrl: 'https://github.com/sabre-io/Baikal',
      },
      {
        value: 'nextcloud',
        label: 'Nextcloud',
        description:
          'Nextcloud ist eine selbst gehostete Cloud-Plattform für Dateien, Kalender, Kontakte und Aufgaben.',
        homepageUrl: 'https://github.com/nextcloud/server',
      },
      {
        value: 'radicale',
        label: 'Radicale',
        description:
          'Radicale ist ein kleiner, aber leistungsfähiger CalDAV-Server (Kalender) und CardDAV-Server (Kontakte).',
        homepageUrl: 'https://github.com/Kozea/Radicale',
      },
      {
        value: 'rustical',
        label: 'RustiCal',
        description:
          'RustiCal ist ein schlanker, auf Rust basierender CalDAV-/CardDAV-Server. Er wird als einzelne Binärdatei ausgeliefert und soll eine gute Leistung bieten.',
        homepageUrl: 'https://github.com/lennart-k/rustical/',
      },
      {
        value: 'stalwart',
        label: 'Stalwart',
        description:
          'Stalwart ist ein sicherer, skalierbarer All-in-one-Mail- und Kollaborationsserver mit CalDAV-/CardDAV-Unterstützung.',
        homepageUrl: 'https://stalw.art/',
      },
      {
        value: 'vikunja',
        label: 'Vikunja',
        description: 'Vikunja ist ein quelloffenes, selbst hostbares Werkzeug zur Aufgaben- und Projektverwaltung.',
        homepageUrl: 'https://vikunja.io/',
      },
      {
        value: 'xandikos',
        label: 'Xandikos',
        description: 'Xandikos ist ein schlanker, Git-basierter CalDAV-/CardDAV-Server.',
        homepageUrl: 'https://github.com/jelmer/xandikos',
      },
    ],
  },
];

// flat list for convenience
export const SERVER_TYPE_OPTIONS: ServerTypeOption[] = SERVER_TYPE_GROUPS.flatMap(
  (group) => group.options,
);

/**
 * predefined server URLs for known server types
 */
export const PREDEFINED_SERVER_URLS: Partial<Record<ServerType, string>> = {
  disrootCloud: 'https://cloud.disroot.org',
  fastmail: 'https://caldav.fastmail.com',
  fruux: 'https://dav.fruux.com',
  mailbox: 'https://dav.mailbox.org',
  migadu: 'https://cdav.migadu.com',
  purelymail: 'https://purelymail.com',
  runbox: 'https://dav.runbox.com',
};

/**
 * get predefined server URL for a server type
 */
export const getPredefinedServerUrl = (type: ServerType) => {
  return PREDEFINED_SERVER_URLS[type];
};
