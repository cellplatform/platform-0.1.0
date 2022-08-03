import React from 'react';
import { css, CssValue, defaultValue } from '../../common';

export type ZoomProps = {
  children?: React.ReactNode;
  zoom?: number;
  offset?: { x: number; y: number };
  style?: CssValue;
};

/**
 * A container element that applies zoom (scale) and offset (translate)
 * transformations to child content via properties.
 */
export const Zoom: React.FC<ZoomProps> = (props) => {
  const zoom = defaultValue(props.zoom, 1);
  const offset = props.offset || { x: 0, y: 0 };

  const styles = {
    base: css({
      position: 'relative',
      display: 'flex',
      overflow: 'hidden',
    }),
    offsetOuter: css({
      flex: 1,
      display: 'flex',
      transform: `translate(${offset.x}px, ${offset.y}px)`,
    }),
    zoomOuter: css({
      flex: 1,
      display: 'flex',
      transform: `scale(${zoom})`,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.offsetOuter}>
        <div {...styles.zoomOuter}>{props.children}</div>
      </div>
    </div>
  );
};

export default Zoom;
