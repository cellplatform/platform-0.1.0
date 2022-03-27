import React, { useEffect, useRef, useState } from 'react';
import { color, COLORS, css, CssValue, t } from '../../common';
import { CmdCard } from '..';

export type DevSidePanelProps = {
  top?: JSX.Element;
  style?: CssValue;
};

export const DevSidePanel: React.FC<DevSidePanelProps> = (props) => {
  const {} = props;
  const SPACING = 15;

  /**
   * [Render]
   */
  const styles = {
    base: css({ Absolute: [0, 0, 0, null], width: 1, display: 'flex' }),
    body: css({
      flex: 1,
      position: 'relative',
      marginLeft: SPACING,
      MarginY: SPACING,
      minWidth: 250,
      fontSize: 11,
      boxSizing: 'border-box',
      Flex: 'y-stretch-stretch',
    }),
    block: css({
      padding: 10,
      backgroundColor: 'rgba(255, 0, 0, 0.06)' /* RED */,
    }),
    top: css({ flex: 1, marginBottom: 5 }),
    bottom: css({ flex: 1 }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>
        <div {...css(styles.top, styles.block)}>{props.top}</div>
        <div {...css(styles.bottom, styles.block)}>[TODO] bottom - {'<EventList>'}</div>
      </div>
    </div>
  );
};
