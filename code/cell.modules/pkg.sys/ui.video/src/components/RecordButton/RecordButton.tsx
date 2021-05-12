import { domAnimation, LazyMotion, m } from 'framer-motion';
import React from 'react';

import { color, COLORS, css, CssValue, t, transition } from './common';
import { Paused } from './RecordButton.Paused';
import { Recording } from './RecordButton.Recording';
import { RecordButtonAction, RecordButtonClickEventHandler, RecordButtonState } from './types';
import { Background } from './RecordButton.Background';

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

  let height = size as number;
  let width = height;

  if (isEnabled) {
    if (['recording', 'paused', 'dialog'].includes(state)) width = size * 4;
    if (['dialog'].includes(state)) height = height * 5;
  }

  const styles = {
    base: css({
      position: 'relative',
      cursor: 'default',
      userSelect: 'none',
      fontSize: 14,
    }),
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
        <Background isEnabled={isEnabled} state={state} size={size} width={width} height={height} />

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
          width={width - 12}
          height={size - 12}
          style={{ Absolute: 6 }}
          onClick={(e) => handleClick(['paused'], e.action)}
        />
      </LazyMotion>
    </div>
  );
};
