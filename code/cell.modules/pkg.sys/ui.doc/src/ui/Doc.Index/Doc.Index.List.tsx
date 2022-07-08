import React from 'react';

import { DocHeadline } from '../Doc.Headline';
import { COLORS, Color, css, CssValue, t } from './common';

export type DocIndexListProps = {
  items?: t.DocDef[];
  style?: CssValue;
  sizes?: t.DocLayoutSizes;
  onSelect?: t.DocIndexSelectHandler;
};

export const DocIndexList: React.FC<DocIndexListProps> = (props) => {
  const { items = [], sizes } = props;
  if (!sizes) return null;

  const columnWidth = sizes.column.width;

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
      inner: css({ width: columnWidth }),
    },
    headline: {
      base: css({
        paddingBottom: 50,
        marginTop: 50,
        ':first-child': { marginTop: 0 },

        borderBottom: `solid 5px ${Color.alpha(COLORS.DARK, 0.08)}`,
        ':last-child': { borderBottom: 'none' },

        Flex: 'x-spaceBetween-center',
      }),
      text: css({ flex: 1 }),
      image: css({ height: 120, borderRadius: 8 }),
    },

    a: css({ textDecoration: 'none' }),
  };

  const elHeadlines = items.map((def, i) => {
    const handleClick = (mouse: React.MouseEvent) => {
      mouse.preventDefault();
      props.onSelect?.({ def });
    };

    const elImage = columnWidth > 500 && def.banner && (
      <img {...styles.headline.image} src={def.banner.url} />
    );

    return (
      <a key={`${def.path}.${i}`} href={def.path} onClick={handleClick} {...styles.a}>
        <div {...styles.headline.base}>
          <DocHeadline
            id={def.id}
            category={def.category}
            title={def.title}
            subtitle={def.subtitle}
            hint={{ width: 300 }}
            style={styles.headline.text}
            onClick={() => null} // NB: Dummy handler so that button performs "pressed" visual behavior.
          />
          {elImage}
        </div>
      </a>
    );
  });

  const elBody = (
    <div {...styles.body.scrollOuter}>
      <div {...styles.body.inner}>{elHeadlines}</div>
    </div>
  );

  return <div {...css(styles.base, props.style)}>{elBody}</div>;
};
