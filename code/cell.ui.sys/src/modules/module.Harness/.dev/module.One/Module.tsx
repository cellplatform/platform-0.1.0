import * as React from 'react';

import { Module, t } from './common';
import { Dev } from '../..';

type P = t.OneProps;

export const OneModule: t.SampleOneModuleDef = {
  /**
   * ENTRY: Initialize a new module from the definition.
   */
  init(bus) {
    const module = Module.create<P>({
      bus,
      root: { id: '', props: { treeview: { label: 'One' }, view: 'DEFAULT' } },
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
    const dev = Dev(bus, 'One');

    dev.component('one').render((e) => <div style={{ padding: 30 }}>hello one</div>);

    dev
      .component('two')
      .width(350)
      .height(250)
      .render((e) => <div style={{ padding: 30 }}>hello two</div>);

    dev.component('leaf').render((e) => {
      const url = 'https://tdb.sfo2.digitaloceanspaces.com/tmp/leaf.png';
      return <img src={url} />;
    });

    return dev.module;
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
