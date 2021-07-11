import { rx, t } from '../common';
import { WindowRef } from './types';

/**
 * Controller for creating new browser windows.
 */
export function WindowStatusController(args: {
  bus: t.EventBus<t.WindowEvent>;
  events: t.WindowEvents;
  getRefs: () => WindowRef[];
}) {
  const { events, bus, getRefs } = args;
  const $ = events.$;

  /**
   * Window status.
   */
  rx.payload<t.WindowStatusReqEvent>($, 'runtime.electron/Window/status:req')
    .pipe()
    .subscribe((e) => {
      const { tx } = e;
      const windows: t.WindowStatus[] = getRefs().map(({ id, uri, browser }) => {
        return {
          id,
          uri,
          url: browser.webContents.getURL(),
          title: browser.getTitle(),
          bounds: browser.getBounds(),
          isVisible: browser.isVisible(),
        };
      });
      bus.fire({
        type: 'runtime.electron/Window/status:res',
        payload: { tx, windows },
      });
    });

  return {};
}
