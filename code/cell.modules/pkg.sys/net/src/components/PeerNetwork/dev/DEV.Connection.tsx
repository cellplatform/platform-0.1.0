import React, { useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ObjectView } from 'sys.ui.dev';

import { Button, Card, css, CssValue, Hr, PropList, PropListItem, t } from './common';
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
  const bus = props.bus.type<t.PeerEvent>();

  const id = connection.id;
  const networkRef = id.local;

  const [debugCount, setDebugCount] = useState<number>(0);

  const styles = {
    base: css({ fontSize: 14 }),
    buttons: css({ Flex: 'horizontal-center-spaceBetween' }),
    events: css({ marginTop: 20, marginBottom: 6 }),
  };

  const items: PropListItem[] = [
    { label: 'id', value: { data: id.remote, clipboard: true } },
    { label: 'kind', value: connection.kind },
    { label: 'reliable', value: connection.isReliable },
    { label: 'open', value: connection.isOpen },
  ];

  const hr = <Hr thickness={5} opacity={0.1} margin={[10, 0]} />;
  const elEvents = <EventStack netbus={netbus} style={styles.events} />;

  return (
    <div {...css(styles.base, props.style)}>
      <Card key={id.remote} padding={[15, 20]} margin={props.margin} width={280} shadow={false}>
        <PropList title={'Connection'} items={items} defaults={{ clipboard: false }} />

        {hr}

        <div {...styles.buttons}>
          <Button
            label={'Broadcast'}
            onClick={() => {
              setDebugCount((prev) => prev + 1);
              netbus.fire({
                // NB: Arbitrary invented event.  When using in application, pass a set of strong event types to the bus.
                type: 'Random/Sample:event',
                payload: { msg: 'hello', from: networkRef, count: debugCount },
              });
            }}
          />
          <Button
            onClick={() => {
              bus.fire({
                type: 'Peer:Connection/disconnect:req',
                payload: { self: networkRef, remote: id.remote },
              });
            }}
          >
            Close
          </Button>
        </div>

        {elEvents}
      </Card>
    </div>
  );
};
