import { Observable, Subject, BehaviorSubject } from 'rxjs';
import {
  takeUntil,
  take,
  takeWhile,
  map,
  filter,
  share,
  delay,
  distinctUntilChanged,
  debounceTime,
  tap,
} from 'rxjs/operators';
import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../common';
import { MotionDraggableDef, MotionDraggableItem } from '..';
import { PropList, PropListItem } from '../../PropList';

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
        { label: 'position.x (left)', value: Math.round(current.position.x) },
        { label: 'position.y (top)', value: Math.round(current.position.y) },
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
