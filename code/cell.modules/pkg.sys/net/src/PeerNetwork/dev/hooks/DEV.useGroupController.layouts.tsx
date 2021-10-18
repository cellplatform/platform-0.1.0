import React from 'react';
import { filter } from 'rxjs/operators';

import { rx, t } from '../common';
import {
  DevCrdtModel,
  DevScreensize,
  DevVideosPhysicsLayout,
  DevVideosGroupLayout,
  DevImagePasteboard,
  DevRemoteComponent,
} from '../layouts';

type O = Record<string, unknown>;

/**
 * Listen for requests for a view to display and load it into the environment.
 */
export function listen(args: {
  network$: t.Observable<t.DevEvent>;
  bus: t.EventBus<any>;
  netbus: t.PeerNetworkBus<any>;
}) {
  const { network$: $ } = args;
  const bus = args.bus as t.EventBus<t.DevEvent>;
  const netbus = args.netbus as t.PeerNetworkBus<t.DevEvent>;
  const layout$ = rx.payload<t.DevGroupLayoutEvent>($, 'DEV/group/layout');

  const layout = (kind: t.DevGroupLayout['kind'], factory?: (props?: O) => JSX.Element) => {
    layout$.pipe(filter((e) => e.kind === kind)).subscribe((e) => {
      const el = factory ? factory(e.props) : undefined;
      const target = e.target ?? 'fullscreen';
      bus.fire({ type: 'DEV/modal', payload: { el, target } });
    });
  };

  layout('cards'); // NB: Clear (reset).

  layout('crdt', (p) => <DevCrdtModel bus={bus} netbus={netbus} {...p} />);
  layout('screensize', (p) => <DevScreensize bus={bus} netbus={netbus} {...p} />);
  layout('video/physics', (p) => <DevVideosPhysicsLayout bus={bus} netbus={netbus} {...p} />);
  layout('video/group', (p) => <DevVideosGroupLayout bus={bus} netbus={netbus} {...p} />);
  layout('image/pasteboard', (p) => <DevImagePasteboard bus={bus} netbus={netbus} {...p} />);
  layout('remote/component', (p) => <DevRemoteComponent bus={bus} netbus={netbus} {...p} />);
}
