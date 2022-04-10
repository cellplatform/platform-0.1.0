import { domAnimation, LazyMotion, m } from 'framer-motion';
import React from 'react';

import { R, color, css, CssValue, t, constants } from '../common';
import { useRenderPart } from './useRenderPart';
import { Util } from '../Util';

type Milliseconds = number;

export type BodyProps = {
  instance: t.CmdCardInstance;
  size: t.DomRect;
  state: t.CmdCardState;
  duration?: Milliseconds;
  style?: CssValue;
};

export const Body: React.FC<BodyProps> = (props) => {
  const { FOOTER } = constants;
  const { instance, state, size } = props;
  const duration = (props.duration ?? 200) / 1000;

  const y = state.body.isOpen ? 0 - (size.height - FOOTER.HEIGHT) : 0;
  const { show = 'CommandBar' } = state.body;

  const content = useRenderPart('Body', { instance, size, state });

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

  return (
    <LazyMotion features={domAnimation}>
      <m.div {...css(styles.base, props.style)}>
        <m.div animate={{ y }} transition={{ duration }} {...styles.inner}>
          {content.render()}
        </m.div>
      </m.div>
    </LazyMotion>
  );
};

/**
 * [Memoized]
 */
export const BodyMemo = React.memo(Body, (prev, next) => {
  if (Util.instance.isChanged(prev.instance, next.instance)) return false;
  if (!R.equals(prev.size, next.size)) return false;
  if (!R.equals(prev.state.body, next.state.body)) return false;
  return true;
});
