import React from 'react';

import { t } from '../common';
import { SelectDropdown } from './item.Select.Dropdown';

export type SelectProps = {
  namespace: string;
  bus: t.EventBus;
  item: t.ActionSelect;
};

export const Select: React.FC<SelectProps> = (props) => {
  const { namespace, bus, item } = props;
  return <SelectDropdown bus={bus} namespace={namespace} item={item} />;
};
