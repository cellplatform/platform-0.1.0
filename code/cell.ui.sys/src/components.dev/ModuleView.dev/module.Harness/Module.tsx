import * as React from 'react';

import { Module } from '../common';
import * as t from './types';
import { renderer } from './Module.render';
import { Main } from './components/Main';

type P = t.HarnessProps;

export const HarnessModule: t.HarnessModuleDef = {
  Main: (props) => <Main {...props} />, // eslint-disable-line

  /**
   * ENTRY: Initialize a new module from the definition.
   */
  init(bus, parent) {
    const module = Module.create<P>({
      bus,
      root: { id: 'harness', props: { treeview: { label: 'Development' }, view: 'DEFAULT' } },
    });
    const until$ = module.dispose$;
    Module.register(bus, module, parent);

    const match: t.ModuleFilterEvent = (e) => e.module == module.id || module.contains(e.module);
    const event$ = Module.filter(bus.event$, match);
    const events = Module.events<P>(event$, until$);

    renderer({ bus, events });

    const fire = Module.fire<P>(bus);
    events.selection$.subscribe((e) => {
      const { view, data } = e;
      const selected = e.selection?.id;
      fire.render({ selected, module, data, view, notFound: '404' });
    });

    return module;
  },
};
