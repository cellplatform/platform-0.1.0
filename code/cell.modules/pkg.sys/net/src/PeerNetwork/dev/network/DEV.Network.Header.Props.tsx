import React, { useEffect, useState } from 'react';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  COLORS,
  css,
  CssValue,
  Icons,
  PropList,
  PropListItem,
  t,
  time,
  Button,
  PeerNetwork,
} from '../common';

export type PeerPropListProps = {
  netbus: t.NetBus<any>;
  status: t.PeerStatus;
  style?: CssValue;
};

export const PeerPropList: React.FC<PeerPropListProps> = (props) => {
  const items = toItems(props);
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
      title={'Peer Network'}
      defaults={{ clipboard: false }}
      items={items}
      width={{ min: 240, max: 260 }}
      style={props.style}
    />
  );
};

/**
 * [Helpers]
 */

const toItems = (props: PeerPropListProps): PropListItem[] => {
  const { status, netbus } = props;
  if (!status) return [];

  const elapsed = time.elapsed(status.createdAt || -1);
  const age = elapsed.sec < 60 ? 'just now' : elapsed.toString();
  const signal = status.signal;

  const styles = {
    signal: {
      base: css({ Flex: 'horizontal-center-center' }),
      icon: css({ marginRight: 3 }),
    },
  };

  const lock = { size: 14, color: COLORS.DARK, style: styles.signal.icon };

  const elSignal = (
    <div {...styles.signal.base}>
      {signal.secure ? <Icons.Lock.Closed {...lock} /> : <Icons.Lock.No {...lock} />}
      {signal.host}:{signal.port}
    </div>
  );

  const items: PropListItem[] = [
    { label: 'local peer', value: { data: status.id, clipboard: true } },
    { label: `signal server`, value: elSignal },
    { label: 'age', value: age },
    { label: 'online', value: status.isOnline },
    {
      label: 'group',
      value: (
        <Button
          label={'Calculate'}
          onClick={async () => {
            const events = PeerNetwork.GroupEvents(netbus);
            const res = await events.connections().get();

            console.group('🌳 Connections');
            console.log('local', res.local);
            console.log('remote', res.remote);
            console.groupEnd();
            events.dispose();
          }}
        />
      ),
    },
  ];

  return items;
};
