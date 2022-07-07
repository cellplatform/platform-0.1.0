import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t, rx, useResizeObserver } from './common';
import { DocLayoutContainer } from '../Doc.LayoutContainer';

export type TalkingDiagramProps = {
  style?: CssValue;
  rootResize?: t.ResizeObserver | t.ResizeObserverHook;
  min?: { width?: number; height?: number };

  onResize?: t.DiagramResizeHandler;
};

export const TalkingDiagram: React.FC<TalkingDiagramProps> = (props) => {
  const [docSizes, setDocSizes] = useState<t.DocLayoutSizes | undefined>();

  /**
   * TODO 🐷
   * Do not need this when using DocLayoutContainer
   */
  const resize = useResizeObserver({
    root: props.rootResize,
    onSize(e) {
      if (props.onResize) {
        const { width, height } = e;
        const size: t.DiagramLayoutSize = { root: { width, height } };
        props.onResize?.({ size });
      }
    },
  });

  const calculate: t.CalculateDocLayoutSizes = (root) => {
    const Size = DocLayoutContainer.LayoutSize;
    const sizes = Size.calculate(root);

    /**
     * TODO 🐷
     */
    if (root.width < 650) sizes.column.width = 220;
    if (root.width >= 650) sizes.column.width = root.width - 250;

    setDocSizes(sizes);

    return sizes;
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative', display: 'flex' }),
    body: {
      base: css({ flex: 1, Flex: 'x-spaceBetween-stretch' }),
      edge: css({ flex: 1 }),
      center: css({
        width: docSizes?.column.width,
        Flex: 'center-center',
      }),
    },
  };

  const elBody = docSizes && (
    <div {...styles.body.base}>
      <div {...styles.body.edge} />
      <div {...styles.body.center}>Talking Diagram</div>
      <div {...styles.body.edge} />
    </div>
  );

  const elImageTmp = (
    <img
      src={`https://tdb-i8baikayt-tdb.vercel.app/diagram.jpg`}
      {...css({
        width: 300,
        Absolute: [null, 25, 25, null],
        border: `solid 1px ${Color.alpha(COLORS.DARK, 0.25)}`,
        borderRadius: 8,
      })}
    />
  );

  return (
    <div ref={resize.ref} {...css(styles.base, props.style)}>
      <DocLayoutContainer
        rootResize={resize}
        min={props.min}
        debug={true}
        style={{ flex: 1 }}
        calculate={calculate}
      >
        {elBody}
      </DocLayoutContainer>
      {elImageTmp}
    </div>
  );
};
