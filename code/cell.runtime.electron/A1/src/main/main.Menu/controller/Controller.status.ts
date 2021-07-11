import { slug, t } from '../common';

export function StatusController(args: {
  bus: t.EventBus<t.MenuEvent>;
  events: t.MenuEvents;
  ref: { current: t.Menu };
}) {
  const { bus, events, ref } = args;

  events.status.req$.subscribe((e) => {
    const { tx = slug() } = e;

    const done = (args: { menu?: t.Menu; error?: string }) => {
      const { menu = [], error } = args;
      bus.fire({
        type: 'runtime.electron/Menu/status:res',
        payload: { tx, menu, error },
      });
    };

    try {
      done({ menu: ref.current });
    } catch (err) {
      const error = `Failed while retrieving menu status. ${err.message}`;
      done({ error }); // Failure.
    }
  });
}
