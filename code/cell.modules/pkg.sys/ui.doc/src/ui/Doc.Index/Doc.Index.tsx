import React, { useEffect, useRef, useState } from 'react';

import { DocHeadline } from '../Doc.Headline';
import { Color, css, CssValue, t, useResizeObserver } from './common';

export type DocIndexProps = {
  items?: t.DocDef[];
  style?: CssValue;
  onResize?: (e: { size: t.DomRect }) => void;
  onSelectItem?: (e: { def: t.DocDef }) => void;
};

export const DocIndex: React.FC<DocIndexProps> = (props) => {
  const { items = [] } = props;

  const resize = useResizeObserver({ onSize: (size) => props.onResize?.({ size }) });

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative' }),
    body: {
      scrollOuter: css({
        Absolute: 0,
        Flex: 'x-start-center',
        Scroll: true,
        PaddingX: 20,
      }),
      inner: css({
        paddingTop: 120,
        width: 720, // TODO 🐷 take from page resizer
      }),
    },
    headline: css({
      paddingBottom: 50,
      marginTop: 50,
      ':first-child': { marginTop: 0 },

      borderBottom: `solid 5px ${Color.format(-0.1)}`,
      ':last-child': { borderBottom: 'none' },
    }),

    a: css({
      textDecoration: 'none',
    }),
  };

  const elHeadlines = items.map((def, i) => {
    const handleClick = (mouse: React.MouseEvent) => {
      mouse.preventDefault();
      props.onSelectItem?.({ def });
    };

    return (
      <div {...styles.headline} key={`headline.${i}`}>
        <a href={def.path} onClick={handleClick} {...styles.a}>
          <DocHeadline
            id={def.id}
            category={def.category}
            title={def.title}
            subtitle={def.subtitle}
            onClick={() => null} // NB: Dummy handler so that button performs "pressed" visual behavior.
          />
        </a>
      </div>
    );
  });

  const elBody = resize.ready && (
    <div {...styles.body.scrollOuter}>
      <div {...styles.body.inner}>{elHeadlines}</div>
    </div>
  );

  return (
    <div ref={resize.ref} {...css(styles.base, props.style)}>
      {elBody}
    </div>
  );
};
