import { m } from 'framer-motion';
import React from 'react';

import { COLORS, css, CssValue, transition } from './common';
import { RecordButtonAction, RecordButtonState } from './types';

export type PausedProps = {
  isEnabled: boolean;
  width: number;
  height: number;
  state: RecordButtonState;
  style?: CssValue;
  onClick?: (e: { action: RecordButtonAction }) => void;
};

export const Paused: React.FC<PausedProps> = (props) => {
  const { isEnabled, state, width, height } = props;
  const opacity = isEnabled && state === 'paused' ? 1 : 0;

  const styles = {
    base: css({
      Absolute: 0,
      Flex: 'horizontal-stretch-stretch',
      display: 'flex',
      overflow: 'hidden',
      color: COLORS.WHITE,
      borderRadius: height,
    }),
    edge: css({
      flex: 1,
      position: 'relative',
      boxSizing: 'border-box',
      PaddingX: 12,
      paddingBottom: 2,
      Flex: 'horizontal-center-center',
      cursor: isEnabled ? 'pointer' : 'default',
      overflow: 'hidden',
    }),
    left: css({
      backgroundColor: COLORS.RED,
      marginLeft: -10,
      paddingLeft: 20,
    }),
    right: css({
      backgroundColor: COLORS.BLACK,
      marginRight: -10,
      paddingRight: 20,
      textAlign: 'right',
    }),
  };

  const clickHandler = (action: RecordButtonAction) => {
    return () => props.onClick?.({ action });
  };

  const edgeButton = (action: RecordButtonAction, label: string, style: CssValue, x: number) => {
    return (
      <m.div
        {...css(styles.edge, style)}
        onClick={clickHandler(action)}
        style={{ x }}
        animate={{ x }}
      >
        <m.div whileTap={{ y: 1 }}>{label}</m.div>
      </m.div>
    );
  };

  const offset = state === 'paused' ? 0 : width / 2;

  return (
    <m.div
      {...css(styles.base, props.style)}
      style={{ opacity }}
      animate={{ opacity }}
      transition={transition}
    >
      {edgeButton('resume', 'Resume', styles.left, 0 - offset)}
      {edgeButton('finish', 'Done', styles.right, offset)}
    </m.div>
  );
};
