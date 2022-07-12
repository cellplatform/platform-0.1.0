import React from 'react';

import { Color, COLORS, css, CssValue, t } from '../common';
import { IndexListItem } from './List.Item';

export type IndexListProps = {
  items?: t.DocDef[];
  style?: CssValue;
  sizes?: t.DocLayoutSizes;
  onSelect?: t.DocIndexSelectHandler;
};

export const IndexList: React.FC<IndexListProps> = (props) => {
  const { items = [], sizes } = props;

  if (!sizes) return null;
  const width = sizes.column.width;

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative' }),
    body: {
      scrollOuter: css({
        Absolute: 0,
        Flex: 'x-center-center',
        Scroll: true,
        PaddingX: 20,
      }),
      inner: css({ width }),
    },
    headline: {
      base: css({
        paddingBottom: 40,
        marginTop: 40,
        borderBottom: `solid 5px ${Color.alpha(COLORS.DARK, 0.08)}`,
        ':first-child': { marginTop: 0 },
        ':last-child': { borderBottom: 'none' },
      }),
      inner: css({ Flex: 'x-spaceBetween-center' }),
      text: css({ flex: 1 }),
      image: css({ height: 120, borderRadius: 8 }),
    },

    a: css({ textDecoration: 'none' }),
  };

  const elItems = items.map((doc, i) => {
    return (
      <IndexListItem key={`${doc.path}.${i}`} doc={doc} width={width} onSelect={props.onSelect} />
    );
  });

  const elBody = (
    <div {...styles.body.scrollOuter}>
      <div {...styles.body.inner}>{elItems}</div>
    </div>
  );

  return <div {...css(styles.base, props.style)}>{elBody}</div>;
};
