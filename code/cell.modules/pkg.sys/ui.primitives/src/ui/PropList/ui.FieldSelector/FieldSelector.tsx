import React from 'react';

import { css, FC, t, Button, DEFAULT } from './common';
import { FieldBuilder } from '../FieldBuilder';
import { PropList } from '../PropList.View';
import { PropListFieldSelectorProps } from '../types';
import { FieldSelectorLabel } from './FieldSelector.Label';

export { PropListFieldSelectorProps };

const View: React.FC<PropListFieldSelectorProps> = (props) => {
  const {
    selected = [],
    resettable = DEFAULT.resettable,
    showIndexes = DEFAULT.showIndexes,
  } = props;
  const all = [...(props.all ?? [])];
  const isSelected = (field: string) => selected.includes(field);

  /**
   * [Handlers]
   */
  const handleClick = (field: string) => {
    const previous = [...selected];
    const action = selected.includes(field) ? 'Deselect' : 'Select';
    const next = action === 'Select' ? [...selected, field] : selected.filter((f) => f !== field);
    props.onClick?.({ field, action, previous, next });
  };

  const handleReset = () => {
    props.onClick?.({
      action: 'Reset',
      previous: [...selected],
      next: undefined,
    });
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative' }),
  };

  const items: t.PropListItem[] = all.map((field) => {
    const onClick = () => handleClick(field);
    const label = (
      <FieldSelectorLabel
        field={field}
        all={all}
        selected={selected}
        showIndexes={showIndexes}
        onClick={onClick}
      />
    );
    const value: t.PropListValueSwitch = {
      kind: 'Switch',
      data: isSelected(field),
      onClick,
    };
    return { label, value };
  });

  if (resettable) {
    const el = <Button onClick={handleReset}>Reset</Button>;
    items.push({ label: ``, value: { data: el } });
  }

  return (
    <PropList
      title={props.title}
      titleEllipsis={props.titleEllipsis}
      items={items}
      defaults={{ clipboard: false }}
      style={css(styles.base, props.style)}
    />
  );
};

/**
 * Export
 */
type Fields = {
  DEFAULT: typeof DEFAULT;
  FieldBuilder: typeof FieldBuilder;
};
export const FieldSelector = FC.decorate<PropListFieldSelectorProps, Fields>(
  View,
  { DEFAULT, FieldBuilder },
  { displayName: 'PropList.FieldSelector' },
);
