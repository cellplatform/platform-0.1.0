import * as t from '@platform/types';
import { filter, takeUntil } from 'rxjs/operators';
import { Observable } from './rx';

import { instance, isBus } from './rx.bus.util';
import { disposable } from './rx.disposable';

/**
 * TODO 🐷
 * - filter
 * - Ctx
 */
export const Pump = {
  /**
   * Create a network pump using the given bus as the subject.
   */
  create<E extends t.Event = t.Event>(bus: t.EventBus<any>): t.EventPump<E> {
    if (!isBus(bus)) {
      throw new Error('Input not a valid event-bus');
    }
    return {
      id: Util.asPumpId(bus),
      in: (fn) => bus.$.pipe().subscribe(fn),
      out: (e) => bus.fire(e),
    };
  },

  /**
   * Connect a pump to a bus, streaming the pumped events two-way (in/out)
   * through the connected bus.
   */
  connect<E extends t.Event = t.Event>(
    pump: t.EventPump<E>,
    options: { dispose$?: Observable<any> } = {},
  ) {
    const { dispose, dispose$ } = disposable(options.dispose$);
    dispose$.subscribe(() => (connection.alive = false));

    const connection = {
      alive: true,
      dispose,
      dispose$,

      /**
       * Connect the pump to the given event-bus.
       */
      to(bus: t.EventBus<any>) {
        if (Util.asPumpId(bus) === pump.id) {
          const msg = `Cannot connect event-bus "${instance(bus)}" to a pump containing itself`;
          throw new Error(msg);
        }

        type T = { in?: E; out?: E };
        const ignore: T = {}; // NB: Prevent feedback loop.

        pump.in((e) => {
          if (e === ignore.out || !connection.alive) return;
          ignore.in = e;
          bus.fire(e);
          ignore.in = undefined;
        });

        bus.$.pipe(
          takeUntil(dispose$),
          filter((e) => e !== ignore.in),
        ).subscribe((e) => {
          ignore.out = e;
          pump.out(e);
          ignore.out = undefined;
        });

        return connection;
      },
    };

    return connection;
  },
};

/**
 * Helpers
 */

const Util = {
  asPumpId: (bus: t.EventBus) => `pump:${instance(bus)}`,
};
