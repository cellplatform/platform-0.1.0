import React from 'react';
import { t } from '../common';
import { Hr as HrComponent } from '../Hr';

export type HrProps = {
  namespace: string;
  bus: t.EventBus;
  item: t.ActionHr;
};

export const Hr: React.FC<HrProps> = (props) => {
  const { item } = props;
  return <HrComponent color={0 - item.opacity} thickness={item.height} margin={item.margin} />;
};
