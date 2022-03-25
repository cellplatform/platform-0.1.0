import { domAnimation, LazyMotion, m } from 'framer-motion';
import React from 'react';

import { color, css, CssValue, t, useResizeObserver } from '../common';
import { Backdrop } from './Backdrop';

/**
 * Types
 */
export type CmdCardLayoutProps = {
  bus: t.EventBus<any>;
  isOpen?: boolean;
  style?: CssValue;
  renderBody?: t.CmdCardRender;
  renderBackdrop?: t.CmdCardRender;
};

/**
 * Component
 */
export const CmdCardLayout: React.FC<CmdCardLayoutProps> = (props) => {
  const { bus, isOpen } = props;

  const resize = useResizeObserver();
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
      base: css({ Absolute: 0, pointerEvents: 'none' }),
      inner: css({
        position: 'relative',
        height: size.height - FOOTER,
        backgroundColor: color.format(1),
        pointerEvents: 'auto',
      }),
    },
  };

  const elBodyContent = props.renderBody?.({ size });
  const elBackdropContent = props.renderBackdrop?.({ size });

  /**
   * TODO 🐷
   */
  const elBody = resize.ready && (
    <LazyMotion features={domAnimation}>
      <m.div {...styles.body.base}>
        <m.div animate={{ y }} transition={{ duration }} {...styles.body.inner}>
          {elBodyContent}
        </m.div>
      </m.div>
    </LazyMotion>
  );

  const elBackdrop = resize.ready && (
    <Backdrop bus={bus} style={styles.backdrop}>
      {elBackdropContent}
    </Backdrop>
  );

  return (
    <div ref={resize.ref} {...css(styles.base, props.style)}>
      {elBackdrop}
      {elBody}
    </div>
  );
};
