import React from 'react';

import { t } from '../common';
import { ButtonView } from './ButtonView';

export type ButtonProps = {
  namespace: string;
  bus: t.EventBus;
  model: t.ActionButton;
};

/**
 * Button.
 */
export const Button: React.FC<ButtonProps> = (props) => {
  const { model, namespace } = props;
  const bus = props.bus.type<t.DevActionEvent>();

  const { label, description } = model;
  const isActive = model.handlers.length > 0;

  const clickHandler = () =>
    bus.fire({ type: 'dev:action/Button', payload: { namespace, item: model } });

  return (
    <ButtonView
      isActive={isActive}
      label={label}
      description={description}
      onClick={clickHandler}
    />
  );
};
