import React from 'react';

import { CssValue, t } from '../../common';
import { BooleanItem } from './Item.boolean';
import { ButtonItem } from './Item.button';
import { HrItem } from './Item.hr';
import { TitleItem } from './Item.title';

export type ItemProps = {
  bus: t.DevEventBus;
  model: t.DevActionItem;
  style?: CssValue;
};

export const Item: React.FC<ItemProps> = (props) => {
  const { model } = props;
  const kind = model.kind;

  if (model.kind === 'button') {
    return <ButtonItem {...props} model={model} />;
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
