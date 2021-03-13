import React, { useEffect, useRef, useState } from 'react';

import { color, COLORS, css, t, useActionItemMonitor } from '../common';
import { Button, Icons, TextInput } from '../Primitives';
import { Layout, LayoutTitle } from './Layout';

export type TextboxProps = {
  namespace: string;
  bus: t.EventBus<t.Event<any>>;
  item: t.ActionTextbox;
};

export const Textbox: React.FC<TextboxProps> = (props) => {
  const { namespace } = props;
  const bus = props.bus.type<t.DevActionEvent>();

  const model = useActionItemMonitor({ bus: props.bus, item: props.item });
  const { title, placeholder, description, isSpinning } = model;
  const isActive = model.handlers.length > 0;
  const current = model.current;

  const [pendingValue, setPendingValue] = useState<string | undefined>();
  const isPending = pendingValue !== undefined;

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    setPendingValue(undefined);
  }, [current]); // Reset pending when model's [current] value is updated (eg. by a handler)
  const value = isPending ? pendingValue : current;

  const fire = (args: { action: t.ActionTextboxChangeType; next?: string }) => {
    const { next, action } = args;
    const changing = typeof next === 'string' ? { next, action } : undefined;
    const item = model;
    bus.fire({
      type: 'dev:action/Textbox',
      payload: { namespace, item, action, changing },
    });
  };

  const fireInvoke = () => {
    if (isPending) {
      const next = pendingValue || '';
      fire({ action: 'invoke', next });
    }
  };

  const styles = {
    base: css({
      boxSizing: 'border-box',
    }),
    textbox: css({
      position: 'relative',
      borderBottom: `dashed 1px ${color.format(-0.2)}`,
      paddingBottom: 2,
      top: -2,
    }),
    send: css({ marginLeft: 4 }),
  };

  const elTextbox = (
    <div {...styles.textbox} title={value ? placeholder : undefined}>
      <TextInput
        ref={inputRef}
        value={value || ''}
        placeholder={placeholder}
        valueStyle={{ fontFamily: 'monospace', fontWeight: 'NORMAL' }}
        placeholderStyle={{ fontFamily: 'sans-serif', italic: true, color: color.format(-0.3) }}
        disabledOpacity={1}
        spellCheck={false}
        autoCorrect={false}
        autoCapitalize={false}
        isEnabled={model.handlers.length > 0}
        onChange={(e) => setPendingValue(() => e.to)}
        onEscape={() => setPendingValue(() => undefined)}
        onEnter={fireInvoke}
        onFocus={() => inputRef.current?.selectAll()}
      />
    </div>
  );

  const iconColor = isPending ? COLORS.BLUE : color.alpha(COLORS.DARK, 0.4);

  const elRight = (
    <div {...styles.send} onClick={fireInvoke}>
      <Button isEnabled={isPending}>
        <Icons.Send size={18} color={iconColor} />
      </Button>
    </div>
  );

  const elTitle = title && <LayoutTitle>{title}</LayoutTitle>;

  return (
    <Layout
      isActive={isActive}
      isSpinning={isSpinning}
      label={elTextbox}
      description={description}
      pressOffset={0}
      icon={{ Component: Icons.Text, color: iconColor }}
      ellipsis={false}
      top={elTitle}
      right={elRight}
    />
  );
};
