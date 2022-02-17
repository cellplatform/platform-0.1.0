import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import { NetworkCard } from '../NetworkCard';
import * as k from '../NetworkCard/types';
import { css, CssValue, rx, t } from './DEV.common';
import { DevVideoCard } from './DEV.Card.Video';

export type DevNetworkCardProps = {
  instance: t.InstanceId;
  network: t.PeerNetwork;
  style?: CssValue;
};

export const DevNetworkCard: React.FC<DevNetworkCardProps> = (props) => {
  const { network, instance } = props;
  const ctrl = useController({ network, instance });
  return (
    <NetworkCard
      instance={props.instance}
      network={network}
      style={props.style}
      child={ctrl.child}
    />
  );
};

/**
 * Hooks
 */

export function useController(args: { instance: t.InstanceId; network: t.PeerNetwork }) {
  const { network, instance } = args;
  const [child, setChild] = useState<undefined | JSX.Element>();
  useEffect(() => {
    const dispose$ = new Subject<void>();
    const bus = rx.busAsType<k.NetworkCardEvent>(network.bus);
    const $ = bus.$.pipe(takeUntil(dispose$));

    const styles = {
      child: css({ flex: 1 }),
    };

    rx.payload<k.NetworkCardPeerClickEvent>($, 'sys.net/ui.NetworkCard/PeerClick')
      .pipe(filter((e) => e.instance === instance))
      .subscribe((e) => {
        if (e.media) {
          const el = <DevVideoCard network={network} style={styles.child} stream={e.media} />;
          setChild(el);
        }
      });

    return () => dispose$.next();
  }, [network, instance]);

  return { child };
}
