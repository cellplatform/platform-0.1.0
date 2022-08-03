import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MotionDraggableContainer, MotionDraggableItem } from '..';
import { Hr } from '../../Hr';
import { PropList } from '../../PropList';
import { css, CssValue } from '../common';

export type DevChildProps = {
  children?: React.ReactNode;
  state?: MotionDraggableItem;
  container?: MotionDraggableContainer;
  style?: CssValue;
};

export const DevChild: React.FC<DevChildProps> = (props) => {
  const { state, container } = props;
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

  const round = (input?: number) => (typeof input === 'number' ? Math.round(input) : '-');

  const elItems = props.state && (
    <>
      <PropList
        title={'item'}
        items={[
          { label: 'id', value: current?.id },
          { label: 'position.x', value: round(current?.position.x) },
          { label: 'position.y', value: round(current?.position.y) },
          { label: 'size.width', value: round(current?.size.width) },
          { label: 'size.height', value: round(current?.size.height) },
          { label: 'size.scale', value: round(current?.size.scale) },
        ]}
      />

      <Hr thickness={5} opacity={0.1} />

      <PropList
        title={'container'}
        items={[
          { label: 'size.width', value: round(container?.size.width) },
          { label: 'size.height', value: round(container?.size.height) },
        ]}
      />
    </>
  );

  return (
    <div {...css(styles.base, props.style)}>
      <div>{props.children}</div>
      {elItems}
    </div>
  );
};
