import * as React from 'react';
import { Observable } from 'rxjs';

import { t, Module } from '../common';

export type FinderView = 'IMAGE';
export type FinderData = { foo?: string | number };
export type FinderProps = t.IModuleProps<FinderData, FinderView>;
export type FinderModule = t.IModule<FinderProps>;

type P = FinderProps;

export const FinderModule: t.IModuleDef = {
  /**
   * Initialize the module.
   */
  init(bus, parent) {
    const module = Module.create<P>({ bus, treeview: 'Finder' });
    renderer({ bus, module, until$: module.dispose$ });
    Module.register(bus, module, parent);
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
    const el = <div>Finder</div>;
    e.render(el);
  });
}
