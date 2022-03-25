import React, { useEffect, useRef, useState } from 'react';
import { color, COLORS, css, CssValue, t } from '../common';
import { CmdBar } from '../../Cmd.Bar';

/**
 * Types
 */
export type BackdropProps = {
  bus: t.EventBus<any>;
  style?: CssValue;
};

/**
 * Component
 */
export const Backdrop: React.FC<BackdropProps> = (props) => {
  const { bus } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      Flex: 'y-stretch-stretch',
      backgroundColor: COLORS.DARK,
      color: COLORS.WHITE,
      boxSizing: 'border-box',
    }),
    top: css({
      flex: 1,
      position: 'relative',
      display: 'flex',
    }),
    bottom: css({}),
  };

  const elBody = props.children;

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.top}>{elBody}</div>
      <div {...styles.bottom}>
        <CmdBar bus={bus} />
      </div>
    </div>
  );
};
