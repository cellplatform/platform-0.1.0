import * as React from 'react';
import { Observable } from 'rxjs';

import { Module } from '../common';
import * as t from './types';

type P = t.DebugProps;

export const DebugModule: t.IModuleDef = {
  /**
   * Initialize the module.
   */
  init(bus, parent) {
    const module = Module.create<P>({ bus, treeview: 'Debug' });
    const until$ = module.dispose$;
    renderer({ bus, module, until$ });
    Module.register(bus, module, parent);
    return module;
  },
};

/**
 * View factory for the module.
 */
function renderer(args: { bus: t.EventBus<any>; module: t.IModule; until$: Observable<any> }) {
  const { bus, module, until$ } = args;
  const event = Module.events<P>(bus.event$, until$).filter((e) => e.module === module.id);

  /**
   * Wildcard.
   */
  event.render().subscribe((e) => {
    const el = <div style={{ padding: 20 }}>Debug Module</div>;
    e.render(el);
  });
}
