import React, { useEffect, useState } from 'react';

import { CssValue, t, time } from '../../common';
import { ButtonView } from './Item.ButtonView';
import { Switch } from '../Primitives';

export type BooleanItemProps = {
  ns: string;
  bus: t.DevEventBus;
  model: t.DevActionItemBoolean;
  style?: CssValue;
};

export const BooleanItem: React.FC<BooleanItemProps> = (props) => {
  const { bus, model, style, ns } = props;
  const { label, description } = model;
  const isActive = Boolean(model.handler);
  const [current, setCurrent] = useState<boolean>(false);

  const fire = (change: boolean) => {
    let current = false;
    bus.fire({
      type: 'Dev/Action/boolean',
      payload: { ns, model, change, current: (value) => (current = value) },
    });
    return current;
  };

  useEffect(() => {
    // NB: Delaying a tick allows the main [useActionController] to
    //     finish registering before requests are made of it.
    time.delay(0, () => setCurrent(fire(false)));
  });

  const elSwitch = <Switch value={current} isEnabled={isActive} height={18} />;

  return (
    <ButtonView
      label={label}
      description={description}
      isActive={isActive}
      right={elSwitch}
      style={style}
      onClick={() => setCurrent(fire(true))}
    />
  );
};
