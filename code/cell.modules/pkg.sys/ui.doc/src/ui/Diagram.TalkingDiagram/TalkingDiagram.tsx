import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t, rx, useResizeObserver } from './common';

export type TalkingDiagramProps = {
  style?: CssValue;
  resize?: t.ResizeObserver | t.ResizeObserverHook;
};

export const TalkingDiagram: React.FC<TalkingDiagramProps> = (props) => {
  const resize = useResizeObserver({ root: props.resize });

  /**
   * [Render]
   */
  const styles = {
    base: css({ backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */ }),
  };
  return (
    <div ref={resize.ref} {...css(styles.base, props.style)}>
      <div>TalkingDiagram</div>
      <div>size - {`size: ${resize.rect.width} x ${resize.rect.height}`}</div>
    </div>
  );
};
