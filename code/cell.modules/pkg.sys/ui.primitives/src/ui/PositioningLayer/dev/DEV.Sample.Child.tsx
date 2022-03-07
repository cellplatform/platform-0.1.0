import React, { useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css, CssValue, t, useResizeObserver } from '../common';

export type SampleChildProps = {
  width?: number;
  height?: number;
  style?: CssValue;
};

export const SampleChild: React.FC<SampleChildProps> = (props) => {
  const { width, height } = props;

  const rootRef = useRef<HTMLDivElement>(null);
  const resize = useResizeObserver(rootRef);
  const [size, setSize] = useState<t.DomRect | undefined>();

  useEffect(() => {
    const dispose$ = new Subject<void>();
    resize.$.pipe(takeUntil(dispose$)).subscribe((size) => setSize(size));
    return () => dispose$.next();
  }, []); // eslint-disable-line

  const styles = {
    base: css({
      position: 'relative',
      userSelect: 'none',
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      borderRadius: 10,
      border: `dashed 1px ${color.format(-0.1)}`,
      boxSizing: 'border-box',
      padding: 20,
      flex: 1,
      minWidth: 100,
      minHeight: 60,
      width,
      height,
    }),
    size: css({
      Absolute: [10, null, null, 10],
      fontSize: 11,
      opacity: 0.4,
    }),
  };

  const elSize = size && (
    <div {...styles.size}>
      <div>
        x:{size.x}, y:{size.y}
      </div>
      <div>
        w:{size.width}, h:{size.height}
      </div>
      <div>🐷🐷🐷 hello</div>
    </div>
  );

  return (
    <div ref={rootRef} {...css(styles.base, props.style)}>
      {elSize}
    </div>
  );
};
