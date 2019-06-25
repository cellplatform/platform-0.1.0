import * as React from 'react';
import { MouseEventType } from '@platform/react/lib/types';

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
  isSelected: boolean;
};

/**
 * [Events]
 */
export type TabstripEvent =
  | ITabstripSortStartEvent
  | ITabstripSortCompleteEvent
  | ITabstripTabMouseEvent
  | ITabstripSelectionChangeEvent
  | ITabstripFocusEvent;

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
  selected: { from?: number; to?: number };
};

export type ITabstripTabMouseEvent<D = any> = {
  type: 'TABSTRIP/tab/mouse';
  payload: ITabMouse<D>;
};
export type ITabMouse<D = any> = {
  index: number;
  type: MouseEventType;
  button: 'LEFT' | 'RIGHT';
  data: D;
  axis: TabstripAxis;
  cancel: () => void;
};

export type ITabstripSelectionChangeEvent<D = any> = {
  type: 'TABSTRIP/tab/selection';
  payload: ITabstripSelectionChange<D>;
};
export type ITabstripSelectionChange<D = any> = {
  from?: number;
  to?: number;
  data: D;
};

export type ITabstripFocusEvent = {
  type: 'TABSTRIP/focus';
  payload: ITabstripFocus;
};
export type ITabstripFocus = { isFocused: boolean };
