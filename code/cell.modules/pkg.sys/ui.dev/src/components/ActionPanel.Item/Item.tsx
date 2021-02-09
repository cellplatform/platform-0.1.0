import React from 'react';

import { CssValue, t } from '../../common';
import { ItemBoolean } from './Item.Boolean';
import { ItemButton } from './Item.Button';
import { ItemHr } from './Item.Hr';
import { ItemSelect } from './Item.Select';
import { ItemTitle } from './Item.Title';

export type ItemProps = {
  namespace: string;
  bus: t.EventBus;
  model: t.ActionItem;
  style?: CssValue;
};

export const Item: React.FC<ItemProps> = (props) => {
  const { model } = props;
  const kind = model.kind;

  if (model.kind === 'button') {
    return <ItemButton {...props} model={model as t.ActionButton} />;
  }

  if (model.kind === 'hr') {
    return <ItemHr {...props} model={model as t.ActionHr} />;
  }

  if (model.kind === 'title') {
    return <ItemTitle {...props} model={model as t.ActionTitle} />;
  }

  if (model.kind === 'boolean') {
    return <ItemBoolean {...props} model={model as t.ActionBoolean} />;
  }

  if (model.kind === 'select') {
    return <ItemSelect {...props} model={model as t.ActionSelect} />;
  }

  throw new Error(`Action type '${kind}' not supported.`);
};
