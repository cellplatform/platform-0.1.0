import React, { useEffect, useRef, useState } from 'react';

import { css, CssValue, t } from './common';
import { Backdrop } from './components/Backdrop';

/**
 * Types
 */
export type CmdCardLayoutProps = {
  bus: t.EventBus<any>;
  style?: CssValue;
};

/**
 * Component
 */
export const CmdCardLayout: React.FC<CmdCardLayoutProps> = (props) => {
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
      <Backdrop bus={bus} style={styles.backdrop} />
    </div>
  );
};
