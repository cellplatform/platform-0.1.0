import React from 'react';
import { Color, COLORS, css, CssValue, t } from '../../common';

export type GuidesProps = {
  debug?: t.DocLayoutContainerDebug;
  sizes: t.DocLayoutSizes;
  style?: CssValue;
};

export const Guides: React.FC<GuidesProps> = (props) => {
  const { sizes, debug = {} } = props;
  const border = debug.tracelines ? `solid 1px ${Color.alpha(COLORS.MAGENTA, 0.2)}` : undefined;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Absolute: 0,
      pointerEvents: 'none',
      Flex: 'x-stretch-stretch',
    }),
    edge: css({ flex: 1 }),
    center: css({
      position: 'relative',
      width: sizes.column.width,
      borderRight: border,
      borderLeft: border,
      backgroundColor: debug.bg ? 'rgba(255, 0, 0, 0.03)' : undefined,
    }),
    elDebug: css({
      Absolute: [3, 5, null, null],
      color: Color.alpha(COLORS.MAGENTA, 0.3),
      fontSize: 10,
      fontFamily: 'monospace',
    }),
  };

  const elDebug = (debug.renderCount || debug.columnSize) && (
    <div {...styles.elDebug}>{toDebugString({ debug, sizes })}</div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.edge} />
      <div {...styles.center}>{elDebug}</div>
      <div {...styles.edge} />
    </div>
  );
};

/**
 * [Helpers]
 */

let renderCount = 0;
function toDebugString(args: { debug: t.DocLayoutContainerDebug; sizes: t.DocLayoutSizes }) {
  const { debug, sizes } = args;
  const text: string[] = [];

  if (debug.renderCount) {
    renderCount++;
    text.push(`render-${renderCount}`);
  }

  if (debug.columnSize) {
    const column = sizes.column;
    text.push(`size: ${column.width} x ${column.height} px`);
  }

  return text.join(', ');
}
