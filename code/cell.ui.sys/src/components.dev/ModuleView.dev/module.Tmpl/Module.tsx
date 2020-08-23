import * as React from 'react';
import { Observable } from 'rxjs';

import { Module } from '../common';
import * as t from './types';

type P = t.DebugProps;

export const DebugModule: t.IModuleDef = {
  /**
   * ENTRY: Initialize a new module from the definition.
   */
  init(bus, parent) {
    const fire = Module.fire<P>(bus);
    const module = Module.create<P>({ bus, treeview: 'Debug', view: 'DEFAULT' });
    const until$ = module.dispose$;
    Module.register(bus, module, parent);

    const match: t.ModuleFilterEvent = (e) => e.module == module.id || module.contains(e.module);
    renderer({ bus, until$, filter: match });

    const events = Module.events<P>(bus.event$, until$).filter(match);
    events.selection$.subscribe((e) => {
      const { view, data } = e;
      const selected = e.selection?.id;
      fire.render({ selected, module, data, view, notFound: '404' });
    });

    return module;
  },
};

/**
 * UI: View factory for the module.
 */
function renderer(args: {
  bus: t.EventBus<any>;
  until$: Observable<any>;
  filter: t.ModuleFilterEvent;
}) {
  const { bus, until$ } = args;
  const event = Module.events<P>(bus.event$, until$).filter(args.filter);
  const render = event.render;

  render('DEFAULT').subscribe((e) => {
    const el = <div style={{ padding: 20 }}>Debug Module</div>;
    e.render(el);
  });

  /**
   * Wildcard.
   */
  render('404').subscribe((e) => {
    const el = <div style={{ padding: 20 }}>Debug (404)</div>;
    e.render(el);
  });
}
