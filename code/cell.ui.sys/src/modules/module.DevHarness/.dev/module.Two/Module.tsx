import * as React from 'react';

import { Module, t } from './common';

type P = t.TwoProps;

export const TwoModule: t.TwoModuleDef = {
  /**
   * ENTRY: Initialize a new module from the definition.
   */
  init(bus, parent) {
    const module = Module.create<P>({
      bus,
      root: { id: '', props: { treeview: { label: 'Two' }, view: 'DEFAULT', target: 'ROOT' } },
    });

    /**
     * Setup event pub/sub.
     */
    const match: t.ModuleFilterEvent = (e) => e.module == module.id || module.contains(e.module);
    const events = Module.events<P>(Module.filter(bus.event$, match), module.dispose$);
    const fire = Module.fire<P>(bus);

    /**
     * STRATEGY: render user-interface.
     */
    renderer(events);
    events.selection$.subscribe((e) => {
      const { view, data } = e;
      fire.render({ module, data, view, notFound: '404' });
    });

    return module;
  },
};

/**
 * UI: View factory for the module.
 */
function renderer(events: t.IViewModuleEvents<P>) {
  const render = events.render;

  render('DEFAULT').subscribe((e) => {
    const el = <div style={{ padding: 20 }}>Module Two</div>;
    e.render(el);
  });

  /**
   * Wildcard.
   */
  render('404').subscribe((e) => {
    const el = <div style={{ padding: 20 }}>Module Two (404)</div>;
    e.render(el);
  });
}
