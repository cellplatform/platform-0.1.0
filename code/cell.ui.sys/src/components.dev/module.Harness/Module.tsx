import * as React from 'react';
import { filter, map, takeUntil } from 'rxjs/operators';

import { Module, rx } from './common';
import { Main } from './components/Main';
import { renderer } from './Module.render';
import * as t from './types';

type P = t.HarnessProps;

export const HarnessModule: t.HarnessModuleDef = {
  Main: (props) => <Main {...props} />, // eslint-disable-line

  /**
   * ENTRY: Initialize a new module from the definition.
   */
  init(bus) {
    const module = Module.create<P>({
      bus,
      root: { id: 'harness', props: { treeview: { label: 'Development' }, view: 'DEFAULT' } },
    });
    Module.register(bus, module);

    /**
     * Setup event pub/sub.
     */
    const match: t.ModuleFilterEvent = (e) => e.module == module.id || module.contains(e.module);
    const events = Module.events<P>(Module.filter(bus.event$, match), module.dispose$);
    const fire = Module.fire<P>(bus);

    /**
     * STRATEGY: render user-interface.
     */
    renderer({ bus, events });
    events.selection$.subscribe((e) => {
      const { view, data } = e;
      const selected = e.selection?.id;
      fire.render({ selected, module, data, view, notFound: '404' });
    });

    /**
     * TODO 🐷
     */

    //  bus.fire({})
    strategy({ module, bus: bus.type<t.HarnessEvent>() });

    /**
     *
     */

    return module;
  },
};

export function strategy(args: { module: t.HarnessModule; bus: t.EventBus<t.HarnessEvent> }) {
  const { module, bus } = args;

  const event$ = bus.event$.pipe(
    takeUntil(module.dispose$),
    map((e) => e as t.HarnessEvent),
  );

  const fire = Module.fire<t.HarnessProps>(bus);

  // rx.

  rx.payload<t.IHarnessAddEvent>(event$, 'Harness/add').subscribe((e) => {
    console.log('e add:', e);

    const res = fire.request(e.module);

    // console.log('module', module);

    if (res.module) {
      Module.register(bus, res.module, module.id);
    }
  });
}
