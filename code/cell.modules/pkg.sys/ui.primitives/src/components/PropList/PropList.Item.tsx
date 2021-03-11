import * as React from 'react';

import { color, css, CssValue, t } from '../../common';
import { PropListItemValue } from './PropList.ItemValue';

export type PropListItemProps = {
  data: t.IPropListItem;
  isFirst?: boolean;
  isLast?: boolean;
  style?: CssValue;
};

export class PropListItem extends React.PureComponent<PropListItemProps> {
  public render() {
    const { data, isFirst, isLast } = this.props;

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
        {this.renderLabel()}
        <PropListItemValue data={data} isFirst={isFirst} isLast={isLast} />
      </div>
    );
  }

  private renderLabel() {
    const { data } = this.props;
    const styles = {
      base: css({
        marginRight: 15,
        opacity: 0.4,
        userSelect: 'none',
      }),
    };
    return <div {...styles.base}>{data.label}</div>;
  }
}
