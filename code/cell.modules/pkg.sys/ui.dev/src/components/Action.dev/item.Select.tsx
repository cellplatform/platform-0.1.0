import React from 'react';

import { t, useActionItemMonitor } from '../common';
import { SelectDropdown } from './item.Select.Dropdown';
import { SelectButtons } from './item.Select.Buttons';

export type SelectProps = {
  namespace: string;
  bus: t.EventBus;
  item: t.ActionSelect;
};

export const Select: React.FC<SelectProps> = (props) => {
  const { namespace, bus } = props;
  const item = useActionItemMonitor({ bus: props.bus, item: props.item });
  const { view } = item;

  if (view === 'dropdown') {
    return <SelectDropdown bus={bus} namespace={namespace} item={item} />;
  }

  if (view === 'buttons') {
    return <SelectButtons bus={bus} namespace={namespace} item={item} />;
  }

  throw new Error(`The selector view '${view}' is not supported.`);
};
