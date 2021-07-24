import React from 'react';

import { color, css, CssValue, t } from '../../common';
import { PropListValue } from './PropList.Value';
import { PropListLabel } from './PropList.Label';

export type PropListItemProps = {
  data: t.PropListItem;
  isFirst?: boolean;
  isLast?: boolean;
  defaults: t.PropListDefaults;
  style?: CssValue;
};

export const PropListItem: React.FC<PropListItemProps> = (props) => {
  const { data, isFirst, isLast, defaults } = props;

  const styles = {
    base: css({
      Flex: 'horizontal-start-spaceBetween',
      PaddingY: 4,
      fontSize: 12,
      borderBottom: `solid 1px ${color.format(isLast ? 0 : -0.1)}`,
      ':last-child': { border: 'none' },
    }),
  };
  return (
    <div {...styles.base} title={data.tooltip}>
      <PropListLabel data={data} defaults={defaults} />
      <PropListValue item={data} isFirst={isFirst} isLast={isLast} defaults={defaults} />
    </div>
  );
};
