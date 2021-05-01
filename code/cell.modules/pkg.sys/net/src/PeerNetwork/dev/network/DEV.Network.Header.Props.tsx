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
  netbus: t.NetBus<any>;
  status: t.PeerStatus;
  style?: CssValue;
};

export const PeerPropList: React.FC<PeerPropListProps> = (props) => {
  const { bus, netbus } = props;
  const self = netbus.self;
  const [count, setCount] = useState<number>(0);
  const redraw = () => setCount((prev) => prev + 1);

  const styles = {
    base: css({}),
    textbox: css({ fontSize: 12, marginBottom: 10, marginTop: 15 }),
  };

  useEffect(() => {
    const dispose$ = new Subject<void>();

    // NB: Cause timestamp values to remain up-to-date.
    interval(1000)
      .pipe(takeUntil(dispose$))
      .subscribe(() => redraw());

    return () => dispose$.next();
  }, []);

  const width = { min: 240, max: 260 };

  const [connectTo, setConnectTo] = useState<string>('');
  const elConnect = (
    <Textbox
      value={connectTo}
      placeholder={'open connection'}
      onChange={(e) => setConnectTo(e.to)}
      style={styles.textbox}
      spellCheck={false}
      selectOnFocus={true}
      enter={{
        async handler() {
          const remote = connectTo.trim();
          if (!remote) return;

          const isConnected = netbus.connections
            .filter(({ kind }) => kind === 'data')
            .some(({ peer }) => peer.remote.id === remote);

          if (isConnected) return;

          const events = PeerNetwork.Events(bus);
          await events.connection(self, remote).open.data();
          events.dispose();
        },
        isEnabled: Boolean(connectTo.trim()),
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
        items={networkItems(props)}
        width={width}
      />
      <Hr thickness={10} opacity={0.05} margin={[5, 0]} />
      {elConnect}
      {/* <PropList
        defaults={{ clipboard: false }}
        items={groupItems({ bus, netbus, status: group.status })}
        width={width}
      /> */}
    </div>
  );
};

/**
 * [Helpers]
 */

const networkItems = (props: PeerPropListProps) => {
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

  return [
    { label: 'local peer', value: { data: status.id, clipboard: true } },
    { label: `signal server`, value: elSignal },
    { label: 'age', value: age },
    { label: 'online', value: status.isOnline },
  ];
};

const groupItems = (args: {
  bus: t.EventBus<any>;
  netbus: t.NetBus<any>;
  status?: t.GroupPeerStatus;
}) => {
  const { bus, netbus, status } = args;
  const self = netbus.self;
  const totalPending = status?.pending.length || 0;

  const styles = {
    base: css({ Flex: 'horizontal-center-center' }),
    label: css({ opacity: 0.4 }),
  };

  const group: P = {
    label: 'group',
    value: (
      <>
        {totalPending === 0 && <div {...styles.label}>({'“alone”'})</div>}
        <Button
          label={'refresh'}
          margin={[null, null, null, 8]}
          onClick={() => {
            const group = PeerNetwork.GroupEvents(netbus);
            group.refresh().fire();
            group.dispose();
          }}
        />
      </>
    ),
  };

  const pending = (() => {
    if (!status) return;
    if (totalPending === 0) return;

    return {
      label: 'pending',
      value: (
        <div {...styles.base}>
          <div {...styles.label}>{totalPending} pending</div>
          <Button
            label={'connect'}
            margin={[null, null, null, 8]}
            onClick={async () => {
              const events = PeerNetwork.Events(bus);

              const wait = status.pending.map(async (remote) => {
                const open = events.connection(self, remote.peer).open;
                if (remote.kind === 'data') {
                  const res = await open.data();
                  console.log('open/data:', res);
                }
                if (remote.kind === 'media/screen' || remote.kind === 'media/video') {
                  const { parent } = remote;
                  const res = await open.media(remote.kind, { parent });
                  console.log('open/media:', res);
                }
              });

              await Promise.all(wait);
              events.dispose();
            }}
          />
        </div>
      ),
    };
  })();

  return [group, pending].filter(Boolean);
};
