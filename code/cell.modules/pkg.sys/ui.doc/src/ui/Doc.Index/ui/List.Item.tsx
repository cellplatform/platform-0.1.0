import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t, rx, FC, DocHeadline, Button } from '../common';

export type IndexListItemProps = {
  doc: t.DocDef;
  width: number;
  style?: CssValue;
  onSelect?: t.DocIndexSelectHandler;
};

export const IndexListItem: React.FC<IndexListItemProps> = (props) => {
  const { doc, width } = props;
  const cursor = 'pointer';

  const [pressed, setPressed] = useState(false);
  const pressedHandler = (pressed: boolean) => () => setPressed(pressed);

  /**
   * Handler
   */

  const handleClick = (mouse: React.MouseEvent) => {
    mouse.preventDefault();
    props.onSelect?.({ doc });
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({
      paddingBottom: 40,
      marginTop: 40,
      borderBottom: `solid 5px ${Color.alpha(COLORS.DARK, 0.08)}`,
      ':first-child': { marginTop: 0 },
      ':last-child': { borderBottom: 'none' },
    }),
    inner: css({
      Flex: 'x-spaceBetween-center',
      cursor,
      userSelect: 'none',
      transform: `translateY(${pressed ? 2 : 0}px)`,
    }),
    text: css({ flex: 1, cursor }),
    image: css({ height: 120, borderRadius: 8 }),
    a: css({ textDecoration: 'none' }),
  };

  const elDoc = (
    <DocHeadline
      id={doc.id}
      category={doc.category}
      title={doc.title}
      subtitle={doc.subtitle}
      hint={{ width: 300 }}
      style={styles.text}
      onClick={undefined} // NB: Suppress click "pressed" behavior.  Handled at this level of the component.
    />
  );

  const elImage = width > 500 && doc.banner && <img {...styles.image} src={doc.banner.url} />;

  return (
    <div {...css(styles.base, props.style)}>
      <a {...styles.a} href={doc.path} onClick={handleClick}>
        <div
          {...styles.inner}
          onMouseDown={pressedHandler(true)}
          onMouseUp={pressedHandler(false)}
          onMouseLeave={pressedHandler(false)}
        >
          {elDoc}
          {elImage}
        </div>
      </a>
    </div>
  );
};
