import React from 'react';

import { t } from '../../common';
import { useItemMonitor } from '../../hooks/Actions';
import { Switch } from '../Primitives';
import { ButtonView } from './Item.ButtonView';

export type ItemBooleanProps = {
  namespace: string;
  bus: t.EventBus;
  model: t.ActionBoolean;
};

export const ItemBoolean: React.FC<ItemBooleanProps> = (props) => {
  const { namespace } = props;
  const model = useItemMonitor({ bus: props.bus, model: props.model });
  const bus = props.bus.type<t.ActionEvent>();
  const { label, description } = model;
  const isActive = model.handlers.length > 0;
  const value = Boolean(model.current);

  const fire = () => {
    bus.fire({
      type: 'dev:action/Boolean',
      payload: {
        namespace,
        model,
        changing: { next: !value },
      },
    });
  };

  const elSwitch = <Switch value={value} isEnabled={isActive} height={18} />;

  return (
    <ButtonView
      label={label}
      description={description}
      isActive={isActive}
      right={elSwitch}
      onClick={fire}
    />
  );
};
