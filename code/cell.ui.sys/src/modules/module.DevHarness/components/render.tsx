import * as React from 'react';
import { t } from '../common';
import { Host, IHostPropsOverride } from './Host';
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

  render('Host').subscribe((e) => {
    const data = e.data as IHostPropsOverride;
    e.render(<Host bus={bus} harness={harness} layout={data?.layout} />);
  });

  render('Null').subscribe((e) => {
    e.render(null); // NB: Used for clearing Frames that no longer contain content.
  });

  render('404').subscribe((e) => {
    e.render(<NotFound />);
  });
}
