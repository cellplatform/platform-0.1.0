import React from 'react';

import { PropList, PropListItem } from '../PropList';
import { COLORS, css, CssValue, t, toMinSizeFlags, value } from './common';
import { MinSizeProps } from './MinSize';

export type MinSizePropertiesProps = {
  props: MinSizeProps;
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
    { label: 'hideStrategy', value: { data: hideStrategy ?? '-' } },
  ];

  return (
    <div {...css(styles.base, props.style)}>
      <PropList title={'Props'} items={items} defaults={{ monospace: true }} />
    </div>
  );
};
