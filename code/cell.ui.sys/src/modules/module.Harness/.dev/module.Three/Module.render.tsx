import * as React from 'react';

import { Module, t } from './common';
import { Root } from './components/Root';
import { Foo } from './components/Foo';

type P = t.ThreeProps;

/**
 * UI: View factory for the module.
 */
export function renderer(args: {
  module: t.ThreeModule;
  bus: t.EventBus;
  events: t.IViewModuleEvents<P>;
}) {
  const { events, bus, module } = args;
  const render = events.render;

  const Provider = Module.provider<t.ThreeContext>({ bus, module });

  render('DEFAULT').subscribe((e) => {
    const el = (
      <Provider>
        <Root />
      </Provider>
    );
    e.render(el);
  });

  render('FOO').subscribe((e) => {
    const el = <Foo title={e.data?.title} style={{ flex: 1 }} />;
    e.render(el);
  });

  /**
   * Wildcard.
   */
  render('404').subscribe((e) => {
    const el = <div style={{ padding: 20 }}>Module Three (404)</div>;
    e.render(el);
  });
}
