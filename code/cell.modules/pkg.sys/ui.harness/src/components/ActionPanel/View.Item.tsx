import React from 'react';

import { CssValue, t } from '../../common';
import { ItemButton } from './View.Item.button';

export type ItemProps = {
  model: t.ActionItem;
  style?: CssValue;
  onClick?: t.ActionItemClickEventHandler;
};

export const Item: React.FC<ItemProps> = (props) => {
  const { model } = props;

  if (model.type === 'button') {
    return <ItemButton {...props} model={model} />;
  }

  throw new Error(`Action type '${model.type}' not supported.`);
};
