import React, { useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MotionDraggableItem } from '..';
import { PropList, PropListItem } from '../../PropList';
import { css, CssValue } from '../common';

export type DevChildProps = {
  state?: MotionDraggableItem;
  style?: CssValue;
};

export const DevChild: React.FC<DevChildProps> = (props) => {
  const { state } = props;
  const current = state?.current;

  const [count, setCount] = useState<number>(0);
  const redraw = () => setCount((prev) => prev + 1);

  useEffect(() => {
    const dispose$ = new Subject<void>();

    if (state) {
      const changed$ = state.changed$.pipe(takeUntil(dispose$));
      changed$.subscribe(() => redraw());
    }

    return () => dispose$.next();
    //
  }, []); // eslint-disable-line

  const styles = {
    base: css({
      flex: 1,
      padding: 20,
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      borderRadius: 20,
    }),
  };

  const items: PropListItem[] = !current
    ? []
    : [
        { label: 'id', value: current.id },
        { label: 'position.x', value: Math.round(current.position.x) },
        { label: 'position.y', value: Math.round(current.position.y) },
        { label: 'size.width', value: Math.round(current.size.width) },
        { label: 'size.height', value: Math.round(current.size.height) },
        { label: 'size.scale', value: Math.round(current.size.scale) },
      ];

  const elProps = props.state && <PropList items={items} />;

  return (
    <div {...css(styles.base, props.style)}>
      <div>{props.children}</div>
      {elProps}
    </div>
  );
};
