import React, { useEffect, useState } from 'react';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PeerEvents } from '../event';
import { color, COLORS, css, CssValue, Hr, Icons, PropList, t, Textbox, time } from './common';

type NewConnectionOptions = { isReliable?: boolean; autoStartVideo?: boolean };

export type LocalPeerPropsProps = {
  self: t.PeerId;
  bus: t.EventBus<any>;
  status: t.PeerStatus;
  title?: string | null;
  newConnections?: boolean | NewConnectionOptions;
  style?: CssValue;
};

/**
 * A property list
 */
export const LocalPeerProps: React.FC<LocalPeerPropsProps> = (props) => {
  const { bus, self, newConnections = false } = props;
  const title = props.title === null ? undefined : props.title ?? 'Network';

  const [connectTo, setConnectTo] = useState<string>('');
  const [count, setCount] = useState<number>(0);
  const redraw = () => setCount((prev) => prev + 1);

  useEffect(() => {
    const dispose$ = new Subject<void>();

    // NB: Cause timestamp values to remain up-to-date.
    interval(1000).pipe(takeUntil(dispose$)).subscribe(redraw);

    return () => dispose$.next();
  }, []);

  /**
   * Initiates a new connection.
   */
  const startConnection = async (remote: t.PeerId) => {
    remote = (connectTo || '').trim();
    if (!remote) return;

    const isConnected = props.status.connections
      .filter(({ kind }) => kind === 'data')
      .some(({ peer }) => peer.remote.id === remote);
    if (isConnected) return; // Already connected.

    // Prepare options.
    const options: NewConnectionOptions =
      typeof newConnections === 'object' ? newConnections : { isReliable: true };
    const { isReliable, autoStartVideo } = options;

    // Invoke the action(s).
    const events = PeerEvents(bus);
    const open = events.connection(self, remote).open;
    const res = await open.data({ isReliable });

    if (autoStartVideo && res.connection) {
      const parent = res.connection.id;
      await open.media('media/video', { parent });
    }

    // Finish up.
    events.dispose();
  };

  /**
   * [Render]
   */

  const width = { min: 240, max: 260 };

  const styles = {
    base: css({}),
    textbox: css({
      fontSize: 12,
      marginBottom: 10,
      marginTop: 15,
      maxWidth: width.max,
      minWidth: width.min,
    }),
  };

  const elConnect = newConnections && (
    <Textbox
      value={connectTo}
      placeholder={'open connection'}
      onChange={(e) => setConnectTo(e.to)}
      style={styles.textbox}
      spellCheck={false}
      selectOnFocus={true}
      enter={{
        isEnabled: Boolean(connectTo.trim()),
        handler: () => startConnection(connectTo),
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
        title={title}
        defaults={{ clipboard: false }}
        items={toNetworkItems(props)}
        width={width}
      />
      {newConnections && <Hr thickness={6} opacity={0.05} margin={[5, 0]} />}
      {elConnect}
    </div>
  );
};

/**
 * [Helpers]
 */

const toNetworkItems = (props: LocalPeerPropsProps): t.PropListItem[] => {
  const { status } = props;
  if (!status) return [];

  const signal = status.signal;
  const elapsed = time.elapsed(status.createdAt || -1);
  const age = elapsed.sec < 60 ? 'less than a minute' : elapsed.toString();

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
    { label: 'alive', value: status.isOnline ? age : 'no' },
    { label: `connections`, value: status.connections.length },
  ];
};
