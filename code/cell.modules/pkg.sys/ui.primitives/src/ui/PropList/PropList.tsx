import React from 'react';

import { COLORS, css, CssValue, defaultValue, t, Style, FC } from '../../common';
import { PropListItem } from './PropList.Item';
import { PropListTitle } from './PropList.Title';
import { FieldBuilder } from './Fields';

/**
 * Types
 */
export type PropListProps = {
  title?: string | React.ReactNode | null;
  titleEllipsis?: boolean;
  items?: (t.PropListItem | undefined)[] | Record<string, unknown>;
  defaults?: t.PropListDefaults;
  padding?: t.CssEdgesInput;
  margin?: t.CssEdgesInput;
  width?: number | { fixed?: number; min?: number; max?: number };
  height?: number | { fixed?: number; min?: number; max?: number };
  style?: CssValue;
};

/**
 * Component
 */
const View: React.FC<PropListProps> = (props) => {
  const { title } = props;
  const items = asItems(props.items);
  const width = typeof props.width === 'number' ? { fixed: props.width } : props.width;
  const height = typeof props.height === 'number' ? { fixed: props.height } : props.height;

  const defaults: t.PropListDefaults = {
    clipboard: true,
    ...props.defaults,
  };

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

      ...Style.toMargins(props.margin),
      ...Style.toPadding(props.padding),
    }),
    title: css({ marginBottom: 5 }),
  };

  const elItems = items
    .filter((item) => Boolean(item))
    .filter((item) => defaultValue(item?.visible, true))
    .map((item, i) => {
      return (
        <PropListItem
          key={i}
          data={item as t.PropListItem}
          isFirst={i == 0}
          isLast={i === items.length - 1}
          defaults={defaults}
        />
      );
    });

  const elTitle = title && (
    <PropListTitle style={styles.title} ellipsis={props.titleEllipsis} defaults={defaults}>
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

/**
 * Export (API)
 */

type Fields = {
  builder<F extends string>(): t.PropListFieldBuilder<F>;
};
export const PropList = FC.decorate<PropListProps, Fields>(
  View,
  {
    builder<F extends string>() {
      return FieldBuilder<F>();
    },
  },
  { displayName: 'PropList' },
);
