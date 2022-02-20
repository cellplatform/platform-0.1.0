import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import * as k from '../NetworkCard/types';
import { DevVideoCard } from './DEV.Card.Video';
import { css, LocalPeerCard, rx, t } from './DEV.common';

/**
 * Hooks
 */
export function useController(args: { instance: t.InstanceId; network: t.PeerNetwork }) {
  const { network, instance } = args;
  const [child, setChild] = useState<undefined | JSX.Element>();

  useEffect(() => {
    const dispose$ = new Subject<void>();
    const bus = rx.busAsType<k.NetworkCardEvent>(network.bus);
    const $ = bus.$.pipe(
      takeUntil(dispose$),
      filter((e) => e.payload.instance === instance),
    );

    const styles = {
      child: css({ flex: 1 }),
    };

    rx.payload<k.NetworkCardPeerClickEvent>($, 'sys.net/ui.NetworkCard/PeerClick')
      .pipe()
      .subscribe((e) => {
        if (e.media) {
          setChild(
            <DevVideoCard
              instance={instance}
              network={network}
              style={styles.child}
              stream={e.media}
            />,
          );
        }
      });

    rx.payload<k.NetworkCardCloseChildEvent>($, 'sys.net/ui.NetworkCard/CloseChild')
      .pipe()
      .subscribe((e) => setChild(undefined));

    rx.payload<t.NetworkCardCommandActionEvent>($, 'sys.net/ui.NetworkCard/CommandAction')
      .pipe()
      .subscribe((e) => {
        /**
         * TODO 🐷
         * - parse and interpret the command text.
         */
        const remote = e.text;

        const self = e.network.self;
        const isReliable = true;
        const autoStartVideo = true;
        return LocalPeerCard.connect({ bus, remote, self, isReliable, autoStartVideo });
      });

    return () => dispose$.next();
  }, [network, instance]);

  return { child };
}
