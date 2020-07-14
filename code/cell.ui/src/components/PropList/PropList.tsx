import * as React from 'react';

import { color, COLORS, css, CssValue, defaultValue, t } from '../../common';
import { PropListItem } from './PropList.Item';

export type IPropListProps = {
  title?: string;
  items?: (t.IPropListItem | undefined)[];
  style?: CssValue;
};

export class PropList extends React.PureComponent<IPropListProps> {
  public static Hr = (props: { color?: string | number } = {}) => {
    const style = css({
      height: 1,
      borderTop: `solid 4px ${color.format(defaultValue(props.color, -0.1))}`,
      MarginY: 15,
    });
    return <div {...style} />;
  };

  public static Space = (props: { height?: number }) => {
    const style = css({ height: defaultValue(props.height, 20) });
    return <div {...style} />;
  };

  /**
   * [Render]
   */
  public render() {
    const { items = [] } = this.props;
    const styles = {
      base: css({
        position: 'relative',
        color: COLORS.DARK,
      }),
      title: css({
        fontWeight: 'bold',
        fontSize: 13,
        marginBottom: 5,
      }),
    };

    const elItems = items
      .filter((item) => Boolean(item))
      .filter((item) => defaultValue(item?.visible, true))
      .map((item, i) => {
        const isFirst = i === 0;
        const isLast = i === items.length - 1;
        const data = item as t.IPropListItem;
        return <PropListItem key={i} data={data} isFirst={isFirst} isLast={isLast} />;
      });

    return (
      <div {...css(styles.base, this.props.style)}>
        {this.props.title && <div {...styles.title}>{this.props.title}</div>}
        <div>{elItems}</div>
      </div>
    );
  }
}
