import { appLogDir } from '@tauri-apps/api/path';
import { openPath } from '@tauri-apps/plugin-opener';
import Check from 'lucide-react/icons/check';
import Copy from 'lucide-react/icons/copy';
import Download from 'lucide-react/icons/download';
import FolderÖffnen from 'lucide-react/icons/folder-open';
import RotateCcw from 'lucide-react/icons/rotate-ccw';
import Upload from 'lucide-react/icons/upload';
import { useEffect, useRef, useState } from 'react';
import { useConfirmDialog } from '$context/confirmDialogContext';
import { useSettingsStore } from '$context/settingsContext';
import { useDatabaseDeletion } from '$hooks/deletion/useDatabaseDeletion';
import { createDiagnosticsReport, createLogExport, getDatabaseDirectory } from '$lib/diagnostics';
import { setEditorÖffnen } from '$lib/store/ui';
import { exportSettingsToFile, importSettingsFromFile } from '$utils/settings';

interface DataSettingsProps {
  onClose: () => void;
  onRunOnboarding: () => void;
}

export const DataSettings = ({ onClose, onRunOnboarding }: DataSettingsProps) => {
  const { exportSettings, importSettings, resetSettings } = useSettingsStore();
  const { confirm, close } = useConfirmDialog();
  const { deleteLocalDatabase } = useDatabaseDeletion();
  const [diagnosticsMessage, setDiagnosticsMessage] = useState<string | null>(null);
  const [didCopyDiagnostics, setDidKopierenDiagnostics] = useState(false);
  const copyFeedbackTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyFeedbackTimeoutRef.current !== null) {
        window.clearTimeout(copyFeedbackTimeoutRef.current);
      }
    };
  }, []);

  const showCopyFeedback = () => {
    setDidKopierenDiagnostics(true);
    if (copyFeedbackTimeoutRef.current !== null) {
      window.clearTimeout(copyFeedbackTimeoutRef.current);
    }
    copyFeedbackTimeoutRef.current = window.setTimeout(() => {
      setDidKopierenDiagnostics(false);
      copyFeedbackTimeoutRef.current = null;
    }, 1400);
  };

  const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'Unbekannter Fehler';
  };

  const handleResetPreferences = async () => {
    const confirmed = await confirm({
      title: 'Einstellungen zurücksetzen',
      message: (
        <p>
          <span className="font-bold">Bist du sicher?</span> Dadurch werden alle persönlichen Einstellungen auf
          ihre Standardwerte zurückgesetzt.
        </p>
      ),
      confirmLabel: 'Einstellungen zurücksetzen',
      destructive: true,
    });

    close();
    if (confirmed) {
      // close the task editor if open
      setEditorÖffnen(false);
      // reset settings
      resetSettings();
      // close the settings modal (and any other modals)
      onClose();
    }
  };

  const handleResetDatabase = async () => {
    await deleteLocalDatabase();
  };

  const handleCopyDiagnostics = async () => {
    try {
      const report = await createDiagnosticsReport(exportSettings());
      await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
      showCopyFeedback();
    } catch (error) {
      setDiagnosticsMessage(`Diagnosebericht konnte nicht kopiert werden: ${getErrorMessage(error)}`);
    }
  };

  const handleExportDiagnostics = async () => {
    try {
      const report = await createDiagnosticsReport(exportSettings());
      await exportSettingsToFile(`${JSON.stringify(report, null, 2)}\n`, 'chiri-diagnostics.json');
      setDiagnosticsMessage('Diagnosebericht wurde exportiert.');
    } catch (error) {
      setDiagnosticsMessage(`Diagnosebericht konnte nicht exportiert werden: ${getErrorMessage(error)}`);
    }
  };

  const handleExportLogs = async () => {
    try {
      const logs = await createLogExport();
      await exportSettingsToFile(`${JSON.stringify(logs, null, 2)}\n`, 'chiri-logs.json');
      setDiagnosticsMessage('Protokolle wurden exportiert.');
    } catch (error) {
      setDiagnosticsMessage(`Protokolle konnten nicht exportiert werden: ${getErrorMessage(error)}`);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-base text-surface-800 dark:text-surface-200">
        Daten und Diagnose
      </h3>

      <div className="overflow-hidden rounded-lg border border-surface-300 bg-white dark:border-surface-700 dark:bg-surface-800">
        <div className="flex items-center justify-between gap-4 p-4">
          <div>
            <p className="text-sm text-surface-700 dark:text-surface-300">Einstellungen exportieren</p>
            <p className="text-surface-500 text-xs dark:text-surface-400">
              Einstellungen in einer Datei speichern
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
              const json = exportSettings();
              await exportSettingsToFile(json);
            }}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-surface-100 px-3 py-1.5 text-sm text-surface-700 outline-hidden transition-colors hover:bg-surface-200 focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset dark:bg-surface-700 dark:text-surface-300 dark:hover:bg-surface-600"
          >
            <Download className="h-4 w-4" />
            Exportieren
          </button>
        </div>

        <div className="border-surface-300 border-t dark:border-surface-700" />

        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm text-surface-700 dark:text-surface-300">Einstellungen importieren</p>
            <p className="text-surface-500 text-xs dark:text-surface-400">
              Einstellungen aus einer Sicherungsdatei wiederherstellen
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
              await importSettingsFromFile(importSettings);
            }}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-surface-100 px-3 py-1.5 text-sm text-surface-700 outline-hidden transition-colors hover:bg-surface-200 focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset dark:bg-surface-700 dark:text-surface-300 dark:hover:bg-surface-600"
          >
            <Upload className="h-4 w-4" />
            Importieren
          </button>
        </div>

        <div className="border-surface-300 border-t px-4 py-3 dark:border-surface-700">
          <p className="text-surface-500 text-xs dark:text-surface-500">
            Kontozugangsdaten und Aufgabendaten sind nicht enthalten.
          </p>
        </div>
      </div>

      <h4 className="font-semibold text-sm text-surface-700 dark:text-surface-300">Diagnostics</h4>

      <div className="overflow-hidden rounded-lg border border-surface-300 bg-white dark:border-surface-700 dark:bg-surface-800">
        <div className="flex items-center justify-between gap-4 p-4">
          <div className="min-w-0">
            <p className="text-sm text-surface-700 dark:text-surface-300">Diagnosebericht</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleCopyDiagnostics}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset ${
                didCopyDiagnostics
                  ? 'bg-primary-500 text-primary-contrast'
                  : 'bg-surface-100 text-surface-700 hover:bg-surface-200 dark:bg-surface-700 dark:text-surface-300 dark:hover:bg-surface-600'
              }`}
            >
              {didCopyDiagnostics ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {didCopyDiagnostics ? 'Kopiert' : 'Kopieren'}
            </button>
            <button
              type="button"
              onClick={handleExportDiagnostics}
              className="flex items-center gap-2 rounded-lg bg-surface-100 px-3 py-1.5 text-sm text-surface-700 outline-hidden transition-colors hover:bg-surface-200 focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset dark:bg-surface-700 dark:text-surface-300 dark:hover:bg-surface-600"
            >
              <Download className="h-4 w-4" />
              Exportieren
            </button>
          </div>
        </div>

        <div className="border-surface-300 border-t dark:border-surface-700" />

        <div className="flex items-center justify-between gap-4 p-4">
          <div className="min-w-0">
            <p className="text-sm text-surface-700 dark:text-surface-300">Protokollordner</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleExportLogs}
              className="flex items-center gap-2 rounded-lg bg-surface-100 px-3 py-1.5 text-sm text-surface-700 outline-hidden transition-colors hover:bg-surface-200 focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset dark:bg-surface-700 dark:text-surface-300 dark:hover:bg-surface-600"
            >
              <Download className="h-4 w-4" />
              Exportieren
            </button>
            <button
              type="button"
              onClick={async () => openPath(await appLogDir())}
              className="flex items-center gap-2 rounded-lg bg-surface-100 px-3 py-1.5 text-sm text-surface-700 outline-hidden transition-colors hover:bg-surface-200 focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset dark:bg-surface-700 dark:text-surface-300 dark:hover:bg-surface-600"
            >
              <FolderÖffnen className="h-4 w-4" />
              Öffnen
            </button>
          </div>
        </div>

        <div className="border-surface-300 border-t dark:border-surface-700" />

        <div className="flex items-center justify-between gap-4 p-4">
          <div className="min-w-0">
            <p className="text-sm text-surface-700 dark:text-surface-300">Lokaler Datenbankordner</p>
          </div>
          <button
            type="button"
            onClick={async () => openPath(await getDatabaseDirectory())}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-surface-100 px-3 py-1.5 text-sm text-surface-700 outline-hidden transition-colors hover:bg-surface-200 focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset dark:bg-surface-700 dark:text-surface-300 dark:hover:bg-surface-600"
          >
            <FolderÖffnen className="h-4 w-4" />
            Öffnen
          </button>
        </div>

        {diagnosticsMessage ? (
          <div className="border-surface-300 border-t px-4 py-3 dark:border-surface-700">
            <p className="text-surface-500 text-xs dark:text-surface-400">{diagnosticsMessage}</p>
          </div>
        ) : null}
      </div>

      <h4 className="font-semibold text-sm text-surface-700 dark:text-surface-300">Zurücksetzen</h4>

      <div className="overflow-hidden rounded-lg border border-surface-300 bg-white dark:border-surface-700 dark:bg-surface-800">
        <div className="flex items-center justify-between gap-4 p-4">
          <div>
            <p className="text-sm text-surface-700 dark:text-surface-300">Einrichtungsassistent erneut starten</p>
            <p className="text-surface-500 text-xs dark:text-surface-400">
              Einrichtung erneut durchlaufen, ohne Aufgaben oder Konten zu ändern
            </p>
          </div>
          <button
            type="button"
            onClick={onRunOnboarding}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-surface-100 px-3 py-1.5 text-sm text-surface-700 outline-hidden transition-colors hover:bg-surface-200 focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset dark:bg-surface-700 dark:text-surface-300 dark:hover:bg-surface-600"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Erneut starten
          </button>
        </div>

        <div className="border-surface-300 border-t dark:border-surface-700" />

        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm text-surface-700 dark:text-surface-300">Einstellungen zurücksetzen</p>
            <p className="text-surface-500 text-xs dark:text-surface-400">
              Alle Einstellungen auf ihre Standardwerte zurücksetzen
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetPreferences}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-surface-100 px-3 py-1.5 text-sm text-surface-700 outline-hidden transition-colors hover:bg-surface-200 focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset dark:bg-surface-700 dark:text-surface-300 dark:hover:bg-surface-600"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Zurücksetzen
          </button>
        </div>

        <div className="border-surface-300 border-t dark:border-surface-700" />

        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-semantic-error text-sm">Datenbank zurücksetzen</p>
            <p className="text-surface-500 text-xs dark:text-surface-400">
              Löscht alle lokal gespeicherten Daten. Nur als letzte Maßnahme verwenden.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetDatabase}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-semantic-error px-3 py-1.5 text-sm text-white outline-hidden transition-colors hover:opacity-90 focus-visible:ring-2 focus-visible:ring-surface-950 focus-visible:ring-inset dark:text-primary-contrast dark:focus-visible:ring-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Zurücksetzen
          </button>
        </div>
      </div>
    </div>
  );
};
