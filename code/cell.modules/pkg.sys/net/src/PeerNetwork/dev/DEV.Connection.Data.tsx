import React, { useEffect, useRef, useState } from 'react';

import { Button, Card, css, CssValue, Hr, Icons, PropList, PropListItem, t } from './common';
import { EventStack } from './DEV.EventStack';

export type ConnectionDataProps = {
  netbus: t.EventBus<any>;
  connection: t.PeerConnectionDataStatus;
  style?: CssValue;
};

export const ConnectionData: React.FC<ConnectionDataProps> = (props) => {
  const { connection, netbus } = props;
  const id = connection.id;

  const [eventCount, setEventCount] = useState<number>(0);

  const styles = {
    base: css({}),
    buttons: css({
      Flex: 'horizontal-center-spaceBetween',
      fontSize: 12,
    }),
    events: css({ marginTop: 20 }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.buttons}>
        <Button
          label={'Broadcast Event'}
          onClick={() => {
            setEventCount((prev) => prev + 1);
            netbus.fire({
              // NB: Arbitrary invented event.  When using in application, pass a set of strong event types to the bus.
              type: 'random/sample:event',
              payload: { msg: 'hello', from: id.self, count: eventCount },
            });
          }}
        />
      </div>

      <EventStack netbus={netbus} style={styles.events} />
    </div>
  );
};
