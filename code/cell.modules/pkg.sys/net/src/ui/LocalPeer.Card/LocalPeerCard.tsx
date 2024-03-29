import React, { useEffect, useState } from 'react';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { useLocalPeer } from '../../ui.hooks';
import { Card, CmdTextbox, css, CssValue, FC, Hr, PropList, t } from '../common';
import { FIELDS, DEFAULT } from './constants';
import { Connect, connect } from './LocalPeerCard.connect';
import { toItems } from './LocalPeerCard.toItems';
import * as k from './types';

type OpenConnectionOptions = { isReliable?: boolean; autoStartVideo?: boolean };

export type LocalPeerCardProps = {
  bus: t.EventBus<any>;
  self: t.PeerId;
  title?: string | null;
  fields?: k.LocalPeerCardFields[];
  openConnectionOptions?: OpenConnectionOptions;
  showAsCard?: boolean;
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
    fields = DEFAULT.FIELDS,
    showAsCard = false,
  } = props;
  const title = props.title === null ? undefined : props.title ?? 'Network';

  const [peerText, setPeerText] = useState('');
  const [, setCount] = useState(0);
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
  const startConnection = async (command: string) => {
    type O = OpenConnectionOptions;
    const options: O = typeof newConnections === 'object' ? newConnections : { isReliable: true };
    const { isReliable, autoStartVideo } = options;
    const remote = command;
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
    <CmdTextbox
      text={peerText}
      style={styles.textbox}
      placeholder={'open connection'}
      onAction={(e) => startConnection(e.text)}
      onChange={(e) => setPeerText(e.to)}
    />
  );

  const elConnectHr = elConnect && fields.length > 1 && (
    <Hr thickness={6} opacity={0.05} margin={[5, 0]} />
  );

  const elBody = (
    <>
      <PropList title={title} defaults={{ clipboard: false }} items={toItems(status, fields)} />
      {elConnectHr}
      {elConnect}
    </>
  );

  return (
    <Card style={css(styles.base, props.style)} padding={[18, 20, 15, 20]} showAsCard={showAsCard}>
      {elBody}
    </Card>
  );
};

/**
 * Export (API)
 */
type Fields = {
  connect: Connect;
  FIELDS: typeof FIELDS;
  DEFAULT: typeof DEFAULT;
};
export const LocalPeerCard = FC.decorate<LocalPeerCardProps, Fields>(
  View,
  { connect, FIELDS, DEFAULT },
  { displayName: 'LocalPeer.Card' },
);
