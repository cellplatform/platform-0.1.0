import { domAnimation, LazyMotion, m } from 'framer-motion';
import React from 'react';

import { color, css, CssValue, t, useResizeObserver, rx } from '../common';
import { Backdrop } from './Backdrop';
import { Card, CardProps } from '../../Card';

/**
 * Types
 */
export type CmdCardLayoutProps = {
  event: t.CmdCardBusArgs;
  // state?: t.CmdCardState;

  bus?: t.EventBus<any>;

  isOpen?: boolean;
  // withinCard?: boolean | CardProps;
  borderRadius?: number | string;
  renderBody?: t.CmdCardRender;
  renderBackdrop?: t.CmdCardRender;
  style?: CssValue;
};

/**
 * Component
 */
export const CmdCardLayout: React.FC<CmdCardLayoutProps> = (props) => {
  const { bus, isOpen, borderRadius } = props;

  const resize = useResizeObserver();
  const size = resize.rect;

  const FOOTER = { HEIGHT: 38 };
  const duration = 200 / 1000;
  const y = isOpen ? 0 - (size.height - FOOTER.HEIGHT) : 0;

  // const cardProps: CardProps = typeof props.withinCard === 'object' ? props.withinCard : {};

  // const TMP_BUS = rx.bus();
  // const bus = TMP_BUS; // TEMP 🐷

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      overflow: 'hidden',
      borderRadius,
    }),
    backdrop: css({ Absolute: 0 }),
    body: {
      base: css({ Absolute: 0, pointerEvents: 'none' }),
      inner: css({
        position: 'relative',
        height: size.height - FOOTER.HEIGHT,
        backgroundColor: color.format(1),
        pointerEvents: 'auto',
      }),
    },
  };

  const elBodyContent = props.renderBody?.({ size });
  const elBackdropContent = props.renderBackdrop?.({ size });

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
