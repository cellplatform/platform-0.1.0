import React from 'react';

import {
  Button,
  Card,
  css,
  CssValue,
  EventPipe,
  ObjectView,
  t,
  useEventBusHistory,
} from '../common';
import { CardBody } from '../primitives';

export type NetbusCardProps = {
  netbus: t.PeerNetbus<any>;
  padding?: t.CssEdgesInput;
  showAsCard?: boolean;
  margin?: t.CssEdgesInput;
  style?: CssValue;
};

export const NetbusCard: React.FC<NetbusCardProps> = (props) => {
  const { netbus, padding = [18, 20, 15, 20], showAsCard = true } = props;

  const history = useEventBusHistory(netbus);
  const total = history.total;
  const totalLabel = total === 1 ? '1 event' : `${total} events`;

  /**
   * [Handlers]
   */
  const fireSampleEvent = () => {
    netbus.fire({ type: 'FOO/name', payload: { count: 0 } });
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({ width: 300, display: 'flex' }),
    body: css({ minHeight: 100 }),
    header: {
      right: css({ fontSize: 12, marginRight: 6 }),
    },
    footer: {
      base: css({ flex: 1, Flex: 'x-center-center', fontSize: 13, PaddingY: 3 }),
      pipe: css({ flex: 1 }),
      total: css({ marginLeft: 8, opacity: 0.7, fontSize: 11 }),
    },
  };

  const elHeader = (
    <>
      <div>Netbus</div>
      <div {...styles.header.right}>
        <Button onClick={fireSampleEvent}>Fire</Button>
      </div>
    </>
  );

  const elFooter = (
    <div {...styles.footer.base}>
      <EventPipe
        events={history.events}
        style={styles.footer.pipe}
        onEventClick={(item) => {
          console.log('event', item.event);
        }}
      />
      <div {...styles.footer.total}>{totalLabel}</div>
    </div>
  );

  const elBody = (
    <div {...styles.body}>
      <ObjectView name={'events'} data={history.events} fontSize={11} />
    </div>
  );

  return (
    <Card style={css(styles.base, props.style)} showAsCard={showAsCard}>
      <CardBody padding={padding} header={elHeader} footer={elFooter}>
        {elBody}
      </CardBody>
    </Card>
  );
};
