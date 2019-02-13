import * as React from 'react';
import { Observable } from 'rxjs';

export type MouseEventType =
  | 'DOWN'
  | 'UP'
  | 'ENTER'
  | 'LEAVE'
  | 'CLICK'
  | 'DOUBLE_CLICK';

/**
 * A roll up of all possible mouse events into a single event stream.
 */
export type MouseEvent = {
  type: MouseEventType;
  button: 'LEFT' | 'RIGHT';
  cancel: () => void;
};
export type MouseEventHandler = (e: MouseEvent) => void;

/**
 * An interface for a component that exposes
 * all (or some) mouse related properties.
 */
export type IMouseEventProps = {
  onMouse?: MouseEventHandler;
  onClick?: React.MouseEventHandler;
  onDoubleClick?: React.MouseEventHandler;
  onMouseDown?: React.MouseEventHandler;
  onMouseUp?: React.MouseEventHandler;
  onMouseEnter?: React.MouseEventHandler;
  onMouseLeave?: React.MouseEventHandler;
};

export type IMouseHandlers = {
  isActive: boolean;
  events$: Observable<MouseEvent>;
  events: {
    onClick?: React.MouseEventHandler;
    onDoubleClick?: React.MouseEventHandler;
    onMouseDown?: React.MouseEventHandler;
    onMouseUp?: React.MouseEventHandler;
    onMouseEnter?: React.MouseEventHandler;
    onMouseLeave?: React.MouseEventHandler;
  };
};
