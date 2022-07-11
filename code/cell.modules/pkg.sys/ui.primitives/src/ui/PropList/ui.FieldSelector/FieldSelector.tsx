import React from 'react';

import { css, FC, t } from '../common';
import { FieldBuilder } from '../FieldBuilder';
import { PropList } from '../PropList.View';
import { PropListFieldSelectorProps } from '../types';
import { FieldSelectorLabel } from './FieldSelector.Label';

export { PropListFieldSelectorProps };

const View: React.FC<PropListFieldSelectorProps> = (props) => {
  const { selected = [] } = props;
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
    // const next
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative' }),
  };

  const items: t.PropListItem[] = all.map((field) => {
    const onClick = () => handleClick(field);
    const label = <FieldSelectorLabel field={field} all={all} onClick={onClick} />;
    const value: t.PropListValueSwitch = {
      kind: 'Switch',
      data: isSelected(field),
      onClick,
    };
    return { label, value };
  });

  return (
    <PropList
      style={css(styles.base, props.style)}
      title={props.title}
      titleEllipsis={props.titleEllipsis}
      items={items}
    />
  );
};

/**
 * Export
 */
type Fields = {
  FieldBuilder: typeof FieldBuilder;
};
export const FieldSelector = FC.decorate<PropListFieldSelectorProps, Fields>(
  View,
  { FieldBuilder },
  { displayName: 'PropList.FieldSelector' },
);
