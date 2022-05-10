import React from 'react';

import { css, CssValue, t, DEFAULTS } from './common';
import { PropListLabel } from './PropList.Label';
import { PropListValue } from './PropList.Value';
import { Util } from './Util';

export type PropListItemProps = {
  data: t.PropListItem;
  isFirst?: boolean;
  isLast?: boolean;
  defaults: t.PropListDefaults;
  theme?: t.PropListTheme;
  style?: CssValue;
};

export const PropListItem: React.FC<PropListItemProps> = (props) => {
  const { data, isFirst, isLast, defaults } = props;
  const theme = Util.theme(props.theme);

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Flex: 'horizontal-start-spaceBetween',
      PaddingY: 4,
      fontSize: DEFAULTS.fontSize,
      borderBottom: `solid 1px ${theme.color.alpha(isLast ? 0 : 0.1)}`,
      ':last-child': { border: 'none' },
    }),
  };

  return (
    <div {...styles.base} title={data.tooltip}>
      <PropListLabel data={data} defaults={defaults} theme={props.theme} />
      <PropListValue
        item={data}
        isFirst={isFirst}
        isLast={isLast}
        defaults={defaults}
        theme={props.theme}
      />
    </div>
  );
};
