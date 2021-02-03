import React from 'react';
import Select, { MenuPlacement } from 'react-select';
import { css, CssValue, t, DEFAULT, COLORS } from '../../common';

export type ActionsSelectOnChangeEvent = { selected: t.DevActions };
export type ActionsSelectOnChangeEventHandler = (e: ActionsSelectOnChangeEvent) => void;

export type ActionsSelectProps = {
  actions?: t.DevActions[];
  menuPlacement?: MenuPlacement;
  style?: CssValue;
  onChange?: ActionsSelectOnChangeEventHandler;
};

export const ActionsSelect: React.FC<ActionsSelectProps> = (props) => {
  const { actions = [] } = props;

  const options: t.DevActionSelectItem[] = actions.map((value) => {
    const model = value.toObject();
    const label = model.name || DEFAULT.UNNAMED;
    return { label, value };
  });

  const styles = {
    base: css({
      color: COLORS.DARK,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <Select
        options={options}
        menuPlacement={props.menuPlacement}
        onChange={(e) => {
          const item = e as t.DevActionSelectItem;
          if (props.onChange) props.onChange({ selected: item.value });
        }}
      />
    </div>
  );
};
