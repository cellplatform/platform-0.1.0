import React from 'react';
import { css, CssValue } from '../../common';

export type DevSidePanelProps = {
  top?: JSX.Element;
  bottom?: JSX.Element;
  width?: number;
  style?: CssValue;
};

export const DevSidePanel: React.FC<DevSidePanelProps> = (props) => {
  const { width } = props;
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
      minWidth: width,
      fontSize: 11,
      boxSizing: 'border-box',
      Flex: 'y-stretch-stretch',
    }),
    block: css({ position: 'relative', display: 'flex' }),
    top: css({ flex: 1, marginBottom: 5 }),
    bottom: css({ flex: 1 }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>
        <div {...css(styles.top, styles.block)}>{props.top}</div>
        <div {...css(styles.bottom, styles.block)}>{props.bottom}</div>
      </div>
    </div>
  );
};
