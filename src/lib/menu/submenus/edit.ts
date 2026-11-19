import { emit } from '@tauri-apps/api/event';
import { MenuItem, PredefinedMenuItem, Submenu } from '@tauri-apps/api/menu';
import { MENU_EVENTS } from '$constants/menu';
import { getAcceleratorOrDefault } from '$lib/menu/accelerators';
import { separator } from '$lib/menu/items';
import { isEnabledOutsideModal } from '$lib/menu/modal';
import type { KeyboardShortcut } from '$types/shortcuts';

/** selects the focused text field's contents when there is one, otherwise all tasks */
const selectAll = () => {
  const active = document.activeElement as HTMLElement | null;
  if (
    active &&
    (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)
  ) {
    if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) {
      active.select();
    } else {
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(active);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    return;
  }
  emit(MENU_EVENTS.SELECT_ALL);
};

export const createEditSubmenu = async ({
  shortcuts,
  isModalOpen,
}: {
  shortcuts?: KeyboardShortcut[];
  isModalOpen: boolean;
}) => {
  const isAppActionEnabled = (enabled = true) => isEnabledOutsideModal(isModalOpen, enabled);

  return Submenu.new({
    text: 'Bearbeiten',
    items: [
      await PredefinedMenuItem.new({
        text: 'Rückgängig',
        item: 'Undo',
      }),
      await PredefinedMenuItem.new({
        text: 'Wiederholen',
        item: 'Redo',
      }),
      await separator(),
      await PredefinedMenuItem.new({
        text: 'Ausschneiden',
        item: 'Cut',
      }),
      await PredefinedMenuItem.new({
        text: 'Kopieren',
        item: 'Copy',
      }),
      await PredefinedMenuItem.new({
        text: 'Einfügen',
        item: 'Paste',
      }),
      await MenuItem.new({
        id: 'select-all',
        text: 'Alles auswählen',
        accelerator: getAcceleratorOrDefault(shortcuts, 'select-all-tasks', 'CmdOrCtrl+A'),
        enabled: true,
        action: selectAll,
      }),
      await separator(),
      await MenuItem.new({
        id: 'search',
        text: 'Aufgaben suchen …',
        accelerator: getAcceleratorOrDefault(shortcuts, 'search', 'CmdOrCtrl+F'),
        enabled: isAppActionEnabled(),
        action: () => {
          emit(MENU_EVENTS.SEARCH);
        },
      }),
    ],
  });
};
