import * as React from 'react';
import { Observable } from 'rxjs';

import { t, ui } from '../../../common';

const { Module } = ui;

export type FinderView = 'IMAGE';
export type FinderData = { foo?: string | number };
export type FinderProps = t.IModuleProps<FinderData, FinderView>;
export type FinderModule = t.IModule<FinderProps>;

type P = FinderProps;

export const FinderModule: t.IModuleDef = {
  initialize(bus, parent) {
    const module = Module.create<FinderProps>({ bus, treeview: 'Finder' });
    renderer({ bus, module, until$: module.dispose$ });
    Module.register(bus, module, parent);
  },
};

/**
 * [Helpers]
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
