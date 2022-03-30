import React, { useEffect, useRef, useState } from 'react';
import { color, COLORS, css, CssValue, t, rx } from '../common';
import { CmdBar } from '../../Cmd.Bar';

/**
 * Types
 */
export type BackdropProps = {
  instance: t.CmdCardInstance;
  size: t.DomRect;
  state: t.CmdCardState;
  style?: CssValue;
};

/**
 * Component
 */
export const Backdrop: React.FC<BackdropProps> = (props) => {
  const { instance, state, size } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Flex: 'y-stretch-stretch',
      position: 'relative',
      boxSizing: 'border-box',
      backgroundColor: COLORS.DARK,
      color: COLORS.WHITE,
    }),
    top: css({
      flex: 1,
      position: 'relative',
      display: 'flex',
    }),
    bottom: css({}),
  };

  const elBody = state.backdrop.render?.({ size });

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.top}>{elBody}</div>
      <div {...styles.bottom}>
        <CmdBar instance={instance} state={state.commandbar} />
      </div>
    </div>
  );
};
