import React from 'react';

import { CssValue, t } from '../../common';
import { ButtonView } from './Item.ButtonView';

export type ButtonItemProps = {
  ns: string;
  bus: t.DevEventBus;
  model: t.DevActionItemButton;
  style?: CssValue;
};

/**
 * Button.
 */
export const Button: React.FC<ButtonItemProps> = (props) => {
  const { bus, model, style, ns } = props;
  const { label, description } = model;
  const isActive = Boolean(model.handler);

  const clickHandler = () => bus.fire({ type: 'dev:action/button', payload: { ns, model } });

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
