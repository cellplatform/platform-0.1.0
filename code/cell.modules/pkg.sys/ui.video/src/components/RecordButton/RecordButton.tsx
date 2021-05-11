import { domAnimation, LazyMotion, m } from 'framer-motion';
import React from 'react';

import { color, COLORS, css, CssValue, t, transition } from './common';
import { Paused } from './RecordButton.Paused';
import { Recording } from './RecordButton.Recording';
import { RecordButtonAction, RecordButtonClickEventHandler, RecordButtonState } from './types';

export const RecordButtonStates: RecordButtonState[] = ['default', 'recording', 'paused'];

export type RecordButtonProps = {
  bus: t.EventBus<any>;
  stream?: MediaStream;
  size?: 45;
  state?: RecordButtonState;
  isEnabled?: boolean;
  style?: CssValue;
  onClick?: RecordButtonClickEventHandler;
};

export const RecordButton: React.FC<RecordButtonProps> = (props) => {
  const { stream } = props;
  const state = props.state ?? 'default';
  const current = state;
  const size = props.size ?? 45;
  const isEnabled = props.isEnabled ?? true;

  const height = size as number;
  let width = height;
  let borderColor = color.format(-0.2);
  let innerBgColor = isEnabled ? COLORS.RED : color.format(-0.2);

  if (isEnabled) {
    if (state === 'recording' || state === 'paused') width = size * 4;
    if (state === 'recording' || state === 'paused') borderColor = COLORS.RED;
    if (state === 'recording') innerBgColor = color.alpha(COLORS.RED, 0.1);
    if (state === 'paused') innerBgColor = color.alpha(COLORS.RED, 1);
  }

  const styles = {
    base: css({ position: 'relative', cursor: 'default', userSelect: 'none', fontSize: 14 }),
    inner: css({ position: 'relative', Flex: 'center-center', overflow: 'hidden', flex: 1 }),
  };

  const fireClick = (action?: RecordButtonAction) => {
    if (isEnabled) props.onClick?.({ current, action });
  };
  const handleClick = (state: RecordButtonState[], action?: RecordButtonAction) => {
    if (state.includes(current)) fireClick(action);
  };

  return (
    <div {...css(styles.base, props.style)} onClick={() => handleClick(['default', 'recording'])}>
      <LazyMotion features={domAnimation}>
        <m.div
          style={{
            display: 'flex',
            boxSizing: 'border-box',
            borderRadius: size,
            borderStyle: 'solid',
            borderColor,
            borderWidth: 3,
            padding: 3,
            width,
            height: size,
          }}
          animate={{ width, borderColor }}
          transition={transition}
        >
          <m.div
            style={{ borderRadius: size, backgroundColor: innerBgColor }}
            animate={{ borderColor, backgroundColor: innerBgColor }}
            {...styles.inner}
          />
        </m.div>

        <Recording
          stream={stream}
          state={state}
          isEnabled={isEnabled}
          width={width - 12}
          style={{ Absolute: 6 }}
          onClick={() => handleClick(['recording'])}
        />

        <Paused
          state={state}
          isEnabled={isEnabled}
          size={size}
          style={{ Absolute: 6 }}
          onClick={(e) => handleClick(['paused'], e.action)}
        />
      </LazyMotion>
    </div>
  );
};
