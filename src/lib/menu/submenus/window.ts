import { PredefinedMenuItem, Submenu } from '@tauri-apps/api/menu';
import { separator } from '$lib/menu/items';

export const createWindowSubmenu = async () =>
  Submenu.new({
    text: 'Fenster',
    items: [
      await PredefinedMenuItem.new({
        text: 'Minimieren',
        item: 'Minimize',
      }),
      await PredefinedMenuItem.new({
        text: 'Zoomen',
        item: 'Maximize',
      }),
      await separator(),
      await PredefinedMenuItem.new({
        text: 'Alle in den Vordergrund',
        item: 'BringAllToFront',
      }),
    ],
  });
