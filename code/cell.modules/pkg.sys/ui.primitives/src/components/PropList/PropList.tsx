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
  width?: number | { fixed?: number; min?: number; max?: number };
  height?: number | { fixed?: number; min?: number; max?: number };
  style?: CssValue;
};

export const PropList: React.FC<PropListProps> = (props) => {
  const { title, defaults } = props;
  const items = asItems(props.items);
  const width = typeof props.width === 'number' ? { fixed: props.width } : props.width;
  const height = typeof props.height === 'number' ? { fixed: props.height } : props.height;

  const styles = {
    base: css({
      position: 'relative',
      color: COLORS.DARK,

      width: width?.fixed === undefined ? '100%' : width?.fixed,
      height: height?.fixed,
      minWidth: defaultValue(width?.min, 10),
      minHeight: defaultValue(height?.min, 10),
      maxWidth: width?.max,
      maxHeight: height?.max,

      ...style.toMargins(props.margin),
      ...style.toPadding(props.padding),
    }),
    title: css({ marginBottom: 5 }),
  };

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
    <PropListTitle style={styles.title} ellipsis={props.titleEllipsis}>
      {title}
    </PropListTitle>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elTitle}
      <div>{elItems}</div>
    </div>
  );
};

/**
 * [Helpers]
 */

function asItems(input: PropListProps['items']) {
  if (Array.isArray(input)) {
    return input;
  }

  if (typeof input === 'object') {
    return Object.keys(input).map((key) => {
      const item: t.PropListItem = { label: key, value: toRenderValue(input[key]) };
      return item;
    });
  }

  return [];
}

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
