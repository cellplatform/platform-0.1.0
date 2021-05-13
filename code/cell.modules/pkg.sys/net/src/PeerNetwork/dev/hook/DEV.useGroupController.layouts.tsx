import React from 'react';
import { filter } from 'rxjs/operators';

import { rx, t } from '../common';
import { DevCrdtModel, DevScreensize } from '../layouts';
import { DevVideosLayout } from '../media';

/**
 * Listen for requests for a view to display and load it into the environment.
 */
export function listen(args: {
  network$: t.Observable<t.DevEvent>;
  bus: t.EventBus<any>;
  netbus: t.NetBus<any>;
}) {
  const { network$: $ } = args;
  const bus = args.bus.type<t.DevEvent>();
  const netbus = args.netbus.type<t.DevEvent>();
  const layout$ = rx.payload<t.DevGroupLayoutEvent>($, 'DEV/group/layout');

  const layout = (kind: t.DevGroupLayout['kind'], factory?: () => JSX.Element) => {
    layout$.pipe(filter((e) => e.kind === kind)).subscribe((e) => {
      const el = factory ? factory() : undefined;
      const target = e.target ?? 'fullscreen';
      bus.fire({ type: 'DEV/modal', payload: { el, target } });
    });
  };

  layout('cards'); // NB: Clear
  layout('videos', () => <DevVideosLayout bus={bus} netbus={netbus} />);
  layout('crdt', () => <DevCrdtModel bus={bus} netbus={netbus} />);
  layout('screensize', () => <DevScreensize bus={bus} netbus={netbus} />);
}
