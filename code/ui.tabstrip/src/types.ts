import * as React from 'react';

export type TabstripAxis = 'x' | 'y';

export type TabFactory<D = any> = (e: TabFactoryArgs<D>) => React.ReactNode;
export type TabFactoryArgs<D = any> = {
  index: number;
  collection?: string | number;
  data: D;
  axis: TabstripAxis;
  isVertical: boolean;
  isHorizontal: boolean;
  isFirst: boolean;
  isLast: boolean;
  isDragging: boolean;
};

/**
 * [Events]
 */
export type TabstripEvent = ITabstripSortStartEvent | ITabstripSortCompleteEvent;

export type ITabstripSortStartEvent<D = any> = {
  type: 'TABSTRIP/sort/start';
  payload: ITabstripSortStart<D>;
};
export type ITabstripSortStart<D = any> = {
  axis: TabstripAxis;
  index: number;
  collection?: string | number;
  data: D;
};

export type ITabstripSortCompleteEvent<D = any> = {
  type: 'TABSTRIP/sort/complete';
  payload: ITabstripSortComplete<D>;
};
export type ITabstripSortComplete<D = any> = {
  axis: TabstripAxis;
  index: { from: number; to: number };
  collection?: string | number;
  data: D;
  items: { from: D[]; to: D[] };
};
