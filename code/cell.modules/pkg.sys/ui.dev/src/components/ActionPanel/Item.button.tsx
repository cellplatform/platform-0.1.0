import React from 'react';

import { CssValue, t } from '../../common';
import { ButtonView } from './Item.ButtonView';

export type ItemButtonProps = {
  namespace: string;
  bus: t.DevEventBus;
  model: t.DevActionButton;
  style?: CssValue;
};

/**
 * Button.
 */
export const ItemButton: React.FC<ItemButtonProps> = (props) => {
  const { bus, model, style, namespace } = props;
  const { label, description } = model;
  const isActive = model.handlers.length > 0;

  const clickHandler = () => bus.fire({ type: 'dev:action/Button', payload: { namespace, model } });

  return (
    <ButtonView
      isActive={isActive}
      label={label}
      description={description}
      style={style}
      onClick={clickHandler}
    />
  );
};
