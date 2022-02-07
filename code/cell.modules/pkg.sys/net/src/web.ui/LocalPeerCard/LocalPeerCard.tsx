import React, { useEffect, useState } from 'react';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { useLocalPeer } from '../../web.ui.hooks';
import {
  Card,
  COLORS,
  css,
  CssValue,
  Hr,
  Icons,
  PropList,
  PropListItem,
  Style,
  t,
  time,
} from '../common';
import { OpenConnectionInput } from '../OpenConnection.Input';
import { LocalPeerCardConstants } from './constants';
import * as k from './types';
import { connect } from './LocalPeerCard.connect';

type OpenConnectionOptions = { isReliable?: boolean; autoStartVideo?: boolean };

export type LocalPeerCardProps = {
  bus: t.EventBus<any>;
  self: t.PeerId;
  title?: string | null;
  fields?: k.LocalPeerCardFields[];
  newConnections?: boolean | OpenConnectionOptions;
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

  const [, setCount] = useState<number>(0);
  const redraw = () => setCount((prev) => prev + 1);
  const local = useLocalPeer({ bus, self });
  const status = local.status;

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
  const startConnection = async (args: { remote: t.PeerId }) => {
    type O = OpenConnectionOptions;
    const options: O = typeof newConnections === 'object' ? newConnections : { isReliable: true };
    const { isReliable, autoStartVideo } = options;
    const { remote } = args;
    connect({ bus, remote, self, isReliable, autoStartVideo });
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({}),
    textbox: css({
      marginBottom: 10,
      marginTop: 15,
    }),
  };

  const elConnect = newConnections && (
    <OpenConnectionInput style={styles.textbox} onConnectRequest={startConnection} />
  );

  const elBody = (
    <div {...css(styles.base, props.style)}>
      <PropList
        title={title}
        defaults={{ clipboard: false }}
        items={toItems(status, fields, props)}
      />
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

const toItems = (
  status: t.PeerStatus | undefined,
  fields: k.LocalPeerCardFields[],
  props: LocalPeerCardProps,
): t.PropListItem[] => {
  // const { self } = props;

  // if (local.)
  if (!status) return [];

  // if (!self?.status) return [];

  // const status = self.status;
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
