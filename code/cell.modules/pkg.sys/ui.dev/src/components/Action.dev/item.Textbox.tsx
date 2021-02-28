import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, useActionItemMonitor, DEFAULT } from '../common';
import { TextInput } from '../Primitives';
import { Icons } from '../Icons';
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

  const [pendingValue, setPendingValue] = useState<string | undefined>();

  const value = pendingValue !== undefined ? pendingValue : model.current;

  const fire = (args: { action: t.ActionTextboxChangeType; next?: string }) => {
    const { next, action } = args;
    const changing = typeof next === 'string' ? { next, action } : undefined;

    bus.fire({
      type: 'dev:action/Textbox',
      payload: {
        namespace,
        item: model,
        action,
        changing,
      },
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

  // const
  const elTextbox = (
    <div {...styles.textbox.outer} title={!value ? placeholder : undefined}>
      <TextInput
        value={value || ''}
        placeholder={placeholder}
        valueStyle={{ fontFamily: 'monospace', fontWeight: 'NORMAL' }}
        placeholderStyle={{ fontFamily: 'sans-serif', italic: true, color: color.format(-0.3) }}
        spellCheck={false}
        autoCorrect={false}
        autoCapitalize={false}
        onChange={(e) => {
          setPendingValue(e.to);
        }}
        onEnter={() => {
          fire({ action: 'invoke', next: value || '' });
        }}
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
    />
  );
};
