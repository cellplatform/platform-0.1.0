import React from 'react';

import { COLORS, css, CssValue, R, t, CmdBar } from '../common';
import { Util } from '../Util';
import { useRenderPart } from './useRenderPart';

/**
 * Types
 */
export type BackdropProps = {
  instance: t.CmdCardInstance;
  size: t.DomRect;
  state: t.CmdCardState;
  style?: CssValue;
};

/**
 * Component
 */
export const Backdrop: React.FC<BackdropProps> = (props) => {
  const { instance, state, size } = props;
  const content = useRenderPart('Backdrop', { instance, size, state });

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Flex: 'y-stretch-stretch',
      position: 'relative',
      boxSizing: 'border-box',
      backgroundColor: COLORS.DARK,
      color: COLORS.WHITE,
    }),
    top: css({ flex: 1, position: 'relative', display: 'flex' }),
    bottom: css({}),
  };

  /**
   * Backdrop content.
   */
  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.top}>{content.render()}</div>
      <div {...styles.bottom}>
        <CmdBar
          instance={instance}
          text={state.commandbar.text}
          textbox={state.commandbar.textbox}
        />
      </div>
    </div>
  );
};

/**
 * [Memoized]
 */
export const BackdropMemo = React.memo(Backdrop, (prev, next) => {
  if (Util.instance.isChanged(prev.instance, next.instance)) return false;
  if (!R.equals(prev.size, next.size)) return false;
  if (!R.equals(prev.state.backdrop, next.state.backdrop)) return false;
  if (!R.equals(prev.state.commandbar, next.state.commandbar)) return false;
  return true;
});
