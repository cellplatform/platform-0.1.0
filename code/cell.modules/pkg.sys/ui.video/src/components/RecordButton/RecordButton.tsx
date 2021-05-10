import { domAnimation, LazyMotion, m } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';

import { color, css, CssValue, t } from '../../common';
import { AudioWaveform } from '../AudioWaveform';
import { Icons } from '../Icons';
import { RecordButtonAction, RecordButtonState, RecordButtonClickEventHandler } from './types';

const COLORS = {
  WHITE: '#fff',
  RED: '#EC4838',
};

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

  const styles = {
    base: css({ position: 'relative', cursor: 'default', userSelect: 'none', fontSize: 14 }),
    inner: css({ position: 'relative', Flex: 'center-center', overflow: 'hidden' }),
    fill: css({ Absolute: 0, Flex: 'center-center' }),
    recording: {
      waveform: css({ MarginX: 20 }),
    },
    paused: {
      base: css({ Flex: 'horizontal-spaceBetween-center', MarginX: 20 }),
      label: state === 'paused' && css({ cursor: 'pointer' }),
    },
  };

  let width = size as number;
  let borderColor = color.format(-0.2);
  let innerBgColor = isEnabled ? COLORS.RED : color.format(-0.2);

  if (isEnabled) {
    if (state === 'recording' || state === 'paused') width = size * 4;
    if (state === 'recording' || state === 'paused') borderColor = COLORS.RED;
    if (state === 'recording') innerBgColor = color.alpha(COLORS.RED, 0.1);
    if (state === 'paused') innerBgColor = color.alpha(COLORS.RED, 1);
  }

  const iconOpacity = state === 'recording' ? 1 : 0;
  const waveformOpacity = state === 'recording' ? 1 : 0;
  const resumeOpacity = state === 'paused' ? 1 : 0;

  const fireClick = (action?: RecordButtonAction) => {
    if (isEnabled) props.onClick?.({ current, action });
  };
  const clickHandler = (state: RecordButtonState[], action?: RecordButtonAction) => {
    if (state.includes(current)) fireClick(action);
  };

  return (
    <div {...css(styles.base, props.style)} onClick={() => clickHandler(['default', 'recording'])}>
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
        >
          <m.div
            style={{ borderRadius: size, backgroundColor: innerBgColor, flex: 1 }}
            animate={{ borderColor, backgroundColor: innerBgColor }}
            {...styles.inner}
          />
        </m.div>

        <m.div
          {...styles.fill}
          style={{ opacity: waveformOpacity }}
          animate={{ opacity: waveformOpacity }}
        >
          {isEnabled && stream && (
            <AudioWaveform
              width={width}
              height={40}
              stream={stream}
              lineColor={color.alpha(COLORS.RED, 0.3)}
            />
          )}
        </m.div>

        <m.div
          {...css(styles.fill, styles.recording.waveform)}
          style={{ opacity: iconOpacity }}
          animate={{ opacity: iconOpacity }}
        >
          <Icons.Player.Pause color={COLORS.RED} size={28} />
        </m.div>

        <m.div
          {...css(styles.fill, styles.paused.base)}
          style={{ opacity: resumeOpacity, color: COLORS.WHITE }}
          animate={{ opacity: resumeOpacity }}
        >
          <div {...styles.paused.label} onClick={() => clickHandler(['paused'], 'resume')}>
            Resume
          </div>
          <div />
          <div {...styles.paused.label} onClick={() => clickHandler(['paused'], 'finish')}>
            Finish
          </div>
        </m.div>
      </LazyMotion>
    </div>
  );
};
