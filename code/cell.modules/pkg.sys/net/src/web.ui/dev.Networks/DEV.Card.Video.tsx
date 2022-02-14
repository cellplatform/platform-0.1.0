import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, Card, CardBody } from './DEV.common';

export type DevVideoCardProps = {
  network: t.PeerNetwork;
  style?: CssValue;
};

export const DevVideoCard: React.FC<DevVideoCardProps> = (props) => {
  /**
   * [Render]
   */
  const styles = {
    base: css({ width: 300, display: 'flex' }),
    body: css({ minHeight: 50, fontSize: 14 }),
    footer: {
      base: css({ flex: 1, Flex: 'x-center-center', fontSize: 13, PaddingY: 5 }),
      pipe: css({ flex: 1 }),
      footer: css({ fontSize: 14 }),
    },
  };

  const elHeader = (
    <>
      <div>{'Video'}</div>
      <div></div>
    </>
  );

  const elBody = <div>body</div>;

  const elFooter = (
    <div {...styles.footer}>
      <div>{'Footer'}</div>
    </div>
  );

  return (
    <Card style={css(styles.base, props.style)}>
      <CardBody padding={[18, 20, 15, 20]} header={elHeader} footer={elFooter}>
        {elBody}
      </CardBody>
    </Card>
  );
};
