import * as React from 'react';
import { t } from '../common';
import { Host } from './Host';
import { HostModule } from './Host.Module._TMP';
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

  render('Host/component').subscribe((e) => {
    e.render(<Host bus={bus} harness={harness} />);
  });

  render('Host/module/TMP').subscribe((e) => {
    e.render(<HostModule bus={bus} harness={harness} />);
  });

  render('Null').subscribe((e) => {
    e.render(null); // NB: Used for clearing Frames that no longer contain content.
  });

  render('404').subscribe((e) => {
    e.render(<NotFound />);
  });
}
