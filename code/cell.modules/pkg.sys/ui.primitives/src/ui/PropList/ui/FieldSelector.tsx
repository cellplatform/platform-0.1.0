import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t, rx, FC } from '../common';
import { FieldBuilder } from '../FieldBuilder';
import { PropList } from '../PropList.View';
import { FieldSelectorLabel } from './FieldSelector.Label';

import { PropListFieldSelectorProps } from '../types';
export { PropListFieldSelectorProps };

/**
 *
 */
const View: React.FC<PropListFieldSelectorProps> = (props) => {
  const { selected = [] } = props;
  const all = [...(props.all ?? [])];

  const isSelected = (field: string) => {
    /**
     * TODO 🐷 rollups
     */
    return selected.includes(field);
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative' }),
  };

  const items: t.PropListItem[] = all.map((field) => {
    const label = <FieldSelectorLabel field={field} all={all} />;
    const value: t.PropListValueSwitch = {
      kind: 'Switch',
      data: isSelected(field),
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
