import React from 'react';

import { COLORS, css, defaultValue, FC, Style, t } from '../../common';
import { FieldBuilder } from './Fields';
import { PropListItem } from './PropList.Item';
import { PropListTitle } from './PropList.Title';
import { PropListProps } from './types';
import { Util } from './Util';

export { PropListProps };

/**
 * Constants
 */
const THEMES: t.PropListTheme[] = ['Light', 'Dark'];
const DEFAULT_THEME: t.PropListTheme = 'Light';
const DEFAULT = { THEME: DEFAULT_THEME };
const constants = { DEFAULT, THEMES };

/**
 * Component
 */
const View: React.FC<PropListProps> = (props) => {
  const { title, theme = DEFAULT.THEME } = props;
  const items = Util.asItems(props.items);
  const width = typeof props.width === 'number' ? { fixed: props.width } : props.width;
  const height = typeof props.height === 'number' ? { fixed: props.height } : props.height;

  console.log('theme', theme);

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
 * Export (API)
 */
type Fields = {
  constants: typeof constants;
  builder<F extends string>(): t.PropListFieldBuilder<F>;
};
export const PropList = FC.decorate<PropListProps, Fields>(
  View,
  {
    constants,
    builder<F extends string>() {
      return FieldBuilder<F>();
    },
  },
  { displayName: 'PropList' },
);
