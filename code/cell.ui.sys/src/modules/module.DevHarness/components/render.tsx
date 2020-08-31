import * as React from 'react';
import { t } from '../common';
import { HostComponent } from './Host.Component';
import { HostModule } from './Host.Module';
import { NotFound } from './NotFound';

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
    e.render(<HostComponent bus={bus} harness={harness} />);
  });

  render('HOST/module').subscribe((e) => {
    e.render(<HostModule bus={bus} harness={harness} />);
  });

  render('404').subscribe((e) => {
    e.render(<NotFound />);
  });
}
