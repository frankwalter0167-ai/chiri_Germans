import type { CalDAVClient } from '$lib/caldav';
import type { CalendarDiscoveryDiagnostics } from '$lib/caldav/calendars';
import type { HttpRequestContext } from '$lib/http';
import { DetailedError, getErrorMessage, isCertError } from '$lib/http';
import type { ServerType } from '$types/account';
import { stripHtmlTags } from '$utils/misc';

export interface CalDAVSetupError {
  title: string;
  message: string;
  hint?: string;
  detail?: string;
}

export interface CalDAVSetupNotice {
  title: string;
  message: string;
}

export type CalDAVErrorContext = 'setup' | 'account-sync' | 'calendar-sync';

const isErrorLike = (value: unknown): value is { message: string } =>
  value !== null &&
  typeof value === 'object' &&
  'message' in value &&
  typeof value.message === 'string';

const HTTP_STATUS_RE = /HTTP\s+(\d{3})/i;
const VTODO_CREATION_UNSUPPORTED_PREFIX =
  'Das Erstellen eines VTODO-Kalenders wird nicht unterstützt. Chiri hat das Konto verbunden, konnte aber keinen Aufgabenkalender erstellen.';

const getVtodoSetupErrorInfo = (raw: string, lower: string): CalDAVSetupError | null => {
  if (lower.includes('vtodo calendar creation is not supported')) {
    const detail = raw.replace(VTODO_CREATION_UNSUPPORTED_PREFIX, '').trim();

    return {
      title: 'Aufgabenkalender werden nicht unterstützt',
      message:
        'Chiri hat die Verbindung hergestellt, aber dieses Konto kann keinen VTODO-/Aufgabenkalender erstellen.',
      hint: 'Verwende ein CalDAV-Konto, das Aufgabenkalender unterstützt, oder erstelle bzw. aktiviere auf dem Server einen entsprechenden Kalender, bevor du ihn zu Chiri hinzufügst.',
      detail: detail || raw,
    };
  }

  if (lower.includes('could create a vtodo calendar') && lower.includes('could not clean up')) {
    return {
      title: 'Temporärer Kalender konnte nicht bereinigt werden',
      message:
        'Chiri hat überprüft, dass Aufgabenkalender erstellt werden können, konnte den temporären Testkalender jedoch nicht löschen.',
      hint: 'Lösche den temporären VTODO-Testkalender von Chiri auf dem Server und versuche es erneut.',
      detail: raw,
    };
  }

  return null;
};

const extractErrorDetails = (error: unknown, fallback: string) => {
  const rawDetail =
    error instanceof DetailedError
      ? error.detail
      : error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : fallback;
  const normalized = getErrorMessage(error);
  const normalizedMessage = normalized === 'Unbekannter Fehler' ? fallback : normalized;
  const status = (normalizedMessage.match(HTTP_STATUS_RE) ?? rawDetail.match(HTTP_STATUS_RE))?.[1];
  return { rawDetail, normalizedMessage, status };
};

const getSetupContextErrorInfo = (
  normalizedMessage: string,
  lower: string,
  rawDetail: string,
): CalDAVSetupError | null => {
  const vtodoSetupError = getVtodoSetupErrorInfo(normalizedMessage, lower);
  if (vtodoSetupError) return vtodoSetupError;

  if (lower.includes('connection test is already in progress')) {
    return {
      title: 'Verbindungstest läuft bereits',
      message: normalizedMessage,
      hint: 'Warte, bis der aktuelle Test abgeschlossen ist, und versuche es dann erneut.',
      detail: rawDetail,
    };
  }

  if (lower.includes('password is required') || lower.includes('server url and username')) {
    return {
      title: 'Fehlende Kontodaten',
      message: normalizedMessage,
      hint: 'Fülle die Pflichtfelder aus und teste die Verbindung erneut.',
    };
  }

  return null;
};

const getAuthenticationErrorInfo = (
  lower: string,
  status: string | undefined,
  serverType: ServerType,
  rawDetail: string,
): CalDAVSetupError | null => {
  if (!lower.includes('authentication failed') && status !== '401') return null;

  return {
    title: 'Authentifizierung fehlgeschlagen',
    message: 'Chiri hat den Server erreicht, aber der Benutzername oder das Passwort wurde abgelehnt.',
    hint:
      serverType === 'fastmail'
        ? 'Fastmail benötigt ein App-Passwort mit CalDAV-Zugriff, nicht dein normales Kontopasswort.'
        : 'Überprüfe Benutzername und Passwort. Wenn dein Konto die Zwei-Faktor-Authentifizierung verwendet, benötigst du möglicherweise ein App-Passwort.',
    detail: rawDetail,
  };
};

const getServerResponseErrorInfo = (
  lower: string,
  status: string | undefined,
  serverType: ServerType,
  serverUrl: string,
  context: CalDAVErrorContext,
  rawDetail: string,
): CalDAVSetupError | null => {
  if (lower.includes('forbidden') || status === '403') {
    return {
      title: 'Zugriff verweigert',
      message:
        'Chiri hat den Server erreicht, aber dieses Konto darf nicht auf diesen CalDAV-Pfad zugreifen.',
      hint:
        context === 'calendar-sync'
          ? 'Überprüfe, ob dieses Konto weiterhin auf diesen Kalender zugreifen darf.'
          : 'Überprüfe die Kontoberechtigungen, Freigabeeinstellungen oder die erweiterten Felder für Principal- und Calendar-Home-URL.',
      detail: rawDetail,
    };
  }

  const isCalendarMissing =
    context === 'calendar-sync' &&
    (status === '404' ||
      lower.includes('calendar not found') ||
      lower.includes('calendar unavailable'));
  const isEndpointMissing =
    context !== 'calendar-sync' && (lower.includes('not found') || status === '404');
  if (isCalendarMissing || isEndpointMissing) {
    return {
      title: context === 'calendar-sync' ? 'Kalender nicht verfügbar' : 'CalDAV-Endpunkt nicht gefunden',
      message:
        context === 'calendar-sync'
          ? 'Chiri konnte diesen Kalender auf dem Server nicht finden.'
          : `Chiri hat ${serverUrl.trim() || 'den Server'} erreicht, dort aber keinen ${serverType === 'generic' ? 'CalDAV' : serverType}-CalDAV-Dienst gefunden.`,
      hint:
        context === 'calendar-sync'
          ? 'Überprüfe, ob dieser Kalender noch auf dem Server vorhanden ist und seine URL aktuell ist.'
          : serverType === 'nextcloud'
            ? 'Verwende bei Nextcloud die Basis-Server-URL, z. B. http://localhost:8081. Chiri ergänzt /remote.php/dav/ automatisch.'
            : 'Überprüfe die Server-URL. Bei ungewöhnlichen Konfigurationen kannst du „Erweitert“ öffnen und die Principal-URL oder Calendar-Home-URL angeben.',
      detail: rawDetail,
    };
  }

  if (lower.includes('rate limit') || status === '429') {
    return {
      title: 'Zu viele Anfragen',
      message: 'Der Server begrenzt die Anzahl der Verbindungsversuche.',
      hint: 'Warte einen Moment und versuche es dann erneut.',
      detail: rawDetail,
    };
  }

  if (status && Number(status) >= 500) {
    return {
      title: 'Serverfehler',
      message: `Der CalDAV-Server hat mit HTTP ${status} geantwortet.`,
      hint: 'Der Server ist möglicherweise vorübergehend nicht verfügbar oder falsch konfiguriert. Überprüfe die Serverprotokolle, falls du den Server verwaltest.',
      detail: rawDetail,
    };
  }

  return null;
};

const getRequestErrorInfo = (
  normalizedMessage: string,
  lower: string,
  serverUrl: string,
  fallback: string,
  context: CalDAVErrorContext,
  rawDetail: string,
): CalDAVSetupError | null => {
  if (lower.includes('could not connect to ')) {
    return {
      title: fallback,
      message: normalizedMessage,
      hint: 'Überprüfe die URL und den Port und stelle sicher, dass der Server läuft.',
      detail: rawDetail,
    };
  }

  if (lower.includes('failed to fetch calendars')) {
    return {
      title: 'Kalender konnten nicht aufgelistet werden',
      message: 'Chiri hat eine Verbindung zum Konto hergestellt, konnte die Kalenderliste jedoch nicht lesen.',
      hint: 'Überprüfe, ob das Konto Aufgabenkalender enthält und die Berechtigung hat, diese aufzulisten.',
      detail: rawDetail,
    };
  }

  const isFetchNetworkFailure =
    lower === 'failed to fetch' ||
    (context !== 'calendar-sync' && lower.includes('failed to fetch'));
  if (
    lower.includes('server unreachable') ||
    isFetchNetworkFailure ||
    lower.includes('network') ||
    lower.includes('connection refused') ||
    lower.includes('error sending request for url') ||
    lower.includes('timed out') ||
    lower.includes('timeout')
  ) {
    return {
      title: 'Server nicht erreichbar',
      message: `Chiri konnte ${serverUrl.trim() || 'die Server-URL'} nicht erreichen.`,
      hint: 'Stelle sicher, dass der Server läuft, die URL korrekt ist und keine VPN-Verbindung, Firewall oder kein Proxy die Verbindung blockiert.',
      detail: rawDetail,
    };
  }

  if (isCertError(normalizedMessage)) {
    return {
      title: 'Zertifikat nicht vertrauenswürdig',
      message: 'Das Serverzertifikat konnte nicht überprüft werden.',
      hint: 'Wenn es dein eigener Server mit einem selbstsignierten oder privaten Zertifikat ist, bestätige bei entsprechender Aufforderung, dass du ihm vertraust.',
      detail: rawDetail,
    };
  }

  if (lower.includes('failed to discover') || lower.includes('auto-discovery')) {
    return {
      title: 'CalDAV-Erkennung fehlgeschlagen',
      message:
        'Chiri hat den Server erreicht, konnte aber weder den CalDAV-Principal noch das Kalenderverzeichnis ermitteln.',
      hint: 'Wähle statt „Allgemein“ den passenden Servertyp oder öffne „Erweitert“ und gib die Principal-URL bzw. Calendar-Home-URL ein.',
      detail: rawDetail,
    };
  }

  if (lower.includes('invalid caldav xml') || lower.includes('invalid caldav multistatus')) {
    return {
      title: 'Ungültige CalDAV-Antwort',
      message: 'Chiri hat den Server erreicht, aber dieser hat fehlerhaftes WebDAV-XML zurückgegeben.',
      hint: 'Das bedeutet normalerweise, dass die URL auf einen Nicht-CalDAV-Endpunkt, eine Proxy-Fehlerseite oder eine fehlerhafte Serverantwort verweist.',
      detail: rawDetail,
    };
  }

  return null;
};

export const getCalDAVErrorInfo = (
  error: unknown,
  fallback: string,
  serverType: ServerType,
  serverUrl: string,
  context: CalDAVErrorContext = 'setup',
): CalDAVSetupError => {
  const { rawDetail, normalizedMessage, status } = extractErrorDetails(error, fallback);
  const lower = normalizedMessage.toLowerCase();

  if (context === 'setup') {
    const setupError = getSetupContextErrorInfo(normalizedMessage, lower, rawDetail);
    if (setupError) return setupError;
  }

  const authenticationError = getAuthenticationErrorInfo(lower, status, serverType, rawDetail);
  if (authenticationError) return authenticationError;

  const serverError = getServerResponseErrorInfo(
    lower,
    status,
    serverType,
    serverUrl,
    context,
    rawDetail,
  );
  if (serverError) return serverError;

  const requestError = getRequestErrorInfo(
    normalizedMessage,
    lower,
    serverUrl,
    fallback,
    context,
    rawDetail,
  );
  if (requestError) return requestError;

  return {
    title: fallback,
    message: normalizedMessage,
    hint: context === 'setup' ? 'Überprüfe die Kontodaten und versuche es erneut.' : undefined,
    detail: rawDetail,
  };
};

export const getSetupNotice = (
  diagnostics: CalendarDiscoveryDiagnostics,
  canCreateVtodoCalendar: boolean,
): CalDAVSetupNotice | null => {
  if (diagnostics.includedCalendarCount > 0 || !canCreateVtodoCalendar) {
    return null;
  }

  const calendarList =
    diagnostics.nonVtodoCalendarNames.length > 0
      ? ` (${diagnostics.nonVtodoCalendarNames.join(', ')})`
      : '';
  const skippedCalendars =
    diagnostics.nonVtodoCalendarCount > 0
      ? `Chiri hat ${diagnostics.nonVtodoCalendarCount} Kalender übersprungen, die nur Termine enthalten${calendarList}.`
      : 'Chiri hat in diesem Konto keine Kalender gefunden.';

  return {
    title: 'Keine Aufgabenkalender gefunden',
    message: `${skippedCalendars} Das Konto kann trotzdem hinzugefügt werden, da Chiri überprüft hat, dass es VTODO-/Aufgabenkalender erstellen kann.`,
  };
};

export const probeSetupVtodoCreationIfNeeded = async (
  client: CalDAVClient,
  diagnostics: CalendarDiscoveryDiagnostics,
  enforceVapid = false,
  context?: HttpRequestContext,
) => {
  if (diagnostics.includedCalendarCount > 0) {
    return false;
  }

  try {
    await client.probeVtodoCalendarCreation(enforceVapid, context);
    return true;
  } catch (error) {
    const detail = getErrorMessage(error);
    if (detail.includes('could not clean up the temporary test calendar')) {
      throw error;
    }

    throw new Error(
      `VTODO calendar creation is not supported. Chiri connected to the account, but could not create a task calendar. ${detail}`,
    );
  }
};

export const toCalDAVSetupError = (
  title: string,
  error: unknown,
  hint?: string,
): CalDAVSetupError => {
  if (isErrorLike(error)) {
    return {
      title,
      message: stripHtmlTags(error.message),
      hint: hint ?? ('hint' in error && typeof error.hint === 'string' ? error.hint : undefined),
      detail: 'detail' in error && typeof error.detail === 'string' ? error.detail : undefined,
    };
  }

  const raw =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : String(error) || 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.';
  const cleaned = stripHtmlTags(raw);
  return {
    title,
    message: cleaned || 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.',
    hint,
  };
};
