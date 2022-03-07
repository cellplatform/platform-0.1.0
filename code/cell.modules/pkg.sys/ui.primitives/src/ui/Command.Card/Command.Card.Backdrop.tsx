import React, { useEffect, useRef, useState } from 'react';
import { color, COLORS, css, CssValue, t } from '../../common';
import { CommandBar } from '../Command.Bar';

/**
 * Types
 */
export type CommandCardBackdropProps = {
  bus: t.EventBus<any>;
  style?: CssValue;
};

/**
 * Component
 */
export const CommandCardBackdrop: React.FC<CommandCardBackdropProps> = (props) => {
  const { bus } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      Flex: 'y-stretch-stretch',
      backgroundColor: COLORS.DARK,
      borderRadius: 4,
      color: COLORS.WHITE,
      boxSizing: 'border-box',
    }),
    top: css({
      flex: 1,
      padding: 20, // TEMP 🐷
    }),
    bottom: css({}),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.top}>top</div>
      <div {...styles.bottom}>
        <CommandBar bus={bus} />
      </div>
    </div>
  );
};
