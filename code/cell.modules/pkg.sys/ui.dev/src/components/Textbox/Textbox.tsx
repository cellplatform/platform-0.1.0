import React, { useState } from 'react';

import { color, css, CssValue } from '../common';
import { Button, TextInput, TextInputProps } from '../Primitives';

type P = TextInputProps;

export type TextboxDisplayFormat = 'sans-serif' | 'monospace';
export const TextboxDisplayForamts: TextboxDisplayFormat[] = ['sans-serif', 'monospace'];

export type TextboxEnterIcon = (args: TextboxEnterIconArgs) => JSX.Element;
export type TextboxEnterIconArgs = {
  isFocused: boolean;
  value: string | undefined;
};

export type TextboxProps = {
  enter?: { icon?: JSX.Element | TextboxEnterIcon; handler?: () => void };
  displayFormat?: TextboxDisplayFormat;

  // From <TextInpu>
  value?: P['value'];
  valueStyle?: P['valueStyle'];
  placeholder?: P['placeholder'];
  placeholderStyle?: P['placeholderStyle'];

  disabledOpacity?: P['disabledOpacity'];
  isEnabled?: P['isEnabled'];
  isPassword?: P['isPassword'];
  isReadOnly?: P['isReadOnly'];

  autoCapitalize?: P['autoCapitalize'];
  autoComplete?: P['autoComplete'];
  autoCorrect?: P['autoCorrect'];
  spellCheck?: P['spellCheck'];
  autoSize?: P['autoSize'];
  focusAction?: P['focusAction'];
  focusOnLoad?: P['focusOnLoad'];

  style?: CssValue;

  onChange?: P['onChange'];
  onEnter?: P['onEnter'];
  onEscape?: P['onEscape'];
  onFocus?: P['onFocus'];
  onBlur?: P['onBlur'];
};

export const Textbox: React.FC<TextboxProps> = (props) => {
  const { enter, value, displayFormat = 'sans' } = props;
  const [isFocused, setFocused] = useState<boolean>(false);

  const isMonospace = displayFormat === 'monospace';
  const isSans = displayFormat === 'sans';

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

  const fontFamily = isMonospace ? 'monospace' : 'sans-serif';
  const styles = {
    base: css({ Flex: 'horiziontal-stretch-stretch' }),
    input: css({
      flex: 1,
      borderBottom: `dashed 1px ${color.format(-0.15)}`,
    }),
  };

  const elEnterIcon = enter?.icon && <Button onClick={enterHandler}>{renderIcon()}</Button>;

  return (
    <div {...css(styles.base, props.style)}>
      <TextInput
        {...props}
        value={value}
        placeholder={props.placeholder}
        valueStyle={{ fontFamily }}
        placeholderStyle={{ opacity: 0.3, italic: true }}
        onEnter={onEnter}
        onChange={props.onChange}
        onEscape={props.onEscape}
        onFocus={focusHandler(true, props.onFocus)}
        onBlur={focusHandler(false, props.onBlur)}
        style={styles.input}
      />
      {elEnterIcon}
    </div>
  );
};
