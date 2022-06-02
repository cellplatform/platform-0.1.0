import React, { useEffect, useRef, useState } from 'react';

import { DocHeadline } from '../Doc.Headline';
import { Color, css, CssValue, t, useResizeObserver } from './common';
import { Logo } from './ui/Logo';

export type DocIndexProps = {
  items?: t.DocDef[];
  style?: CssValue;
  onResize?: (e: { size: t.DomRect }) => void;
};

export const DocIndex: React.FC<DocIndexProps> = (props) => {
  const { items = [] } = props;

  const resize = useResizeObserver({ onSize: (size) => props.onResize?.({ size }) });
  const size = resize.rect;

  /**
   * TODO 🐷
   * - Move into dedicated router module.
   */
  document.title = 'ro.db.team';

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
      inner: css({
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
  };

  const elHeadlines = items.map((item, i) => {
    return (
      <div {...styles.headline} key={`headline.${i}`}>
        <DocHeadline
          id={item.id}
          category={item.category}
          title={item.title}
          subtitle={item.subtitle}
          onClick={(e) => {
            console.log('headline.onClick', e);
          }}
        />
      </div>
    );
  });

  const elLogo = size.width > 950 && <Logo />;

  const elBody = resize.ready && (
    <div {...styles.body.scrollOuter}>
      <div {...styles.body.inner}>{elHeadlines}</div>
    </div>
  );

  return (
    <div ref={resize.ref} {...css(styles.base, props.style)}>
      {elLogo}
      {elBody}
    </div>
  );
};
