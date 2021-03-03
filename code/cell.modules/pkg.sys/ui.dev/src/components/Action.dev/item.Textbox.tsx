import React, { useEffect, useState, useRef } from 'react';

import { color, COLORS, css, t, useActionItemMonitor } from '../common';
import { TextInput } from '../Primitives';
import { ItemLayout } from './ItemLayout';

export type TextboxProps = {
  namespace: string;
  bus: t.EventBus<t.Event<any>>;
  item: t.ActionTextbox;
};

export const Textbox: React.FC<TextboxProps> = (props) => {
  const { namespace } = props;
  const model = useActionItemMonitor({ bus: props.bus, item: props.item });
  const bus = props.bus.type<t.DevActionEvent>();
  const { placeholder, description, isSpinning } = model;
  const isActive = model.handlers.length > 0;
  const current = model.current;

  const inputRef = useRef<TextInput>(null);

  const [pendingValue, setPendingValue] = useState<string | undefined>();
  const isPending = pendingValue !== undefined;

  useEffect(() => setPendingValue(undefined), [current]); // Reset pending when model's [current] value is updated (eg. by a handler)
  const value = isPending ? pendingValue : current;
  const iconColor = isPending ? COLORS.BLUE : color.alpha(COLORS.DARK, 0.4);

  const fire = (args: { action: t.ActionTextboxChangeType; next?: string }) => {
    const { next, action } = args;
    const changing = typeof next === 'string' ? { next, action } : undefined;
    const item = model;
    bus.fire({
      type: 'dev:action/Textbox',
      payload: { namespace, item, action, changing },
    });
  };

  const styles = {
    textbox: {
      outer: css({
        position: 'relative',
        borderBottom: `solid 1px ${color.format(-0.1)}`,
        paddingBottom: 2,
        top: -2,
      }),
    },
  };

  const elTextbox = (
    <div {...styles.textbox.outer} title={value ? placeholder : undefined}>
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
        onChange={(e) => setPendingValue(e.to)}
        onEscape={() => setPendingValue(undefined)}
        onEnter={() => fire({ action: 'invoke', next: value || '' })}
        onFocus={() => inputRef.current?.selectAll()}
      />
    </div>
  );

  return (
    <ItemLayout
      isActive={isActive}
      isSpinning={isSpinning}
      label={elTextbox}
      description={description}
      pressOffset={0}
      ellipsis={false}
      iconColor={iconColor}
      onClick={() => inputRef.current?.focus()}
    />
  );
};
