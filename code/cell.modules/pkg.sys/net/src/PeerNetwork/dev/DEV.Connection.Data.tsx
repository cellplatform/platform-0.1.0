import { color } from '@platform/css';
import React, { useEffect, useRef, useState } from 'react';

import { Button, COLORS, css, CssValue, Hr, Icons, t } from './common';
import { EventStack } from './DEV.EventStack';
import { Textbox } from './DEV.primitives';

export type ConnectionDataProps = {
  netbus: t.EventBus<any>;
  connection: t.PeerConnectionDataStatus;
  style?: CssValue;
};

export const ConnectionData: React.FC<ConnectionDataProps> = (props) => {
  const { connection, netbus } = props;
  const id = connection.id;

  const [eventCount, setEventCount] = useState<number>(0);
  const [eventMessage, setEventMessage] = useState<string>('');

  const styles = {
    base: css({}),
    buttons: css({
      Flex: 'horizontal-center-spaceBetween',
      fontSize: 12,
      marginTop: 8,
    }),
    events: css({ marginTop: 20 }),
  };

  const broadcastEvent = () => {
    const msg = eventMessage.trim() ? eventMessage : `<empty>`;
    setEventCount((prev) => prev + 1);
    netbus.fire({
      // NB: Arbitrary invented event.  When using in application, pass a set of strong event types to the bus.
      type: 'sample/event',
      payload: { msg, from: id.self, count: eventCount },
    });
  };

  const elEventMessageTextbox = (
    <Textbox
      value={eventMessage}
      placeholder={'broadcast event'}
      onChange={(e) => setEventMessage(e.to)}
      enter={{
        handler: broadcastEvent,
        icon: (
          <Icons.Send
            size={16}
            color={eventMessage.trim() ? COLORS.BLUE : color.alpha(COLORS.DARK, 0.3)}
          />
        ),
      }}
    />
  );

  return (
    <div {...css(styles.base, props.style)}>
      <Hr thickness={5} opacity={0.1} margin={[10, 0]} />

      {elEventMessageTextbox}
      <div {...styles.buttons}>
        <Button label={'Broadcast Event'} onClick={broadcastEvent} />
      </div>

      <EventStack bus={netbus} style={styles.events} />
    </div>
  );
};
