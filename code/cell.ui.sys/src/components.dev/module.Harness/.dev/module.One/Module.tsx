import * as React from 'react';

import { Module, t } from './common';

type P = t.OneProps;

export const OneModule: t.SampleOneModuleDef = {
  /**
   * ENTRY: Initialize a new module from the definition.
   */
  init(bus, parent) {
    const module = Module.create<P>({
      bus,
      root: { id: '', props: { treeview: { label: 'Sample One' }, view: 'DEFAULT' } },
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

  /**
   * DEV: harness entry point.
   */
  dev(bus) {
    const dev = Module.create<t.DevProps>({
      bus,
      root: { id: '', props: { treeview: { label: 'Sample One (Dev)' } } },
    });

    const node = (id: string, view?: t.OneView) => {
      const host: t.HarnessHost = { view: view || '', layout: { location: 'yo' } };
      const props: t.DevProps = {
        view: 'HOST/component',
        data: { host },
      };
      return { id, props };
    };

    dev.change((draft, ctx) => {
      const children = draft.children || (draft.children = []);
      children.push(node('123', 'FOO'), node('456'), node('789', '404'));
    });

    const match: t.ModuleFilterEvent = (e) => e.module == dev.id;
    const events = Module.events<P>(Module.filter(bus.event$, match), dev.dispose$);
    renderer(events);

    return dev;
  },
};

/**
 * UI: View factory for the module.
 */
function renderer(events: t.IViewModuleEvents<P>) {
  const render = events.render;

  render('DEFAULT').subscribe((e) => {
    const el = <div style={{ padding: 20 }}>Module One</div>;
    e.render(el);
  });

  render('FOO').subscribe((e) => {
    const el = <div style={{ padding: 20 }}>FOO</div>;
    e.render(el);
  });

  /**
   * Wildcard.
   */
  render('404').subscribe((e) => {
    const el = <div style={{ padding: 20 }}>Module One (404)</div>;
    e.render(el);
  });
}
