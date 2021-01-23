import React, { useState } from 'react';

import { CssValue, t } from '../../common';
import { ButtonView } from './Item.button';

export type BooleanItemProps = {
  bus: t.DevEventBus;
  model: t.DevActionItemBoolean;
  style?: CssValue;
};

export const BooleanItem: React.FC<BooleanItemProps> = (props) => {
  const { bus, model, style } = props;
  const { label, description } = model;
  const isActive = Boolean(model.onClick);

  const clickHandler = () => {
    /**
     * TODO 🐷
     */
    console.log('bool', model);
    // bus.fire({ type: 'Dev/Action/button:click', payload: { model } });
  };

  return (
    <ButtonView
      label={label}
      description={description}
      isActive={isActive}
      style={style}
      onClick={clickHandler}
    />
  );
};
