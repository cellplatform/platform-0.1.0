import React, { useEffect, useState } from 'react';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { useLocalPeer } from '../../web.hooks';
import { Card, css, CssValue, Hr, PropList, Style, t } from '../common';
import { OpenConnectionInput } from '../OpenConnection.Input';
import { LocalPeerCardConstants } from './constants';
import { connect, Connect } from './LocalPeerCard.connect';
import { toItems } from './LocalPeerCard.toItems';
import * as k from './types';

type OpenConnectionOptions = { isReliable?: boolean; autoStartVideo?: boolean };

export type LocalPeerCardProps = {
  bus: t.EventBus<any>;
  self: t.PeerId;
  title?: string | null;
  fields?: k.LocalPeerCardFields[];
  openConnectionOptions?: OpenConnectionOptions;
  showAsCard?: boolean | { padding?: t.CssEdgesInput };
  style?: CssValue;
};

/**
 * A property list of the local network Peer.
 */
type V = React.FC<LocalPeerCardProps>;
const View: V = (props) => {
  const {
    bus,
    self,
    openConnectionOptions: newConnections = false,
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
    base: css({ minWidth: 240 }),
    textbox: css({ marginBottom: 10, marginTop: 15 }),
  };

  const elConnect = fields.includes('Connection.Open') && (
    <OpenConnectionInput style={styles.textbox} onConnectRequest={startConnection} />
  );

  const elConnectHr = elConnect && fields.length > 1 && (
    <Hr thickness={6} opacity={0.05} margin={[5, 0]} />
  );

  const elBody = (
    <div {...css(styles.base, props.style)}>
      <PropList title={title} defaults={{ clipboard: false }} items={toItems(status, fields)} />
      {elConnectHr}
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
 * Export (API)
 */
type C = V & { connect: Connect };
export const LocalPeerCard: C = View as any;
LocalPeerCard.connect = connect;
