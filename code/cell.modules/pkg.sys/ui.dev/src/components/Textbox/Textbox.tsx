import React, { useState } from 'react';

import { color, css, CssValue } from '../common';
import { Button, TextInput, TextInputProps } from '../Primitives';

type P = TextInputProps;

export type TextboxEnterIcon = (args: TextboxEnterIconArgs) => JSX.Element;
export type TextboxEnterIconArgs = {
  isFocused: boolean;
  value: string | undefined;
};

export type TextboxProps = {
  value?: string;
  placeholder?: string;
  enter?: {
    icon?: JSX.Element | TextboxEnterIcon;
    handler?: () => void;
  };
  style?: CssValue;
  onChange?: P['onChange'];
  onEnter?: P['onEnter'];
  onEscape?: P['onEscape'];
  onFocus?: P['onFocus'];
  onBlur?: P['onBlur'];
};

export const Textbox: React.FC<TextboxProps> = (props) => {
  const { enter, value } = props;
  const [isFocused, setFocused] = useState<boolean>(false);

  const styles = {
    base: css({ Flex: 'horiziontal-stretch-stretch' }),
    input: css({
      flex: 1,
      borderBottom: `dashed 1px ${color.format(-0.15)}`,
    }),
  };

  const onEnter: P['onEnter'] = (e) => {
    if (props.onEnter) props.onEnter(e);
    enterHandler();
  };

  const focusHandler = (isFocused: boolean, handler?: P['onFocus'] | P['onBlur']) => {
    return (event: React.FocusEvent<HTMLInputElement>) => {
      setFocused(isFocused);
      if (handler) handler(event);
    };
  };

  const enterHandler = () => {
    const handler = props.enter?.handler;
    if (handler) handler();
  };

  const renderIcon = () => {
    if (!enter?.icon) return undefined;
    if (typeof enter.icon === 'function') return enter.icon({ isFocused, value });
    return enter.icon;
  };

  const elEnterIcon = enter?.icon && <Button onClick={enterHandler}>{renderIcon()}</Button>;

  return (
    <div {...css(styles.base, props.style)}>
      <TextInput
        value={value}
        placeholder={props.placeholder}
        style={styles.input}
        placeholderStyle={{ opacity: 0.3, italic: true }}
        onEnter={onEnter}
        onChange={props.onChange}
        onEscape={props.onEscape}
        onFocus={focusHandler(true, props.onFocus)}
        onBlur={focusHandler(false, props.onBlur)}
      />
      {elEnterIcon}
    </div>
  );
};
