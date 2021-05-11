import { m } from 'framer-motion';
import React from 'react';

import { COLORS, css, CssValue, transition } from './common';
import { RecordButtonAction, RecordButtonState } from './types';

export type PausedProps = {
  isEnabled: boolean;
  size: number;
  state: RecordButtonState;
  style?: CssValue;
  onClick?: (e: { action: RecordButtonAction }) => void;
};

export const Paused: React.FC<PausedProps> = (props) => {
  const { isEnabled, state, size } = props;
  const opacity = isEnabled && state === 'paused' ? 1 : 0;

  const styles = {
    base: css({
      Absolute: 0,
      display: 'flex',
      Flex: 'horizontal-stretch-stretch',
      color: COLORS.WHITE,
      overflow: 'hidden',
      borderRadius: size,
    }),
    edge: css({
      boxSizing: 'border-box',
      PaddingX: 12,
      Flex: 'horizontal-center-center',
      cursor: isEnabled ? 'pointer' : 'default',
      overflow: 'hidden',
    }),
    left: css({ flex: 1 }),
    right: css({ flex: 1, backgroundColor: COLORS.BLACK, textAlign: 'right' }),
    body: css({}),
  };

  const clickHandler = (action: RecordButtonAction) => {
    return () => props.onClick?.({ action });
  };

  const edgeButton = (action: RecordButtonAction, label: string, style: CssValue) => {
    return (
      <m.div {...css(styles.edge, style)} onClick={clickHandler(action)}>
        <m.div whileTap={{ y: 1 }}>{label}</m.div>
      </m.div>
    );
  };

  return (
    <m.div
      {...css(styles.base, props.style)}
      style={{ opacity }}
      animate={{ opacity }}
      transition={transition}
    >
      {edgeButton('resume', 'Resume', styles.left)}
      {edgeButton('finish', 'Finish', styles.right)}
    </m.div>
  );
};
