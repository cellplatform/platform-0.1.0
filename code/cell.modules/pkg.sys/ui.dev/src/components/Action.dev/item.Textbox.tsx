import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, useActionItemMonitor } from '../common';
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
  const { label, description, isSpinning } = model;
  const isActive = model.handlers.length > 0;
  const value = Boolean(model.current);

  const fire = (args: { action: t.IActionTextboxPayload['action']; next?: string }) => {
    const { next, action } = args;
    bus.fire({
      type: 'dev:action/Textbox',
      payload: {
        namespace,
        item: model,
        action,
        changing: next ? { next } : undefined,
      },
    });
  };

  const placeholder = 'placeholder'; // TEMP 🐷

  const elTextbox = (
    <TextInput
      placeholder={placeholder}
      valueStyle={{ fontFamily: 'monospace', fontWeight: 'NORMAL' }}
      placeholderStyle={{ fontFamily: 'sans-serif', italic: true, color: color.format(-0.3) }}
      onChange={(e) => {
        fire({ action: 'change', next: e.to });
      }}
    />
  );

  return (
    <ItemLayout
      isActive={isActive}
      isSpinning={isSpinning}
      label={elTextbox}
      description={description}
      pressOffset={0}
    />
  );
};
