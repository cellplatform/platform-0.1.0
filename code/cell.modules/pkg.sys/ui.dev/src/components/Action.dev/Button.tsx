import React from 'react';

import { t } from '../common';
import { ButtonView } from './ButtonView';

export type ButtonProps = {
  namespace: string;
  bus: t.EventBus;
  item: t.ActionButton;
};

/**
 * Button.
 */
export const Button: React.FC<ButtonProps> = (props) => {
  const { item, namespace } = props;
  const bus = props.bus.type<t.DevActionEvent>();

  const { label, description, isSpinning } = item;
  const isActive = item.handlers.length > 0;

  const clickHandler = () =>
    bus.fire({
      type: 'dev:action/Button',
      payload: { namespace, item },
    });

  return (
    <ButtonView
      isActive={isActive}
      isSpinning={isSpinning}
      label={label}
      description={description}
      onClick={clickHandler}
    />
  );
};
