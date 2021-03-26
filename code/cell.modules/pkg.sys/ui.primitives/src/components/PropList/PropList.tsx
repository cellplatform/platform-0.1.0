import * as React from 'react';

import { color, COLORS, css, CssValue, defaultValue, t, style } from '../../common';
import { PropListItem } from './PropList.Item';
import { PropListTitle } from './PropList.Title';

export type PropListProps = {
  title?: string | React.ReactNode;
  titleEllipsis?: boolean;
  items?: (t.PropListItem | undefined)[] | Record<string, unknown>;
  defaults?: t.PropListDefaults;
  padding?: t.CssEdgesInput;
  margin?: t.CssEdgesInput;
  style?: CssValue;
};

export class PropList extends React.PureComponent<PropListProps> {
  public static Hr = (props: { color?: string | number; margin?: number } = {}) => {
    const style = css({
      height: 1,
      borderTop: `solid 4px ${color.format(defaultValue(props.color, -0.1))}`,
      MarginY: defaultValue(props.margin, 15),
    });
    return <div {...style} />;
  };

  public static Space = (props: { height?: number }) => {
    const style = css({ height: defaultValue(props.height, 20) });
    return <div {...style} />;
  };

  /**
   * [Properties]
   */
  private get items() {
    const { items } = this.props;

    if (Array.isArray(items)) {
      return items;
    }

    if (typeof items === 'object') {
      return Object.keys(items).map((key) => {
        const item: t.PropListItem = { label: key, value: toRenderValue(items[key]) };
        return item;
      });
    }

    return [];
  }

  /**
   * [Render]
   */
  public render() {
    const props = this.props;
    const { title, defaults } = props;

    const styles = {
      base: css({
        position: 'relative',
        width: '100%',
        color: COLORS.DARK,
        ...style.toMargins(props.margin),
        ...style.toPadding(props.padding),
      }),
      title: css({ marginBottom: 5 }),
    };

    const items = this.items;

    const elItems = items
      .filter((item) => Boolean(item))
      .filter((item) => defaultValue(item?.visible, true))
      .map((item, i) => {
        const isFirst = i === 0;
        const isLast = i === items.length - 1;
        const data = item as t.PropListItem;
        return (
          <PropListItem key={i} data={data} isFirst={isFirst} isLast={isLast} defaults={defaults} />
        );
      });

    const elTitle = title && (
      <PropListTitle style={styles.title} ellipsis={this.props.titleEllipsis}>
        {title}
      </PropListTitle>
    );

    return (
      <div {...css(styles.base, this.props.style)}>
        {elTitle}
        <div>{elItems}</div>
      </div>
    );
  }
}

/**
 * [Helpers]
 */

function toRenderValue(input: any) {
  if (input === null) {
    return null;
  }
  if (input === undefined) {
    return undefined;
  }

  /**
   * TODO 🐷
   * Expand this out to be more nuanced in display value types
   * eg, color-coding, spans etc:
   *  - {object}
   *  - [Array]
   */

  if (Array.isArray(input)) {
    return `[Array](${input.length})`;
  }

  if (typeof input === 'object') {
    return `{object}`;
  }

  return input.toString();
}
