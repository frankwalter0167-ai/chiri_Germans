import { useEffect, useState } from 'react';
import { toastManager } from '$lib/toast-manager';
import {
  installAppImageDesktopIntegration,
  isAppImageDesktopIntegrationNeeded,
  skipAppImageDesktopIntegration,
} from '$utils/platform';

export const useAppImageIntegration = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIntegrating, setIsIntegrating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    isAppImageDesktopIntegrationNeeded().then((needed) => {
      if (!cancelled) {
        setShowPrompt(needed);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const integrate = async () => {
    setIsIntegrating(true);
    setError(null);
    const success = await installAppImageDesktopIntegration();
    setIsIntegrating(false);
    if (success) {
      setShowPrompt(false);
      setError(null);
      toastManager.success(
        'Chiri wurde zum Anwendungsmenü hinzugefügt',
        'Du kannst Chiri beim nächsten Mal von dort aus starten.',
        { groupKey: 'appimage-integration-success' },
      );
    } else {
      setError('Die Desktop-Integration konnte nicht installiert werden. Du kannst es später erneut in den Einstellungen versuchen.');
    }
  };

  const skip = async () => {
    await skipAppImageDesktopIntegration();
    setShowPrompt(false);
    setError(null);
    toastManager.info(
      'Du kannst Chiri später zum Anwendungsmenü hinzufügen',
      'Öffne dazu Einstellungen → Start und Fenster, wenn du so weit bist.',
      { groupKey: 'appimage-integration-skip' },
    );
  };

  return {
    showPrompt,
    isIntegrating,
    error,
    integrate,
    skip,
  };
};
