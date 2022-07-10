import React from 'react';

import { t } from '../common';
import { Switch } from './Value.common';

export type SwitchValueProps = {
  value: t.PropListValue;
  onClick: () => void;
};

export const SwitchValue: React.FC<SwitchValueProps> = (props) => {
  const value = props.value.data as boolean | undefined;
  return (
    <Switch height={12} value={value} isEnabled={value !== undefined} onClick={props.onClick} />
  );
};
