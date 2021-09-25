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
  Textbox,
  Hr,
  color,
} from '../common';
import { useGroupState } from '../../hook';

type P = PropListItem;

export type PeerPropListProps = {
  bus: t.EventBus<any>;
  netbus: t.PeerNetworkBus<any>;
  status: t.PeerStatus;
  style?: CssValue;
};

export const PeerPropList: React.FC<PeerPropListProps> = (props) => {
  const { bus, netbus } = props;
  const self = netbus.self;

  const [connectTo, setConnectTo] = useState<string>('');
  const [count, setCount] = useState<number>(0);
  const redraw = () => setCount((prev) => prev + 1);

  useEffect(() => {
    const dispose$ = new Subject<void>();

    // NB: Cause timestamp values to remain up-to-date.
    interval(1000)
      .pipe(takeUntil(dispose$))
      .subscribe(() => redraw());

    return () => dispose$.next();
  }, []);

  const connect = async (remote: t.PeerId) => {
    remote = (connectTo || '').trim();
    if (!remote) return;

    const isConnected = netbus.connections
      .filter(({ kind }) => kind === 'data')
      .some(({ peer }) => peer.remote.id === remote);

    if (isConnected) return;

    const events = PeerNetwork.PeerEvents(bus);
    await events.connection(self, remote).open.data();
    events.dispose();
  };

  /**
   * [Render]
   */

  const styles = {
    base: css({}),
    textbox: css({ fontSize: 12, marginBottom: 10, marginTop: 15 }),
  };

  const elConnect = (
    <Textbox
      value={connectTo}
      placeholder={'open connection'}
      onChange={(e) => setConnectTo(e.to)}
      style={styles.textbox}
      spellCheck={false}
      selectOnFocus={true}
      enter={{
        isEnabled: Boolean(connectTo.trim()),
        handler: () => connect(connectTo),
        icon: (e) => {
          const input = connectTo.trim();
          const col = input ? COLORS.BLUE : color.alpha(COLORS.DARK, 0.6);
          const el = (
            <div {...css({ Flex: 'horizontal-center-center' })}>
              {input && <Icons.Arrow.Forward size={18} opacity={0.5} style={{ marginRight: 4 }} />}
              <Icons.Antenna size={18} color={col} />
            </div>
          );
          return el;
        },
      }}
    />
  );

  return (
    <div {...css(styles.base, props.style)}>
      <PropList
        title={'Peer Network'}
        defaults={{ clipboard: false }}
        items={toNetworkItems(props)}
        width={{ min: 240, max: 260 }}
      />
      <Hr thickness={10} opacity={0.05} margin={[5, 0]} />
      {elConnect}
    </div>
  );
};

/**
 * [Helpers]
 */

const toNetworkItems = (props: PeerPropListProps) => {
  const { status } = props;
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

  return [
    { label: 'local peer', value: { data: status.id, clipboard: true } },
    { label: `signal server`, value: elSignal },
    { label: 'connection lifespan', value: age },
    { label: 'online', value: status.isOnline },
  ];
};
