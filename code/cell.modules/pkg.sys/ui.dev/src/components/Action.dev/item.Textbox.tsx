import React, { useEffect, useState } from 'react';

import { color, COLORS, css, t, useActionItemMonitor } from '../common';
import { Icons } from '../Primitives';
import { Layout, LayoutTitle } from './Layout';
import { Textbox as TextboxCore } from '../Textbox';

export type TextboxProps = {
  namespace: string;
  bus: t.EventBus<t.Event<any>>;
  item: t.ActionTextbox;
};

export const Textbox: React.FC<TextboxProps> = (props) => {
  const { namespace } = props;
  const bus = props.bus as t.EventBus<t.DevActionEvent>;

  const model = useActionItemMonitor({ bus: props.bus, item: props.item });
  const { title, placeholder, description, isSpinning, indent } = model;
  const isActive = model.handlers.length > 0;
  const current = model.current;

  const [pendingValue, setPendingValue] = useState<string | undefined>();
  const isPending = pendingValue !== undefined;

  useEffect(() => {
    setPendingValue(undefined);
  }, [current]); // Reset pending when model's [current] value is updated (eg. by a handler)
  const value = isPending ? pendingValue : current;

  const fire = (args: { action: t.ActionTextboxChangeType; next?: string }) => {
    const { next, action } = args;
    const changing = typeof next === 'string' ? { next, action } : undefined;
    const item = model;
    bus.fire({
      type: 'sys.ui.dev/action/Textbox',
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
    base: css({ boxSizing: 'border-box' }),
    textbox: css({ position: 'relative', top: -2 }),
  };

  const iconColor = isPending ? COLORS.BLUE : color.alpha(COLORS.DARK, 0.4);

  const elTextbox = (
    <div {...styles.textbox} title={value ? placeholder : undefined}>
      <TextboxCore
        value={value || ''}
        displayFormat={'monospace'}
        placeholder={placeholder}
        valueStyle={{ fontFamily: 'monospace', fontWeight: 'NORMAL' }}
        placeholderStyle={{ fontFamily: 'monospace', italic: true, color: color.format(-0.3) }}
        disabledOpacity={1}
        spellCheck={false}
        autoCorrect={false}
        autoCapitalize={false}
        selectOnFocus={true}
        isEnabled={model.handlers.length > 0}
        onChange={(e) => setPendingValue(() => e.to)}
        onEscape={() => setPendingValue(() => undefined)}
        onEnter={fireInvoke}
        enter={{
          isEnabled: isPending,
          handler: fireInvoke,
          icon: () => {
            const el = <Icons.Send size={18} color={iconColor} />;
            return el;
          },
        }}
      />
    </div>
  );

  const elTitle = title && <LayoutTitle>{title}</LayoutTitle>;

  return (
    <Layout
      isActive={isActive}
      isSpinning={isSpinning}
      body={elTextbox}
      description={description}
      icon={{ Component: Icons.Text, color: iconColor, offset: { y: 2 } }}
      label={{ ellipsis: false }}
      top={elTitle}
      indent={indent}
    />
  );
};
