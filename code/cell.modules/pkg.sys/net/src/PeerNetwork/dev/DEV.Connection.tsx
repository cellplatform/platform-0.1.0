import React, { useEffect, useRef, useState } from 'react';

import { Button, Card, css, CssValue, Hr, Icons, PropList, PropListItem, t } from './common';
import { EventStack } from './DEV.EventStack';

export type ConnectionProps = {
  bus: t.EventBus<any>;
  netbus: t.EventBus<any>;
  connection: t.PeerConnectionDataStatus;
  isLast?: boolean;
  style?: CssValue;
  margin?: t.CssEdgesInput;
};

export const Connection: React.FC<ConnectionProps> = (props) => {
  const { connection, netbus } = props;
  const id = connection.id;
  const bus = props.bus.type<t.PeerEvent>();

  const [debugCount, setDebugCount] = useState<number>(0);

  const items: PropListItem[] = [
    { label: 'id', value: { data: id.remote, clipboard: true } },
    { label: 'kind', value: connection.kind },
    { label: 'reliable', value: connection.isReliable },
    { label: 'open', value: connection.isOpen },
  ];

  const styles = {
    base: css({ position: 'relative', fontSize: 14 }),
    buttons: css({
      Flex: 'horizontal-center-spaceBetween',
      fontSize: 12,
    }),
    events: css({ marginTop: 20 }),
    close: css({ Absolute: [5, 5, null, null] }),
  };

  const hr = <Hr thickness={5} opacity={0.1} margin={[10, 0]} />;
  const elEvents = <EventStack netbus={netbus} style={styles.events} />;

  const handleClose = () => {
    bus.fire({
      type: 'Peer:Connection/disconnect:req',
      payload: { self: id.self, remote: id.remote },
    });
  };

  const elCloseButton = (
    <Button style={styles.close} onClick={handleClose}>
      <Icons.Close size={18} />
    </Button>
  );

  return (
    <div {...css(styles.base, props.style)}>
      <Card
        key={id.remote}
        padding={[18, 20, 20, 20]}
        margin={props.margin}
        width={280}
        shadow={false}
      >
        <PropList title={'PeerConnection'} items={items} defaults={{ clipboard: false }} />

        {hr}

        <div {...styles.buttons}>
          <Button
            label={'Broadcast Event'}
            onClick={() => {
              setDebugCount((prev) => prev + 1);
              netbus.fire({
                // NB: Arbitrary invented event.  When using in application, pass a set of strong event types to the bus.
                type: 'random/sample:event',
                payload: { msg: 'hello', from: id.self, count: debugCount },
              });
            }}
          />
        </div>

        {elEvents}
        {elCloseButton}
      </Card>
    </div>
  );
};
