import React from 'react';

import { PropList, PropListItem } from '../PropList';
import { COLORS, css, CssValue, t, toMinSizeFlags, value } from './common';

export type MinSizeConfigProps = {
  size?: t.DomRect;
  minWidth?: number;
  minHeight?: number;
  style?: CssValue;
};

export const MinSizeConfig: React.FC<MinSizeConfigProps> = (props) => {
  const { size, minWidth, minHeight } = props;
  const is = toMinSizeFlags({ size, minWidth, minHeight });

  const toNumber = (input?: number) => value.round(input ?? -1);
  const toNumberString = (input?: number, suffix?: string) =>
    value === undefined ? '-' : `${toNumber(input)}${suffix ?? ''}`;

  const width = toNumber(size?.width);
  const height = toNumber(size?.height);

  const styles = {
    base: css({ position: 'relative' }),
  };

  const items: PropListItem[] = [
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
    { label: 'minWidth', value: { data: toNumberString(minWidth, 'px') } },
    { label: 'minHeight', value: { data: toNumberString(minHeight, 'px') } },
  ];

  return (
    <div {...css(styles.base, props.style)}>
      <PropList title={'Props'} items={items} defaults={{ monospace: true }} />
    </div>
  );
};
