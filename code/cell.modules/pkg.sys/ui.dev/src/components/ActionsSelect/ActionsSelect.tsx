import React from 'react';
import Select, { MenuPlacement } from 'react-select';
import { css, CssValue, t, DEFAULT, COLORS } from '../../common';
import { useEventBus } from './useEventBus';

import { ActionsSelectOnChangeEventHandler } from './types';

type M = t.DevActions;

export type ActionsSelectProps = {
  selected?: t.DevActions;
  actions?: t.DevActions[];
  menuPlacement?: MenuPlacement;
  bus?: t.EventBus;
  style?: CssValue;
  onChange?: ActionsSelectOnChangeEventHandler;
};

export const ActionsSelect: React.FC<ActionsSelectProps> = (props) => {
  const { actions = [], bus, onChange } = props;

  const busController = useEventBus({ bus, onChange });

  const options: t.DevActionSelectItem<M>[] = actions.map((value) => {
    const model = value.toObject();
    const label = model.name || DEFAULT.UNNAMED;
    return { label, value };
  });

  const selectedNs = props.selected?.toObject().ns;
  const index = options.findIndex((opt) => opt.value.toObject().ns === selectedNs);
  const value = index < 0 ? undefined : options[index];

  const styles = {
    base: css({ color: COLORS.DARK }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <Select
        options={options}
        value={value}
        defaultValue={options[0]}
        menuPlacement={props.menuPlacement}
        onChange={(e) => {
          const item = e as t.DevActionSelectItem;
          busController.onChange({ selected: item.value, actions });
        }}
      />
    </div>
  );
};
