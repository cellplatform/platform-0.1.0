import React from 'react';

import { CssValue, t } from '../../common';
import { ButtonView } from './Item.ButtonView';

export type ItemButtonProps = {
  ns: string;
  bus: t.DevEventBus;
  model: t.DevActionButton;
  style?: CssValue;
};

/**
 * Button.
 */
export const ItemButton: React.FC<ItemButtonProps> = (props) => {
  const { bus, model, style, ns } = props;
  const { label, description } = model;
  const isActive = Boolean(model.handler);

  const clickHandler = () => bus.fire({ type: 'dev:action/Button', payload: { ns, model } });

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
