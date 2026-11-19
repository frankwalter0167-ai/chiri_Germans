import { useCallback } from 'react';
import { useConfirmDialog } from '$context/confirmDialogContext';
import { deleteDatabase } from '$lib/bootstrap';

export const useDatabaseDeletion = () => {
  const { confirm, close } = useConfirmDialog();

  const deleteLocalDatabase = useCallback(async () => {
    const confirmed = await confirm({
      title: 'Datenbank zurücksetzen',
      message: (
        <div className="space-y-2">
          <p>
            <span className="font-bold">Bist du sicher?</span> Die Daten auf deinen
            CalDAV-Servern bleiben davon unberührt. Die lokalen Daten gehen jedoch verloren und die Konten müssen erneut eingerichtet werden.
          </p>
          <p className="text-semantic-warning text-sm">
            Nicht empfohlen, es sei denn, es treten Probleme auf oder du möchtest ganz von vorn beginnen.
          </p>
        </div>
      ),
      confirmLabel: 'Datenbank zurücksetzen',
      destructive: true,
      delayConfirmSeconds: 5,
    });

    close();
    if (!confirmed) return false;

    await deleteDatabase();
    return true;
  }, [close, confirm]);

  return { deleteLocalDatabase };
};
