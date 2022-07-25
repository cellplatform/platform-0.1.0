import * as t from '@platform/types';
import { filter } from 'rxjs/operators';

import { instance } from './rx.bus.util';

/**
 * TODO 🐷
 * - move to Rx?
 * - {options} - dispose$ | t.Disposable
 */
export const Pump = {
  /**
   * Create a network pump using the given bus as the subject.
   */
  create<E extends t.Event = t.Event>(bus: t.EventBus<any>): t.EventPump<E> {
    return {
      id: instance(bus),
      in: (fn) => bus.$.pipe().subscribe(fn),
      out: (e) => bus.fire(e),
    };
  },

  /**
   * Connect a pump to a bus, streaming the pumped events two-way (in/out)
   * through the connected bus.
   */
  connect<E extends t.Event = t.Event>(pump: t.EventPump<E>) {
    return {
      to(bus: t.EventBus<any>) {
        if (instance(bus) === pump.id) {
          throw new Error(`Cannot connect bus "${pump.id}" to a pump containing itself`);
        }

        type T = { in?: E; out?: E };
        const ignore: T = {}; // NB: Prevent feedback loop.

        pump.in((e) => {
          if (e === ignore.out) return;
          ignore.in = e;
          bus.fire(e);
          ignore.in = undefined;
        });

        bus.$.pipe(filter((e) => e !== ignore.in)).subscribe((e) => {
          ignore.out = e;
          pump.out(e);
          ignore.out = undefined;
        });
      },
    };
  },
};
