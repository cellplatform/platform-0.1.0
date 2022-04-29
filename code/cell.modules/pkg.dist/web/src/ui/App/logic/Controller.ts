import { Fullscreen, Json, t } from '../common';
import { AppEvents } from './Events';

export function AppController(args: { instance: t.AppInstance }) {
  const { instance } = args;
  const events = AppEvents({ instance });
  const fullscreen = Fullscreen.Events({ instance });

  /**
   * Enabled immutable JSON state controller.
   */
  Json.Bus.Controller({ instance, dispose$: events.dispose$ });

  /**
   * Monitor full-screen state.
   */
  fullscreen.changed.$.subscribe((e) => {
    events.state.patch((state) => (state.isFullscreen = e.isFullscreen));
  });

  /**
   * API
   */
  return events;
}
