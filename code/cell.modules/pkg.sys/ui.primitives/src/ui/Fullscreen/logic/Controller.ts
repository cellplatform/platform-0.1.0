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

  const toStatus = (): t.FullscreenStatus => {
    const isFullscreen = api.isFullscreen;
    const element = ref.current as HTMLElement;
    return { element, isFullscreen };
  };

  /**
   * Document Handler
   */
  const onFullscreenChange = (e: Event) => {
    if (e.target === ref.current) {
      events.changed.fire(api.isFullscreen);
    }
  };
  document.addEventListener('fullscreenchange', onFullscreenChange);
  events.dispose$.subscribe(() =>
    document.removeEventListener('fullscreenchange', onFullscreenChange),
  );

  /**
   * STATUS
   */
  events.status.req$.subscribe((e) => {
    const { tx } = e;
    const status = toStatus();
    events.fire({
      type: 'sys.ui.Fullscreen/Status:res',
      payload: { instance, tx, status },
    });
  });

  /**
   * ENTER fullscreen.
   */
  events.enter.req$.subscribe(async (e) => {
    const { tx } = e;

    const fire = (error?: string) => {
      events.fire({
        type: 'sys.ui.Fullscreen/Enter:res',
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
        type: 'sys.ui.Fullscreen/Exit:res',
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
