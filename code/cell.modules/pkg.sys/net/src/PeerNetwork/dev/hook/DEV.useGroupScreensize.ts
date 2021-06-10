import React, { useEffect } from 'react';
import { Observable } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { rx, t, time, useResizeObserver } from '../common';
import { DevEvents } from '../event';

/**
 * Nonitor screensize events.
 */

export function useGroupScreensize(args: {
  ref: React.RefObject<HTMLElement>;
  bus: t.EventBus<any>;
  netbus: t.PeerNetworkBus<any>;
  kind: t.DevLayoutSize['kind'];
}) {
  const { ref, kind } = args;
  const local = args.bus as t.EventBus<t.DevEvent>;
  const network = args.netbus as t.PeerNetworkBus<t.DevEvent>;
  const self = network.self;
  const source = self;

  const resize = useResizeObserver(args.ref);

  useEffect(() => {
    const events = DevEvents(local);
    const parentResize$ = resize.$.pipe(
      takeUntil(events.dispose$),
      map((e) => undefined),
    );

    const controller = Boolean(kind) ? Controller({ ...args, parentResize$ }) : undefined;

    return () => {
      events.dispose();
      controller?.dispose();
    };
  }, [ref]); // eslint-disable-line

  return {};
}

/**
 * Controller
 */
export function Controller(args: {
  ref: React.RefObject<HTMLElement>;
  bus: t.EventBus<any>;
  netbus: t.PeerNetworkBus<any>;
  kind: t.DevLayoutSize['kind'];
  parentResize$: Observable<void>;
}) {
  const { ref, kind, parentResize$ } = args;
  const local = args.bus as t.EventBus<t.DevEvent>;
  const network = args.netbus as t.PeerNetworkBus<t.DevEvent>;
  const self = network.self;
  const source = self;

  const events = DevEvents(local);
  const local$ = events.$;
  const network$ = network.$.pipe(takeUntil(events.dispose$));
  const resize$ = args.parentResize$.pipe(takeUntil(events.dispose$));

  const getSize = () => {
    const width = ref.current?.offsetWidth ?? -1;
    const height = ref.current?.offsetHeight ?? -1;
    return { width, height };
  };

  const updateModel = async (
    peer: t.PeerId,
    kind: t.DevModelScreenSizeKind,
    size: { width: number; height: number },
  ) => {
    const model = await events.model.get();
    model.change((draft) => {
      const key = `${peer}:${kind}`;
      const updatedAt = time.now.timestamp;
      draft.group.screens[key] = { peer, kind, size, updatedAt };
    });
  };

  /**
   * INCOMING Listen for screen size changes from other peers.
   */
  rx.payload<t.DevLayoutSizeEvent>(network$, 'DEV/layout/size')
    .pipe(
      filter((e) => e.source !== source),
      filter((e) => Boolean(e.kind)),
    )
    .subscribe((e) => updateModel(e.source, e.kind, e.size));

  /**
   * OUTGOING Alert other peers when screen size changes.
   */
  resize$.pipe().subscribe(async (e) => {
    const size = getSize();
    await updateModel(self, kind, size);
    network.target.remote({
      type: 'DEV/layout/size',
      payload: { source, kind, size },
    });
  });

  return {
    dispose() {
      events.dispose();
    },
  };
}
