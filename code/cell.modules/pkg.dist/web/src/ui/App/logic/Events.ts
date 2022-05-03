import { Json, t, rx, DEFAULT, Fullscreen, Vimeo, time } from '../common';

/**
 * Application
 */
export function AppEvents(args: {
  instance: t.AppInstance;
  dispose$?: t.Observable<any>;
}): t.AppEvents {
  const { instance } = args;
  const { dispose, dispose$ } = rx.disposable(args.dispose$);

  const state = Json.Bus.Events({ instance, dispose$ }).json<t.AppState>(DEFAULT.STATE);
  const fullscreen = Fullscreen.Events({ instance, dispose$ });
  const video = Vimeo.Events({ instance, dispose$ });

  return {
    instance: { bus: rx.bus.instance(instance.bus), id: instance.id },
    dispose,
    dispose$,
    state,

    /**
     * Handle login request.
     */
    async login() {
      /**
       * TODO 🐷 HACK
       * Note: this is not "real" security
       *       just a light shim to protect the context from the open web.
       */
      const isAuthorized = state.current.auth.token === DEFAULT.TOKEN;
      state.patch((state) => (state.auth.isOpen = isAuthorized));
      return isAuthorized;
    },

    /**
     * Enter of Exit fullscreen.
     */
    fullscreen(enter: boolean) {
      if (enter) fullscreen.enter.fire();
      if (!enter) fullscreen.exit.fire();
    },

    /**
     * Show Video
     */
    video: {
      show(video) {
        state.patch((state) => (state.video = video));
      },
      hide() {
        state.patch((state) => (state.video = undefined));
      },
      player: video,
    },
  };
}
