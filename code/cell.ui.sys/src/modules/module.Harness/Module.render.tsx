import * as React from 'react';
import * as t from './types';
import { HostComponent, HostModule } from './components/Host';

type P = t.HarnessProps;

/**
 * UI: View factory for the module.
 */
export function renderer(args: {
  harness: t.HarnessModule;
  bus: t.EventBus<any>;
  events: t.IViewModuleEvents<P>;
}) {
  const { events, bus, harness } = args;
  const render = events.render;

  render('HOST/component').subscribe((e) => {
    const el = <HostComponent bus={bus} harness={harness} />;
    e.render(el);
  });

  render('HOST/module').subscribe((e) => {
    const el = <HostModule bus={bus} harness={harness} />;
    e.render(el);
  });

  /**
   * Wildcard.
   */
  render('404').subscribe((e) => {
    const el = <div style={{ padding: 10 }}>Harness (404)</div>;
    e.render(el);
  });
}
