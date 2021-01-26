import React from 'react';

import { CssValue, t } from '../../common';
import { useItemMonitor } from '../../hooks/actions';
import { Switch } from '../Primitives';
import { ButtonView } from './Item.ButtonView';

export type ItemBooleanProps = {
  ns: string;
  bus: t.DevEventBus;
  model: t.DevActionBoolean;
  style?: CssValue;
};

export const ItemBoolean: React.FC<ItemBooleanProps> = (props) => {
  const { bus, ns } = props;
  const model = useItemMonitor({ bus, model: props.model });
  const { label, description } = model;
  const isActive = Boolean(model.handler);
  const value = Boolean(model.current);

  const fire = (change: boolean) => {
    bus.fire({
      type: 'dev:action/Boolean',
      payload: { ns, model, change },
    });
  };

  const elSwitch = <Switch value={value} isEnabled={isActive} height={18} />;

  return (
    <ButtonView
      label={label}
      description={description}
      isActive={isActive}
      right={elSwitch}
      style={props.style}
      onClick={() => fire(true)}
    />
  );
};
