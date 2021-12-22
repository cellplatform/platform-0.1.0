import { filter, map } from 'rxjs/operators';

import { t } from '../common';

type O = Record<string, unknown>;

/**
 * Event API: Single document.
 */
export async function CrdtDocEvents<T extends O>(
  args: t.CrdtDocEventsArgs<T> & { events: t.CrdtEvents },
) {
  const { events } = args;

  const getCurrent = async () => {
    const res = await events.state.fire({ id: args.id, initial: args.initial });
    return res.doc.data;
  };
  let _current: T = await getCurrent();

  const changed$ = events.state.changed$.pipe(
    filter((e) => e.doc.id === args.id),
    map((e) => e as t.CrdtRefChanged<T>),
  );

  changed$.subscribe((e) => (_current = e.doc.next));

  const api: t.CrdtDocEvents<T> = {
    id: args.id,
    changed$,

    get current() {
      return _current;
    },

    async change(handler) {
      events.state.fire({ id: args.id, initial: args.initial, change: handler });
      return _current;
    },
  };

  return api;
}
