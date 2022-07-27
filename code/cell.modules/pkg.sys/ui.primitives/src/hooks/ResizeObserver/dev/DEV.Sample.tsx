import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t, rx, FC } from '../../common';
import { ObjectView } from 'sys.ui.dev';
import { useResizeObserver } from '..';

export type DevSampleProps = {
  style?: CssValue;
  onSize?: (size: t.DomRect) => void;
};

export const DevSample: React.FC<DevSampleProps> = (props) => {
  const [size, setSize] = useState<t.DomRect | undefined>();

  const resize = useResizeObserver({
    onSize(size) {
      setSize(size);
      props.onSize?.(size);
    },
  });

  /**
   * [Render]
   */
  const styles = {
    base: css({ padding: 40 }),
    obj: css({ marginTop: 20 }),
  };

  return (
    <div ref={resize.ref} {...css(styles.base, props.style)}>
      <div>ResizeObserver 🐷</div>
      <div>ready: {resize.ready.toString()}</div>
      <div {...styles.obj}>
        <ObjectView name={'size (DomRect)'} data={size} />
      </div>
    </div>
  );
};
