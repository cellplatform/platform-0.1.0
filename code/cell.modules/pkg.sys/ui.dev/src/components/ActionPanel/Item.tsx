import React from 'react';

import { CssValue, t } from '../../common';
import { BooleanItem } from './Item.Boolean';
import { Button } from './Item.Button';
import { HrItem } from './Item.Hr';
import { TitleItem } from './Item.Title';

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
    return <Button {...props} model={model} />;
  }

  if (model.kind === 'hr') {
    return <HrItem {...props} model={model} />;
  }

  if (model.kind === 'title') {
    return <TitleItem {...props} model={model} />;
  }

  if (model.kind === 'boolean') {
    return <BooleanItem {...props} model={model} />;
  }

  throw new Error(`Action type '${kind}' not supported.`);
};
