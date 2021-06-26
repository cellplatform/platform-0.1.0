import { rx, t } from '../common';
import { WindowRef } from './types';

/**
 * Controller for changing the state of windows.
 */
export function WindowChangeController(args: {
  bus: t.EventBus<t.WindowEvent>;
  events: t.WindowEvents;
  getRefs: () => WindowRef[];
}) {
  const { events, getRefs } = args;
  const $ = events.$;

  /**
   * Window change requests (eg, move, resize).
   */
  rx.payload<t.WindowChangeEvent>($, 'runtime.electron/Window/change')
    .pipe()
    .subscribe((e) => {
      const browser = getRefs().find((ref) => ref.uri === e.uri)?.browser;
      if (!browser) return;

      if (e.bounds) {
        const { x, y, width, height } = e.bounds;
        const current = browser.getBounds();
        browser.setBounds({
          x: x ?? current.x,
          y: y ?? current.y,
          width: width ?? current.width,
          height: height ?? current.height,
        });
      }

      if (typeof e.isVisible === 'boolean') {
        if (e.isVisible && !browser.isVisible()) browser.show();
        if (!e.isVisible && browser.isVisible()) browser.hide();
      }
    });

  return {};
}
