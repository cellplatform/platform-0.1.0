import React, { useEffect, useState } from 'react';
import { Icons, css, color, COLORS, CssValue, Button } from './common';

import { TextInput as TextInputCore, TextInputProps } from '@platform/ui.text';

/**
 * Low level text input
 */
export const TextInput: React.FC<TextInputProps> = (props) => {
  return (
    <TextInputCore
      valueStyle={{ color: COLORS.DARK }}
      placeholderStyle={{ italic: true, opacity: 0.3 }}
      {...props}
    />
  );
};

/**
 * Textbox
 */
export type TextboxProps = {
  value?: string;
  placeholder?: string;
  enter?: { icon?: JSX.Element; handler?: () => void };
  style?: CssValue;
  onChange?: TextInputProps['onChange'];
};
export const Textbox: React.FC<TextboxProps> = (props) => {
  const styles = {
    base: css({ Flex: 'horiziontal-stretch-stretch' }),
    input: css({ flex: 1, borderBottom: `dashed 1px ${color.format(-0.1)}` }),
  };

  const handleEnter = () => {
    const handler = props.enter?.handler;
    if (handler) handler();
  };

  const elEnterIcon = props.enter?.icon && (
    <Button onClick={handleEnter}>{props.enter.icon}</Button>
  );

  return (
    <div {...css(styles.base, props.style)}>
      <TextInput
        placeholder={props.placeholder}
        value={props.value}
        style={styles.input}
        onEnter={handleEnter}
        onChange={props.onChange}
      />
      {elEnterIcon}
    </div>
  );
};
