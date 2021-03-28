import React, { useEffect, useState } from 'react';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, PropList, PropListItem, t, time, color } from './common';
import { ConnectionData } from './DEV.ConnectionData';
import { ConnectionMedia } from './DEV.ConnectionMedia';
import { Filter } from '../util';
import { VideoSelf } from './DEV.VideoSelf';

export type NetworkProps = {
  bus: t.EventBus<any>;
  network: t.PeerNetworkStatus;
  style?: CssValue;
};

export const Network: React.FC<NetworkProps> = (props) => {
  const { network } = props;
  const bus = props.bus.type<t.PeerNetworkEvent>();

  const connections = {
    data: Filter.connectionsAs<t.PeerConnectionDataStatus>(network.connections, 'data'),
    media: Filter.connectionsAs<t.PeerConnectionMediaStatus>(network.connections, 'media'),
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

  const styles = {
    base: css({}),
    network: css({
      Flex: 'horizontal-spaceBetween-start',
    }),
    body: css({
      display: 'flex',
      flexWrap: 'wrap',
    }),
  };

  const items = toNetworkPropItems(network);

  const elNetworkCard = (
    <PropList
      title={'PeerNetwork'}
      defaults={{ clipboard: false }}
      items={items}
      margin={[null, null, 30, null]}
      width={{ max: 280 }}
    />
  );

  const cardMargin = 20;

  const elDataConnections = connections.data.map((item, i) => {
    const isLast = i === network.connections.length - 1;
    return (
      <ConnectionData
        key={item.id.remote}
        bus={bus}
        connection={item}
        isLast={isLast}
        margin={cardMargin}
      />
    );
  });

  const elMediaConnections = connections.media.map((item, i) => {
    const isLast = i === network.connections.length - 1;
    return (
      <ConnectionMedia
        key={item.id.remote}
        bus={bus}
        connection={item}
        isLast={isLast}
        margin={cardMargin}
      />
    );
  });

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.network}>
        {elNetworkCard}
        <VideoSelf networkRef={network.id} bus={bus} />
      </div>
      <div {...styles.body}>
        {elDataConnections}
        {elMediaConnections}
      </div>
    </div>
  );
};

/**
 * [Helpers]
 */

const toNetworkPropItems = (network?: t.PeerNetworkStatus): PropListItem[] => {
  if (!network) return [];

  const elapsed = time.elapsed(network.createdAt || -1);
  const age = elapsed.min < 60 ? 'just now' : elapsed.toString();
  const signal = network.signal;

  const items: PropListItem[] = [
    { label: 'id', value: { data: network.id, clipboard: true } },
    {
      label: `signal server ${signal.secure ? '(secure)' : ''}`,
      value: `${signal.host}:${signal.port}`,
    },
    { label: 'age', value: age },
  ];

  return items;
};
