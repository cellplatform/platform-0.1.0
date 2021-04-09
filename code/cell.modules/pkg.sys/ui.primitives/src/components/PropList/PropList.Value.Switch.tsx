import React from 'react';

import { t } from '../../common';
import { Switch } from '../../components.ref/button/Switch';

export type SwitchValueProps = {
  value: t.PropListValue;
};

export const SwitchValue: React.FC<SwitchValueProps> = (props) => {
  const data = props.value.data as boolean;
  return <Switch height={16} value={data} />;
};
