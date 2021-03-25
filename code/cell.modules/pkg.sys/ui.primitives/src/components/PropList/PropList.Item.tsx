import * as React from 'react';

import { color, css, CssValue, t } from '../../common';
import { PropListItemValue } from './PropList.ItemValue';

export type PropListItemProps = {
  data: t.PropListItem;
  isFirst?: boolean;
  isLast?: boolean;
  defaults?: t.PropListDefaults;
  style?: CssValue;
};

export const PropListItem: React.FC<PropListItemProps> = (props) => {
  const { data, isFirst, isLast, defaults } = props;

  const styles = {
    base: css({
      Flex: 'horizontal-center-spaceBetween',
      PaddingY: 4,
      borderBottom: `solid 1px ${color.format(isLast ? 0 : -0.1)}`,
      ':last-child': { border: 'none' },
      fontSize: 12,
    }),
  };
  return (
    <div {...styles.base} title={data.tooltip}>
      <PropListLabel data={data} />
      <PropListItemValue data={data} isFirst={isFirst} isLast={isLast} defaults={defaults} />
    </div>
  );
};

export type PropListLabelProps = { data: t.PropListItem; style?: CssValue };
export const PropListLabel: React.FC<PropListLabelProps> = (props) => {
  const styles = {
    base: css({
      opacity: 0.4,
      marginRight: 15,
      userSelect: 'none',
    }),
  };
  return <div {...css(styles.base, props.style)}>{props.data.label}</div>;
};
