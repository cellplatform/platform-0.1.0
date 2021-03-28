import React from 'react';

import { t } from '../../common';
import { Switch } from '../../components.ref/button/Switch';

export type BooleanValueProps = {
  value: t.PropListValue;
};

export const SwitchValue: React.FC<BooleanValueProps> = (props) => {
  const data = props.value.data as boolean;
  return <Switch height={16} value={data} />;
};
