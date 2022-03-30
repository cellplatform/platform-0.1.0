import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import * as k from '../NetworkCard/types';
import { DevVideoCard } from './DEV.Card.Video';
import { css, LocalPeerCard, rx, t, PeerNetwork, CmdBar } from './DEV.common';

/**
 * Hooks
 */
export function useController(args: {
  instance: t.Id;
  network: t.PeerNetwork;
  defaultChild?: JSX.Element;
}) {
  const { network, instance, defaultChild } = args;
  const [child, setChild] = useState<undefined | JSX.Element>(defaultChild);

  /**
   * Lifecycle.
   */
  useEffect(() => {
    const { netbus } = network;
    const commandBar = CmdBar.Events({ instance: { bus: network.bus, id: instance } });

    const dispose$ = new Subject<void>();
    const dispose = () => {
      dispose$.next();
      Strategy.peer.dispose();
      commandBar.dispose();
    };

    const bus = rx.busAsType<k.NetworkCardEvent>(network.bus);
    const $ = bus.$.pipe(
      takeUntil(dispose$),
      filter((e) => e.payload.instance === instance),
    );

    /**
     * Manage behavioral strategies.
     * NOTE:
     *    Insert behavior strategies into the pipeline here.
     */
    const Strategy = {
      peer: PeerNetwork.PeerStrategy({ bus, netbus }),
      // group: PeerNetwork.GroupStrategy({ bus, netbus }),
    };

    /**
     * Event handlers
     * (with a UI render factory as an example plugin entry point).
     */
    const styles = {
      child: css({ flex: 1 }),
    };

    rx.payload<k.NetworkCardPeerClickEvent>($, 'sys.net/ui.NetworkCard/PeerClick')
      .pipe(filter((e) => Boolean(e.media)))
      .subscribe((e) => {
        setChild(
          <DevVideoCard
            instance={instance}
            network={network}
            style={styles.child}
            stream={e.media}
          />,
        );
      });

    rx.payload<k.NetworkCardCloseChildEvent>($, 'sys.net/ui.NetworkCard/CloseChild')
      .pipe()
      .subscribe((e) => setChild(defaultChild));

    /**
     * List for actions from the [CommandBar] textbox.
     */
    commandBar.action.$.subscribe((e) => {
      /**
       * TODO 🐷
       * - parse and interpret the command text.
       */
      const remote = e.text;

      const self = network.self;
      const isReliable = true;
      const autoStartVideo = true;
      return LocalPeerCard.connect({ bus, remote, self, isReliable, autoStartVideo });
    });

    return () => dispose();
  }, [network, instance, defaultChild]);

  return { child };
}
