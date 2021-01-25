import React from 'react';

import { CssValue, t } from '../../common';
import { useItemMonitor } from '../../hooks/actions';
import { Switch } from '../Primitives';
import { ButtonView } from './Item.ButtonView';

export type BooleanItemProps = {
  ns: string;
  bus: t.DevEventBus;
  model: t.DevActionItemBoolean;
  style?: CssValue;
};

export const BooleanItem: React.FC<BooleanItemProps> = (props) => {
  const { bus, style, ns } = props;
  const model = useItemMonitor({ bus, model: props.model });
  const { label, description } = model;
  const isActive = Boolean(model.handler);
  const value = Boolean(model.current);

  const fire = (change: boolean) => {
    bus.fire({ type: 'Dev/Action/boolean', payload: { ns, model, change } });
  };

  const elSwitch = <Switch value={value} isEnabled={isActive} height={18} />;

  return (
    <ButtonView
      label={label}
      description={description}
      isActive={isActive}
      right={elSwitch}
      style={style}
      onClick={() => fire(true)}
    />
  );
};
