import React, { useEffect, useRef, useState } from 'react';

import { css, CssValue, t, FC } from './common';
import { CommandCardBackdrop } from './components/Backdrop';

/**
 * Types
 */
export type CommandCardLayoutProps = {
  bus: t.EventBus<any>;
  style?: CssValue;
};

/**
 * Component
 */
export const CommandCardLayout: React.FC<CommandCardLayoutProps> = (props) => {
  const { bus } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative' }),
    backdrop: css({ Absolute: 0 }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <CommandCardBackdrop bus={bus} style={styles.backdrop} />
    </div>
  );
};
