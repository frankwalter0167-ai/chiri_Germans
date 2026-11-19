import { emit } from '@tauri-apps/api/event';
import { MenuItem, PredefinedMenuItem, Submenu } from '@tauri-apps/api/menu';
import { MENU_EVENTS } from '$constants/menu';
import { getAcceleratorOrDefault } from '$lib/menu/accelerators';
import { separator } from '$lib/menu/items';
import { isEnabledOutsideModal } from '$lib/menu/modal';
import type { KeyboardShortcut } from '$types/shortcuts';

export const createAppSubmenu = async ({
  shortcuts,
  isModalOpen,
}: {
  shortcuts?: KeyboardShortcut[];
  isModalOpen: boolean;
}) => {
  const isAppActionEnabled = (enabled = true) => isEnabledOutsideModal(isModalOpen, enabled);

  return Submenu.new({
    text: 'Chiri',
    items: [
      await MenuItem.new({
        id: 'about',
        text: 'Über Chiri',
        enabled: isAppActionEnabled(),
        action: () => {
          emit(MENU_EVENTS.ABOUT);
        },
      }),
      await separator(),
      await MenuItem.new({
        id: 'preferences',
        text: 'Einstellungen …',
        accelerator: getAcceleratorOrDefault(shortcuts, 'settings', 'CmdOrCtrl+,'),
        enabled: isAppActionEnabled(),
        action: () => {
          emit(MENU_EVENTS.PREFERENCES);
        },
      }),
      await separator(),
      await PredefinedMenuItem.new({
        text: 'Dienste',
        item: 'Services',
      }),
      await separator(),
      await PredefinedMenuItem.new({
        text: 'Chiri ausblenden',
        item: 'Hide',
      }),
      await PredefinedMenuItem.new({
        text: 'Andere ausblenden',
        item: 'HideOthers',
      }),
      await PredefinedMenuItem.new({
        text: 'Alle einblenden',
        item: 'ShowAll',
      }),
      await separator(),
      await MenuItem.new({
        id: 'quit',
        text: 'Chiri beenden',
        accelerator: 'CmdOrCtrl+Q',
        action: () => {
          emit(MENU_EVENTS.QUIT_MENU);
        },
      }),
    ],
  });
};
