import React, { useEffect, useState } from 'react';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PeerEvents } from '../../web.PeerNetwork.events';
import {
  Card,
  color,
  COLORS,
  css,
  CssValue,
  Hr,
  Icons,
  PropList,
  PropListItem,
  Style,
  t,
  Textbox,
  time,
} from '../common';
import { LocalPeerCardConstants } from './constants';
import * as k from './types';

type NewConnectionOptions = { isReliable?: boolean; autoStartVideo?: boolean };

export type LocalPeerCardProps = {
  bus: t.EventBus<any>;
  self: { id: t.PeerId; status: t.PeerStatus };
  title?: string | null;
  fields?: k.LocalPeerCardFields[];
  newConnections?: boolean | NewConnectionOptions;
  showAsCard?: boolean | { padding?: t.CssEdgesInput };
  style?: CssValue;
};

/**
 * A property list of the local network Peer.
 */
export const LocalPeerCard: React.FC<LocalPeerCardProps> = (props) => {
  const {
    bus,
    self,
    newConnections = false,
    showAsCard = false,
    fields = LocalPeerCardConstants.DEFAULT.FIELDS,
  } = props;
  const title = props.title === null ? undefined : props.title ?? 'Network';

  const [connectTo, setConnectTo] = useState<string>('');
  const [, setCount] = useState<number>(0);
  const redraw = () => setCount((prev) => prev + 1);

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const dispose$ = new Subject<void>();

    // NB: Cause timestamp values to remain up-to-date.
    if (fields.includes('Lifetime')) {
      interval(1000).pipe(takeUntil(dispose$)).subscribe(redraw);
    }

    return () => dispose$.next();
  }, [fields]);

  /**
   * Initiate a new connection.
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
  const styles = {
    base: css({}),
    textbox: css({
      fontSize: 12,
      marginBottom: 10,
      marginTop: 15,
      minWidth: 240,
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
      <PropList title={title} defaults={{ clipboard: false }} items={toItems(fields, props)} />
      {newConnections && <Hr thickness={6} opacity={0.05} margin={[5, 0]} />}
      {elConnect}
    </div>
  );

  if (showAsCard) {
    const padding =
      typeof showAsCard === 'object'
        ? css({ ...Style.toPadding(showAsCard.padding) })
        : css({ Padding: [18, 20, 15, 20] });
    return <Card style={padding}>{elBody}</Card>;
  }

  return elBody;
};

/**
 * [Helpers]
 */

const toItems = (fields: k.LocalPeerCardFields[], props: LocalPeerCardProps): t.PropListItem[] => {
  const { self } = props;
  if (!self?.status) return [];

  const status = self.status;
  const signal = status.signal;
  const elapsed = time.elapsed(status.createdAt || -1);
  const lifetime = elapsed.sec < 60 ? 'less than a minute' : elapsed.toString();

  const items: PropListItem[] = [];
  const push = (...input: PropListItem[]) => items.push(...input);

  fields.forEach((field) => {
    if (field === 'PeerId') {
      push({
        label: 'local peer',
        value: { data: status.id, clipboard: true },
      });
    }

    if (field === 'SignalServer') {
      const styles = {
        base: css({ Flex: 'horizontal-center-center' }),
        icon: css({ marginRight: 3 }),
      };
      const lock = { size: 14, color: COLORS.DARK, style: styles.icon };
      push({
        label: `signal server`,
        value: (
          <div {...styles.base}>
            {signal.secure ? <Icons.Lock.Closed {...lock} /> : <Icons.Lock.No {...lock} />}
            {signal.host}:{signal.port}
          </div>
        ),
      });
    }

    if (field === 'Lifetime') {
      push({
        label: 'lifetime',
        value: status.isOnline ? lifetime : 'no',
      });
    }

    if (field === 'Connections.Count') {
      push({
        label: `connections`,
        value: status.connections.length,
      });
    }
  });

  return items;
};
