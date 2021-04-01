import React, { useEffect, useRef, useState } from 'react';
import { ObjectView } from 'sys.ui.dev';

import { Card, css, CssValue, PropListItem, t, time, PropList, Button, Hr } from './common';
import { PeerNetwork } from '..';

export type ConnectionDataProps = {
  bus: t.EventBus<any>;
  connection: t.PeerConnectionDataStatus;
  isLast?: boolean;
  style?: CssValue;
  margin?: t.CssEdgesInput;
};

export const ConnectionData: React.FC<ConnectionDataProps> = (props) => {
  const { connection } = props;
  const bus = props.bus.type<t.PeerEvent>();

  const events = PeerNetwork.Events({ bus });

  const id = connection.id;

  const styles = {
    base: css({ fontSize: 14 }),
    buttons: css({
      Flex: 'horizontal-center-spaceBetween',
    }),
  };

  const items: PropListItem[] = [
    { label: 'id', value: { data: id.remote, clipboard: true } },
    { label: 'kind', value: connection.kind },
    { label: 'reliable', value: connection.isReliable },
    { label: 'open', value: connection.isOpen },
  ];

  const hr = <Hr thickness={5} opacity={0.1} margin={[10, 0]} />;

  return (
    <div {...css(styles.base, props.style)}>
      <Card key={id.remote} padding={[15, 20]} margin={props.margin} width={280}>
        <PropList title={'Connection'} items={items} defaults={{ clipboard: false }} />
        {hr}

        <div {...styles.buttons}>
          <Button
            label={'Broadcast'}
            onClick={() => {
              events.data(id.local).send({ msg: 'foo' });
            }}
          />
          <Button
            onClick={() => {
              bus.fire({
                type: 'Peer:Connection/disconnect:req',
                payload: { ref: id.local, remote: id.remote },
              });
            }}
          >
            Close
          </Button>
        </div>

        {/* {hr} */}

        {/* <ObjectView data={connection} /> */}
      </Card>
    </div>
  );
};
