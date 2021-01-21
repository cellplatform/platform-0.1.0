import React from 'react';

import { CssValue, t } from '../../common';
import { ButtonItem } from './Item.button';
import { HrItem } from './Item.hr';
import { TitleItem } from './Item.title';

export type ItemProps = {
  model: t.ActionItem;
  style?: CssValue;
  onClick?: t.ActionItemClickEventHandler;
};

export const Item: React.FC<ItemProps> = (props) => {
  const { model } = props;
  const type = model.type;

  if (model.type === 'button') {
    return <ButtonItem {...props} model={model} />;
  }

  if (model.type === 'hr') {
    return <HrItem {...props} model={model} />;
  }

  if (model.type === 'title') {
    return <TitleItem {...props} model={model} />;
  }

  throw new Error(`Action type '${type}' not supported.`);
};
