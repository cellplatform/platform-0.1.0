import React, { useEffect, useState } from 'react';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PeerEvents } from '../../web.PeerNetwork.events';
import {
  color,
  COLORS,
  css,
  CssValue,
  Hr,
  Icons,
  PropList,
  t,
  Textbox,
  time,
  Card,
} from '../common';

type NewConnectionOptions = { isReliable?: boolean; autoStartVideo?: boolean };

export type LocalPeerCardProps = {
  bus: t.EventBus<any>;
  self: { id: t.PeerId; status: t.PeerStatus };
  title?: string | null;
  newConnections?: boolean | NewConnectionOptions;
  showAsCard?: boolean;
  style?: CssValue;
};

/**
 * TODO 🐷
 * - rename to [LocalPeerCard]
 * - make elements choosable (in order).  See [ModuleInfo]
 */

/**
 * A property list of the local network Peer.
 */
export const LocalPeerCard: React.FC<LocalPeerCardProps> = (props) => {
  const { bus, self, newConnections = false, showAsCard = false } = props;
  const title = props.title === null ? undefined : props.title ?? 'Network';

  const [connectTo, setConnectTo] = useState<string>('');
  const [, setCount] = useState<number>(0);
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

    const isConnected = self.status.connections
      .filter(({ kind }) => kind === 'data')
      .some(({ peer }) => peer.remote.id === remote);
    if (isConnected) return; // Already connected.

    // Prepare options.
    const options: NewConnectionOptions =
      typeof newConnections === 'object' ? newConnections : { isReliable: true };
    const { isReliable, autoStartVideo } = options;

    // Invoke the action(s).
    const events = PeerEvents(bus);
    const open = events.connection(self.id, remote).open;
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
    card: css({
      PaddingX: 25,
      paddingTop: 20,
      paddingBottom: 15,
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

  const elBody = (
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

  return showAsCard ? <Card style={styles.card}>{elBody}</Card> : elBody;
};

/**
 * [Helpers]
 */

const toNetworkItems = (props: LocalPeerCardProps): t.PropListItem[] => {
  const { self } = props;
  if (!self?.status) return [];

  const status = self.status;
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
    { label: 'lifespan', value: status.isOnline ? age : 'no' },
    { label: `connections`, value: status.connections.length },
  ];
};
