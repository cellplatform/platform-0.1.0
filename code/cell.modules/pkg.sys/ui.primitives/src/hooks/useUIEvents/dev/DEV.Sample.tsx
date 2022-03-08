import React, { useEffect, useRef, useState } from 'react';
import { color, COLORS, css, CssValue, t, Card, TextSyntax } from './DEV.common';
import { useUIEvents, UIEventBusHookArgs } from '..';

export type DevSampleProps = {
  args: UIEventBusHookArgs;
  style?: CssValue;
};

export const DevSample: React.FC<DevSampleProps> = (props) => {
  const pointer = useUIEvents(props.args);
  const { mouse } = pointer;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Flex: 'center-center',
      width: 300,
      height: 200,
    }),
    card: css({ padding: 20 }),
    label: css({ fontFamily: 'monospace', fontWeight: 'bold', fontSize: 16 }),
  };

  const elCard = (
    <div
      onClick={mouse.onClick}
      onMouseEnter={mouse.onMouseEnter}
      onMouseLeave={mouse.onMouseLeave}
    >
      <Card style={styles.card}>
        <TextSyntax text={'<Component>'} style={styles.label} />
      </Card>
    </div>
  );

  return <div {...css(styles.base, props.style)}>{elCard}</div>;
};
