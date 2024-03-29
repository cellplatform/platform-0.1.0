import React from 'react';
import { filter } from 'rxjs/operators';

import { rx, t } from '../DEV.common';
import { DevImagePasteboard, DevScreensize, DevVideosGroupLayout } from '../DEV.layouts';

type O = Record<string, unknown>;

/**
 * Listen for requests for a view to display and load it into the environment.
 */
export function listen(args: {
  network$: t.Observable<t.DevEvent>;
  bus: t.EventBus<any>;
  netbus: t.PeerNetbus<any>;
}) {
  const { network$ } = args;
  const bus = args.bus as t.EventBus<t.DevEvent>;
  const netbus = args.netbus as t.PeerNetbus<t.DevEvent>;
  const layout$ = rx.payload<t.DevGroupLayoutEvent>(network$, 'DEV/group/layout');

  const layout = (kind: t.DevGroupLayout['kind'], factory?: (props?: O) => JSX.Element) => {
    layout$.pipe(filter((e) => e.kind === kind)).subscribe((e) => {
      const el = factory ? factory(e.props) : undefined;
      const target = e.target ?? 'fullscreen';
      bus.fire({ type: 'DEV/modal', payload: { el, target } });
    });
  };

  layout('cards'); // NB: Clear (reset).

  layout('screensize', (p) => <DevScreensize bus={bus} netbus={netbus} {...p} />);
  layout('video/group', (p) => <DevVideosGroupLayout bus={bus} netbus={netbus} {...p} />);
  layout('image/pasteboard', (p) => <DevImagePasteboard bus={bus} netbus={netbus} {...p} />);
}
