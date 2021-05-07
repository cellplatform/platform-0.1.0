import { MotionValue } from 'framer-motion';
import { Subject, Observable } from 'rxjs';

import { t } from '../../common';
import * as n from './types';

type N = MotionValue<number>;

export const ItemUtil = {
  toNumber(value: number | (() => number)): number {
    return typeof value === 'function' ? value() : value;
  },

  toSize(item: n.MotionDraggableDef) {
    const width = ItemUtil.toNumber(item.width);
    const height = ItemUtil.toNumber(item.height);
    return { width, height };
  },

  toState(args: { id: string; bus: t.EventBus<any>; x: N; y: N; width: N; height: N; scale: N }) {
    const { id } = args;
    const bus = args.bus.type<n.MotionDraggableEvent>();
    let _changed$: Subject<n.MotionDraggableItemChange> | undefined;

    const item: n.MotionDraggableItem = {
      id,
      bus,

      get current() {
        const size = { width: args.width.get(), height: args.width.get(), scale: args.scale.get() };
        const position = { x: args.x.get(), y: args.y.get() };
        return { id, size, position };
      },

      get changed$() {
        type C = n.MotionDraggableItemChange;
        if (!_changed$) {
          _changed$ = new Subject<C>();
          const next = (e: C) => _changed$?.next(e);
          args.x.onChange((value) => next({ key: 'x', value }));
          args.y.onChange((value) => next({ key: 'y', value }));
          args.width.onChange((value) => next({ key: 'width', value }));
          args.height.onChange((value) => next({ key: 'height', value }));
          args.scale.onChange((value) => next({ key: 'scale', value }));
        }
        return _changed$.asObservable();
      },
    };

    return item;
  },
};
