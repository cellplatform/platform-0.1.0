import React, { useEffect, useRef, useState } from 'react';

import { css, CssValue, t } from '../../common';
import { CommandCardBackdrop } from './Command.Card.Backdrop';

/**
 * Types
 */
export type CommandCardProps = {
  bus: t.EventBus<any>;
  style?: CssValue;
};

/**
 * Component
 */
export const CommandCard: React.FC<CommandCardProps> = (props) => {
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
