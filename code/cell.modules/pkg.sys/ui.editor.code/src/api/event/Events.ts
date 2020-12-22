import { Subject } from 'rxjs';
import { filter, share, takeUntil, map } from 'rxjs/operators';

import { rx, t, Is } from '../../common';
import { Fire } from './Events.fire';
import { InstanceEvents } from './Instance.Events';

const create: t.CodeEditorEventsFactory = (input) => {
  const bus = rx.bus<t.CodeEditorEvent>(input);
  const dispose$ = new Subject<void>();

  const $ = bus.event$.pipe(
    takeUntil(dispose$),
    filter((e) => Is.editorEvent(e)),
    share(),
  );

  const singleton$ = $.pipe(
    filter((e) => Is.singletonEvent(e)),
    map((e) => e as t.CodeEditorSingletonEvent),
  );

  const instance$ = $.pipe(
    filter((e) => Is.instanceEvent(e)),
    map((e) => e as t.CodeEditorInstanceEvent),
  );

  const api: t.CodeEditorEvents = {
    $,
    dispose$: dispose$.asObservable(),
    singleton$,
    instance$,
    fire: Fire(bus),

    instance(id) {
      return InstanceEvents.create(bus, id);
    },

    dispose() {
      dispose$.next();
      dispose$.complete();
    },
  };

  return api;
};

export const Events = { create };
