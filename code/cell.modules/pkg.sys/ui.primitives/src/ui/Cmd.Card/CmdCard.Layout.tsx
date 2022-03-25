import { AnimatePresence, domAnimation, LazyMotion, m } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';

import { color, css, CssValue, t, useResizeObserver } from './common';
import { Backdrop } from './components/Backdrop';

/**
 * Types
 */
export type CmdCardLayoutProps = {
  bus: t.EventBus<any>;
  isOpen?: boolean;
  style?: CssValue;
};

/**
 * Component
 */
export const CmdCardLayout: React.FC<CmdCardLayoutProps> = (props) => {
  const { bus, isOpen } = props;

  const resize = useResizeObserver<HTMLDivElement>();
  const size = resize.rect;

  const FOOTER = 38;
  const duration = 200 / 1000;
  const y = isOpen ? 0 - (size.height - FOOTER) : 0;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      borderRadius: 4,
      overflow: 'hidden',
    }),
    backdrop: css({ Absolute: 0 }),
    body: {
      base: css({
        Absolute: 0,
        pointerEvents: 'none',
      }),
      main: css({
        height: size.height - FOOTER,
        backgroundColor: color.format(1),
        pointerEvents: 'auto',
        Flex: 'center-center', // TEMP 🐷
      }),
    },
  };

  /**
   * TODO 🐷
   */
  const elBody = resize.ready && (
    <LazyMotion features={domAnimation}>
      <m.div {...styles.body.base}>
        <m.div animate={{ y }} transition={{ duration }} {...styles.body.main}>
          main
        </m.div>
      </m.div>
    </LazyMotion>
  );

  return (
    <div ref={resize.ref} {...css(styles.base, props.style)}>
      <Backdrop bus={bus} style={styles.backdrop} />
      {elBody}
    </div>
  );
};
