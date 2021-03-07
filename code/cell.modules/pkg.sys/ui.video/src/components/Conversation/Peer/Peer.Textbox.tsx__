import React, { useEffect, useRef, useState } from 'react';
import { css, CssValue, t, color, defaultValue, cuid, PeerJS } from '../common';
import { TextInput, Button } from '../../Primitives';
import { Icons } from '../../Icons';

export type PeerTextboxProps = {
  value?: string;
  isSelf?: boolean;

  style?: CssValue;
  onEnter?: () => void;
  onChange?: (e: { value: string }) => void;
};

export const PeerTextbox: React.FC<PeerTextboxProps> = (props) => {
  const styles = { base: css({}) };
  return (
    <div {...css(styles.base, props.style)}>
      <TextInput
        value={props.value}
        placeholder={'Connect to peer ("id")'}
        valueStyle={{ fontFamily: 'sans-serif', fontSize: 14 }}
        placeholderStyle={{ italic: true, color: color.format(-0.3) }}
        disabledOpacity={1}
        onChange={(e) => {
          if (props.onChange) props.onChange({ value: e.to || '' });
        }}
        spellCheck={false}
        isEnabled={!props.isSelf}
        onEnter={props.onEnter}
      />
    </div>
  );
};
