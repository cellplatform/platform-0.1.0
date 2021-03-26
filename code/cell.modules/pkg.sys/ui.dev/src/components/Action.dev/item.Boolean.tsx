import React from 'react';

import { t, useActionItemMonitor, DEFAULT } from '../common';
import { Switch } from '../Primitives';
import { Layout, LayoutTitle } from './Layout';

export type BoolProps = {
  namespace: string;
  bus: t.EventBus;
  item: t.ActionBoolean;
};

export const Bool: React.FC<BoolProps> = (props) => {
  const { namespace } = props;
  const model = useActionItemMonitor({ bus: props.bus, item: props.item });
  const bus = props.bus.type<t.DevActionEvent>();
  const { title, label = DEFAULT.UNNAMED, description, isSpinning } = model;
  const isActive = model.handlers.length > 0;
  const value = Boolean(model.current);

  const fire = () => {
    bus.fire({
      type: 'dev:action/Boolean',
      payload: {
        namespace,
        item: model,
        changing: { next: !value },
      },
    });
  };

  const elSwitch = <Switch value={value} isEnabled={isActive} height={18}  />;
  const elTitle = title && <LayoutTitle>{title}</LayoutTitle>;

  return (
    <Layout
      isActive={isActive}
      isSpinning={isSpinning}
      label={{ body: label, onClick: fire }}
      description={description}
      top={elTitle}
      right={elSwitch}
    />
  );
};
