import React from 'react';

import { css, CssValue, t, useResizeObserver, DEFAULT } from '../common';
import { BackdropMemo } from './Backdrop';
import { BodyMemo } from './Body';

/**
 * Types
 */
export type CmdCardLayoutProps = {
  instance: t.CmdCardInstance;
  state: t.CmdCardState;
  borderRadius?: number | string;
  resize?: t.ResizeObserverHook;
  minimized?: boolean;
  style?: CssValue;
};

/**
 * Component
 */
export const CmdCardLayout: React.FC<CmdCardLayoutProps> = (props) => {
  const { instance, state, borderRadius, minimized = false } = props;
  const resize = useResizeObserver({ root: props.resize });
  const size = resize.rect;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      overflow: 'hidden',
      borderRadius,
      height: minimized ? DEFAULT.FOOTER.HEIGHT : undefined,
    }),
    body: css({
      Absolute: 0,
      display: minimized ? 'none' : 'block',
    }),
    backdrop: css({ Absolute: 0 }),
  };

  const elBody = resize.ready && (
    <BodyMemo instance={instance} state={state} size={size} style={styles.body} />
  );

  const elBackdrop = resize.ready && (
    <BackdropMemo
      instance={instance}
      state={state}
      size={size}
      minimized={minimized}
      style={styles.backdrop}
    />
  );

  return (
    <div ref={resize.ref} {...css(styles.base, props.style)}>
      {elBackdrop}
      {elBody}
    </div>
  );
};
