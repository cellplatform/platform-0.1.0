import React from 'react';

import { PropList } from '../PropList';
import { COLORS, css, CssValue, t, toMinSizeFlags, value } from './common';

export type MinSizePropertiesProps = {
  title?: string;
  props: { minWidth?: number; minHeight?: number; hideStrategy?: t.MinSizeHideStrategy };
  size?: t.DomRect;
  style?: CssValue;
};

export const MinSizeProperties: React.FC<MinSizePropertiesProps> = (props) => {
  const { size } = props;
  const { minWidth, minHeight, hideStrategy } = props.props;
  const is = toMinSizeFlags({ size, minWidth, minHeight });

  const toNumber = (input?: number) => value.round(input ?? -1);
  const toNumberString = (input?: number, suffix?: string) =>
    value === undefined ? '-' : `${toNumber(input)}${suffix ?? ''}`;

  const width = toNumber(size?.width);
  const height = toNumber(size?.height);

  const styles = {
    base: css({ position: 'relative' }),
  };

  const items: t.PropListItem[] = [
    {
      label: 'width',
      value: {
        data: toNumberString(width, 'px'),
        color: is.tooNarrow ? COLORS.MAGENTA : COLORS.BLUE,
      },
    },
    {
      label: 'height',
      value: {
        data: toNumberString(height, 'px'),
        color: is.tooShort ? COLORS.MAGENTA : COLORS.BLUE,
      },
    },
    {
      label: 'minimum width',
      value: {
        data: toNumberString(minWidth, 'px'),
      },
    },
    {
      label: 'minimum height',
      value: {
        data: toNumberString(minHeight, 'px'),
      },
    },
    { label: 'hide strategy', value: { data: hideStrategy ?? '-' } },
  ];

  return (
    <div {...css(styles.base, props.style)}>
      <PropList title={props.title} items={items} defaults={{ monospace: true }} />
    </div>
  );
};
