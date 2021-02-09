import React from 'react';
import Select, { MenuPlacement } from 'react-select';
import { css, CssValue, t, DEFAULT, COLORS } from '../../common';
import { useEventBus } from './useEventBus';

import { ActionsSelectOnChangeEventHandler } from './types';

type M = t.Actions;

export type ActionsSelectProps = {
  selected?: t.Actions;
  actions?: t.Actions[];
  menuPlacement?: MenuPlacement;
  bus?: t.EventBus;
  style?: CssValue;
  onChange?: ActionsSelectOnChangeEventHandler;
};

export const ActionsSelect: React.FC<ActionsSelectProps> = (props) => {
  const { actions = [], bus, onChange } = props;

  const busController = useEventBus({ bus, onChange });

  const options: t.ActionSelectItem<M>[] = actions.map((value) => {
    const model = value.toObject();
    const label = model.namespace || DEFAULT.UNNAMED;
    return { label, value };
  });

  const selectedNs = props.selected?.toObject().namespace;
  const index = options.findIndex((opt) => opt.value.toObject().namespace === selectedNs);
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
          const item = e as t.ActionSelectItem;
          busController.onChange({ selected: item.value, actions });
        }}
      />
    </div>
  );
};
