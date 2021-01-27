import React from 'react';

import { CssValue, t } from '../../common';
import { ItemBoolean } from './Item.Boolean';
import { ItemButton } from './Item.Button';
import { ItemHr } from './Item.Hr';
import { ItemTitle } from './Item.Title';
import { ItemSelect } from './Item.Select';

export type ItemProps = {
  ns: string;
  bus: t.DevEventBus;
  model: t.DevActionItem;
  style?: CssValue;
};

export const Item: React.FC<ItemProps> = (props) => {
  const { model } = props;
  const kind = model.kind;

  if (model.kind === 'button') {
    return <ItemButton {...props} model={model} />;
  }

  if (model.kind === 'hr') {
    return <ItemHr {...props} model={model} />;
  }

  if (model.kind === 'title') {
    return <ItemTitle {...props} model={model} />;
  }

  if (model.kind === 'boolean') {
    return <ItemBoolean {...props} model={model} />;
  }

  if (model.kind === 'select') {
    return <ItemSelect {...props} model={model} />;
  }

  throw new Error(`Action type '${kind}' not supported.`);
};
