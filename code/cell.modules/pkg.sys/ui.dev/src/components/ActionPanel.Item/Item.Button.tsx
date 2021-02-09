import React from 'react';

import { CssValue, t } from '../../common';
import { ButtonView } from './Item.ButtonView';

export type ItemButtonProps = {
  namespace: string;
  bus: t.EventBus;
  model: t.ActionButton;
  style?: CssValue;
};

/**
 * Button.
 */
export const ItemButton: React.FC<ItemButtonProps> = (props) => {
  const { model, style, namespace } = props;
  const bus = props.bus.type<t.ActionEvent>();

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
