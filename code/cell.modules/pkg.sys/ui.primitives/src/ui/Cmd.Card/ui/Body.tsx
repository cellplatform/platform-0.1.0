import { domAnimation, LazyMotion, m } from 'framer-motion';
import React from 'react';

import { R, color, css, CssValue, t, constants } from '../common';

type Milliseconds = number;

export type BodyProps = {
  instance: t.CmdCardInstance;
  state: t.CmdCardState;
  size: t.DomRect;
  duration?: Milliseconds;
  style?: CssValue;
};

export const Body: React.FC<BodyProps> = (props) => {
  const { FOOTER } = constants;
  const { state, size } = props;
  const duration = (props.duration ?? 200) / 1000;

  const { show = 'CommandBar' } = state.body;
  console.log('show', show);

  const y = state.body.isOpen ? 0 - (size.height - FOOTER.HEIGHT) : 0;

  /**
   * [Render]
   */
  const styles = {
    base: css({ pointerEvents: 'none' }),
    inner: css({
      pointerEvents: 'auto',
      position: 'relative',
      height: size.height - FOOTER.HEIGHT,
      backgroundColor: color.format(1),
      display: 'flex',
    }),
  };

  /**
   * Body content.
   */
  const elContent = state.body.render?.({ size });

  return (
    <LazyMotion features={domAnimation}>
      <m.div {...css(styles.base, props.style)}>
        <m.div animate={{ y }} transition={{ duration }} {...styles.inner}>
          {elContent}
        </m.div>
      </m.div>
    </LazyMotion>
  );
};

/**
 * [Memoized]
 */
export const BodyMemo = React.memo(Body, (prev, next) => {
  if (!R.equals(prev.size, next.size)) return false;
  if (!R.equals(prev.state.body, next.state.body)) return false;
  return true;
});
