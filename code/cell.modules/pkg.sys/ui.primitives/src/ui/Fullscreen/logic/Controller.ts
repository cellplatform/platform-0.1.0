import { RefObject } from 'react';
import { t } from '../common';
import { FullscreenEvents } from './Events';
import { FullscreenAPI } from './API';

/**
 * Event controller for the Fullscreen API.
 */
export function FullscreenController<H extends HTMLElement = HTMLDivElement>(args: {
  ref: RefObject<H>;
  instance?: t.FullscreenInstance;
  dispose$?: t.Observable<void>;
}) {
  const { ref } = args;
  const events = FullscreenEvents(args);
  const instance = args.instance?.id ?? '';
  const api = FullscreenAPI({ ref });

  /**
   * ENTER fullscreen.
   */
  events.enter.req$.subscribe(async (e) => {
    const { tx } = e;

    const fire = (error?: string) => {
      events.fire({
        type: 'sys.ui.Fullscreen/enter:res',
        payload: { tx, instance, error },
      });
    };

    try {
      await api.enter();
      fire();
    } catch (err: any) {
      fire(err.message ?? 'Failed to enter fullscreen');
    }
  });

  /**
   * EXIT fullscreen.
   */
  events.exit.req$.subscribe(async (e) => {
    const { tx } = e;

    const fire = (error?: string) => {
      events.fire({
        type: 'sys.ui.Fullscreen/exit:res',
        payload: { tx, instance, error },
      });
    };

    try {
      api.exit();
      fire();
    } catch (err: any) {
      fire(err.message ?? 'Failed to exit fullscreen');
    }
  });

  return api;
}
