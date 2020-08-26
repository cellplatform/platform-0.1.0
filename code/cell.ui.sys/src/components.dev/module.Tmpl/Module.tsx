import * as React from 'react';

import { Module, t } from './common';

type P = t.TmplProps;

export const TmplModule: t.IModuleDef = {
  /**
   * ENTRY: Initialize a new module from the definition.
   */
  init(bus, parent) {
    const module = Module.create<P>({
      bus,
      root: { id: 'tmpl', props: { treeview: { label: 'Template' }, view: 'DEFAULT' } },
    });
    const until$ = module.dispose$;
    Module.register(bus, module, parent);

    const match: t.ModuleFilterEvent = (e) => e.module == module.id || module.contains(e.module);
    const event$ = Module.filter(bus.event$, match);
    const events = Module.events<P>(event$, until$);

    renderer(events);

    const fire = Module.fire<P>(bus);
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
function renderer(events: t.IViewModuleEvents<P>) {
  const render = events.render;

  render('DEFAULT').subscribe((e) => {
    const el = <div style={{ padding: 20 }}>Template</div>;
    e.render(el);
  });

  /**
   * Wildcard.
   */
  render('404').subscribe((e) => {
    const el = <div style={{ padding: 20 }}>Template (404)</div>;
    e.render(el);
  });
}
