import React from 'react';
import { filter } from 'rxjs/operators';

import { rx, t } from '../common';
import { DevCrdtModel, DevScreensize } from '../layouts';
import { DevVideosPhysicsLayout, DevVideosGroupLayout } from '../media';

/**
 * Listen for requests for a view to display and load it into the environment.
 */
export function listen(args: {
  network$: t.Observable<t.DevEvent>;
  bus: t.EventBus<any>;
  netbus: t.PeerBus<any>;
}) {
  const { network$: $ } = args;
  const bus = args.bus as t.EventBus<t.DevEvent>;
  const netbus = args.netbus as t.PeerBus<t.DevEvent>;
  const layout$ = rx.payload<t.DevGroupLayoutEvent>($, 'DEV/group/layout');

  const layout = (kind: t.DevGroupLayout['kind'], factory?: () => JSX.Element) => {
    layout$.pipe(filter((e) => e.kind === kind)).subscribe((e) => {
      const el = factory ? factory() : undefined;
      const target = e.target ?? 'fullscreen';
      bus.fire({ type: 'DEV/modal', payload: { el, target } });
    });
  };

  layout('cards'); // NB: Clear (reset).

  layout('crdt', () => <DevCrdtModel bus={bus} netbus={netbus} />);
  layout('screensize', () => <DevScreensize bus={bus} netbus={netbus} />);
  layout('video/physics', () => <DevVideosPhysicsLayout bus={bus} netbus={netbus} />);
  layout('video/group', () => <DevVideosGroupLayout bus={bus} netbus={netbus} />);
}
