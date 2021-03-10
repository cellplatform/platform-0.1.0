import React, { useState } from 'react';
import Select, { MenuPlacement } from 'react-select';
import { css, CssValue, t, DEFAULT, COLORS, color } from '../../common';
import { useEventBus } from './useEventBus';

import { Icons } from '../Icons';
import { ActionsSelectOnChangeEventHandler } from './types';
import { Button } from '../Primitives';

type M = t.Actions;

export type ActionsSelectorProps = {
  selected?: t.Actions;
  actions?: t.Actions[];
  menuPlacement?: MenuPlacement;
  bus?: t.EventBus;
  style?: CssValue;
  onChange?: ActionsSelectOnChangeEventHandler;
};

export const ActionsSelector: React.FC<ActionsSelectorProps> = (props) => {
  const { actions = [], bus, onChange } = props;

  const busController = useEventBus({ bus, onChange });
  const [showSelector, setShowSelector] = useState<boolean>(false);

  const options: t.ActionSelectItem<M>[] = actions.map((value) => {
    const model = value.toObject();
    const label = model.namespace || DEFAULT.UNNAMED;
    return { label, value };
  });

  const selectedNs = props.selected?.toObject().namespace;
  const index = options.findIndex((opt) => opt.value.toObject().namespace === selectedNs);
  const value = index < 0 ? undefined : options[index];

  const model = props.selected?.toObject();
  const env = { ...model?.env.viaSubject, ...model?.env.viaAction };

  const styles = {
    base: css({ color: COLORS.DARK }),
    button: {
      base: css({ fontSize: 12 }),
      body: css({ Flex: 'horizontal-center-center' }),
      icon: css({ marginRight: 4 }),
    },
  };

  const label = value?.label;
  const labelColor = color.format(env.layout?.labelColor) || -0.5;
  const elButton = !showSelector && label && (
    <Button
      style={styles.button.base}
      theme={{ color: { enabled: labelColor } }}
      overTheme={{ color: { enabled: COLORS.BLUE } }}
      onClick={() => setShowSelector(true)}
    >
      <div {...styles.button.body}>
        <Icons.Tree size={20} style={styles.button.icon} />
        {label}
      </div>
    </Button>
  );

  const elSelector = showSelector && (
    <Select
      options={options}
      value={value}
      defaultValue={options[0]}
      menuPlacement={props.menuPlacement}
      menuIsOpen={true}
      autoFocus={true}
      onChange={(e) => {
        const item = e as t.ActionSelectItem;
        busController.onChange({ selected: item.value, actions });
        setShowSelector(false);
      }}
    />
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elButton}
      {elSelector}
    </div>
  );
};
