import React from 'react';

import { COLORS, css, DEFAULTS, FC, Style, t } from './common';
import { PropListProps } from './types';
import { PropListItem, PropListTitle } from './ui.Item';
import { Util } from './Util';

export { PropListProps };

/**
 * Component
 */
export const PropList: React.FC<PropListProps> = (props) => {
  const { title, theme = DEFAULTS.theme } = props;
  const items = Util.asItems(props.items);
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

      width: width?.fixed,
      height: height?.fixed,
      minWidth: width?.min ?? 10,
      minHeight: height?.min ?? 10,
      maxWidth: width?.max,
      maxHeight: height?.max,

      boxSizing: 'border-box',
      ...Style.toMargins(props.margin),
      ...Style.toPadding(props.padding),
    }),
    items: css({}),
    title: css({ marginBottom: 5 }),
  };

  const elItems = items
    .filter((item) => Boolean(item))
    .filter((item) => item?.visible ?? true)
    .map((item, i) => {
      return (
        <PropListItem
          key={i}
          data={item as t.PropListItem}
          isFirst={i == 0}
          isLast={i === items.length - 1}
          defaults={defaults}
          theme={theme}
        />
      );
    });

  const elTitle = title && (
    <PropListTitle
      style={styles.title}
      theme={theme}
      ellipsis={props.titleEllipsis}
      defaults={defaults}
    >
      {title}
    </PropListTitle>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elTitle}
      <div {...styles.items}>{elItems}</div>
    </div>
  );
};
