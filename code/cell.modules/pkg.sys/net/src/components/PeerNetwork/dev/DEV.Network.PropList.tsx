import React, { useEffect, useState } from 'react';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CssValue, PropList, PropListItem, t, time } from './common';

export type NetworkPropListProps = {
  network: t.PeerNetworkStatus;
  style?: CssValue;
};

export const NetworkPropList: React.FC<NetworkPropListProps> = (props) => {
  const items = toItems(props.network);
  const [redraw, setRedraw] = useState<number>(0);

  useEffect(() => {
    const dispose$ = new Subject<void>();

    // NB: Cause timestamp values to remain up-to-date.
    interval(1000)
      .pipe(takeUntil(dispose$))
      .subscribe(() => setRedraw((prev) => prev + 1));

    return () => dispose$.next();
  }, []);

  return (
    <PropList
      title={'MeshNetwork'}
      defaults={{ clipboard: false }}
      items={items}
      width={{ max: 280 }}
      style={props.style}
    />
  );
};

/**
 * [Helpers]
 */

const toItems = (network?: t.PeerNetworkStatus): PropListItem[] => {
  if (!network) return [];

  const elapsed = time.elapsed(network.createdAt || -1);
  const age = elapsed.sec < 60 ? 'just now' : elapsed.toString();
  const signal = network.signal;

  const items: PropListItem[] = [
    { label: 'peer:id', value: { data: network.id, clipboard: true } },
    {
      label: `signal server ${signal.secure ? '(secure)' : ''}`,
      value: `${signal.host}:${signal.port}`,
    },
    { label: 'age', value: age },
    { label: 'online', value: network.isOnline },
  ];

  return items;
};
