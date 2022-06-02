import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t, useResizeObserver } from './common';
import { DocHeadline } from '../Doc.Headline';
import { Lorem } from 'sys.ui.dev';

export type DocIndexProps = {
  style?: CssValue;
  onResize?: (e: { size: t.DomRect }) => void;
};

export const DocIndex: React.FC<DocIndexProps> = (props) => {
  const resize = useResizeObserver({ onSize: (size) => props.onResize?.({ size }) });
  const size = resize.rect;

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

    logo: {
      base: css({
        Absolute: [10, null, null, 10],
        color: COLORS.DARK,
        letterSpacing: -0.1,
        fontSize: 18,
      }),
      subdomain: css({ color: COLORS.RED }),
    },
  };

  const elHeadline = (
    <div {...styles.headline}>
      <DocHeadline
        category={'Conceptual Framework'}
        title={'Foobar boom and the baz.'}
        subtitle={Lorem.words(15)}
      />
    </div>
  );

  const elLogo = size.width > 950 && (
    <div {...styles.logo.base}>
      <span {...styles.logo.subdomain}>ro</span>.db.team
    </div>
  );

  const elBody = resize.ready && (
    <div {...styles.body.scrollOuter}>
      <div {...styles.body.inner}>
        {elHeadline}
        {elHeadline}
      </div>
    </div>
  );

  return (
    <div ref={resize.ref} {...css(styles.base, props.style)}>
      {elLogo}
      {elBody}
    </div>
  );
};
