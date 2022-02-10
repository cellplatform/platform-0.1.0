import React from 'react';

import { color, COLORS, css, CssValue, t, Card } from './DEV.common';
import { Toolbar } from '../primitives';

/**
 * TODO 🐷
 * - Factor <DevEventBusCard> into root `web.ui` folder
 */

export type DevChildCardProps = {
  children?: React.ReactNode;
  bus: t.EventBus<any>;
  netbus: t.PeerNetbus<any>;
  title?: string | JSX.Element;
  style?: CssValue;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
};

export const DevChildCard: React.FC<DevChildCardProps> = (props) => {
  const { bus, netbus, title = 'Untitled', minWidth, maxWidth, width } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      Flex: 'x-stretch-stretch',
      boxSizing: 'border-box',
      width,
      minWidth,
      maxWidth,
    }),
    titlebar: {
      label: css({}),
    },
    card: css({ flex: 1, Flex: 'y-stretch-stretch' }),
    main: css({ flex: 1, position: 'relative', Flex: 'y-stretch-stretch' }),
    body: {
      base: css({ flex: 1 }),
      content: css({
        Padding: [10, 15],
        Flex: 'y-center-center',
      }),
    },
    divider: {
      base: css({ Flex: 'y-center-center', width: 30 }),
      bar: css({ width: '100%', borderTop: `solid 12px ${color.alpha(COLORS.DARK, 0.1)}` }),
    },
  };

  const elDivider = (
    <div {...styles.divider.base}>
      <div {...styles.divider.bar} />
    </div>
  );

  const elMain = (
    <Card style={styles.card}>
      <div {...styles.main}>
        <Toolbar edge={'N'}>
          <div {...styles.titlebar.label}>{title}</div>
        </Toolbar>
        <div {...styles.body.base}>
          <div {...styles.body.content}>{props.children}</div>
        </div>
        <Toolbar edge={'S'}>
          <div>footer</div>
        </Toolbar>
      </div>
    </Card>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elDivider}
      {elMain}
    </div>
  );
};
