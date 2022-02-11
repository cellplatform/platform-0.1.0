import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, Card, CardBody, ObjectView } from './DEV.common';

export type DevCrdtCardProps = {
  netbus: t.NetworkBus;
  style?: CssValue;
};

export const DevCrdtCard: React.FC<DevCrdtCardProps> = (props) => {
  const { netbus } = props;

  console.log('netbus', netbus);

  /**
   * [Render]
   */
  const styles = {
    base: css({ width: 300, display: 'flex' }),
    body: css({ minHeight: 100 }),
  };

  const data = { msg: 'crdt' };

  const elHeader = (
    <>
      <div>Crdt</div>
      <div></div>
    </>
  );

  const elBody = (
    <div {...styles.body}>
      <ObjectView name={'events'} data={data} fontSize={11} />
    </div>
  );

  return (
    <Card style={css(styles.base, props.style)}>
      <CardBody padding={[18, 20, 15, 20]} header={elHeader}>
        {elBody}
      </CardBody>
    </Card>
  );
};
