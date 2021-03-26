import React, { useEffect, useRef, useState } from 'react';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, PropList, PropListItem, t, time } from './common';
import { DataConnection } from './DEV.DataConnection';

export type NetworkProps = {
  network: t.PeerNetworkStatus;
  style?: CssValue;
};

export const Network: React.FC<NetworkProps> = (props) => {
  const { network } = props;
  const connections = {
    data: filterConnectionAs<t.PeerConnectionDataStatus>(network.connections, 'data'),
    media: filterConnectionAs<t.PeerConnectionMediaStatus>(network.connections, 'media'),
  };

  const [redraw, setRedraw] = useState<number>(0);

  useEffect(() => {
    const dispose$ = new Subject<void>();

    // NB: Causes timestamp values to remain up-to-date.
    interval(1000)
      .pipe(takeUntil(dispose$))
      .subscribe(() => {
        // setRedraw((prev) => prev + 1);
      });

    return () => dispose$.next();
  }, []);

  const items = toNetworkPropItems(network);

  const elPropCard = network && (
    <PropList
      title={'PeerNetwork'}
      defaults={{ clipboard: false }}
      items={items}
      margin={[null, null, 30, null]}
    />
  );

  const elDataConnections = connections.data.map((item, i) => {
    const isLast = i === network.connections.length - 1;
    return <DataConnection key={item.id.remote} connection={item} isLast={isLast} />;
  });

  const styles = { base: css({}) };

  return (
    <div {...css(styles.base, props.style)}>
      {elPropCard}
      {elDataConnections}
    </div>
  );
};

/**
 * [Helpers]
 */

type C = t.PeerConnectionStatus;
function filterConnectionAs<T extends C>(connections: C[], kind: C['kind']) {
  return connections.filter((item) => item.kind === kind).map((item) => item as T);
}

const toNetworkPropItems = (network?: t.PeerNetworkStatus): PropListItem[] => {
  if (!network) return [];

  const elapsed = time.elapsed(network.createdAt || -1);
  const age = elapsed.min < 60 ? 'just now' : elapsed.toString();
  const signal = network.signal;

  const items = [
    { label: 'id', value: network?.id, clipboard: true, monospace: true },
    { label: 'age', value: age },
    {
      label: `signal server ${signal.secure ? '(secure)' : ''}`,
      value: `${signal.host}:${signal.port}`,
    },
  ];

  return items;
};
