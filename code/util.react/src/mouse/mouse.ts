import * as React from 'react';
import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';
import {
  MouseEvent,
  MouseEventHandler,
  MouseEventType,
  IMouseEventProps,
  IMouseHandlers,
} from './types';
export { MouseEvent, MouseEventHandler, MouseEventType, IMouseEventProps, IMouseHandlers };

export type MouseHandlerFactory = (
  type: MouseEvent['type'],
  ...handler: Array<MouseEventHandler | undefined>
) => React.MouseEventHandler | undefined;

type MouseEventInternal = MouseEvent & {
  _react: React.MouseEvent; // NB: Used internally, should not be called externally as may cause pooling errors.
};

const dummy = () => null;

/**
 * Retrieves the set of mouse-handlers from a components properties.
 *
 * Example usage:
 *
 *    export class Button extends React.PureComponent {
 *      private mouse: mouse.IMouseHandlers;
 *
 *      constructor(props: IButtonProps) {
 *        super(props);
 *        this.mouse = mouse.fromProps(props);
 *      }
 *
 *      public render() {
 *        return (
 *          <div {...this.mouse.events}>Label</div>
 *        );
 *      }
 *    }
 *
 */
export function fromProps(
  props: IMouseEventProps,
  args: {
    force?: MouseEventType[]; // Ensures a handler for the event-type is created, even if one is not passed as a prop.
  } = {},
) {
  const { force = [] } = args;
  const prep = (type: MouseEventType, handler?: React.MouseEventHandler) => {
    return handler ? handler : force.includes(type) ? dummy : undefined;
  };

  return handlers(props.onMouse, {
    onClick: prep('CLICK', props.onClick),
    onDoubleClick: prep('DOUBLE_CLICK', props.onDoubleClick),
    onMouseDown: prep('DOWN', props.onMouseDown),
    onMouseUp: prep('UP', props.onMouseUp),
    onMouseEnter: prep('ENTER', props.onMouseEnter),
    onMouseLeave: prep('LEAVE', props.onMouseLeave),
  });
}

/**
 * Retrieves a set of mouse-handlers to apply to a component, eg:
 *
 *    const mouse = mouse.handlers(this.props.onMouse)
 *    <div {...mouse.props} />
 *
 */
export function handlers(
  handler?: MouseEventHandler,
  args: {
    onClick?: React.MouseEventHandler;
    onDoubleClick?: React.MouseEventHandler;
    onMouseDown?: React.MouseEventHandler;
    onMouseUp?: React.MouseEventHandler;
    onMouseEnter?: React.MouseEventHandler;
    onMouseLeave?: React.MouseEventHandler;
  } = {},
): IMouseHandlers {
  const isActive =
    Boolean(handler) || Object.keys(args).some(key => typeof args[key] === 'function');

  const getSingleHandler = (type: MouseEventType) => {
    switch (type) {
      case 'CLICK':
        return args.onClick;
      case 'DOUBLE_CLICK':
        return args.onDoubleClick;
      case 'DOWN':
        return args.onMouseDown;
      case 'UP':
        return args.onMouseUp;
      case 'ENTER':
        return args.onMouseEnter;
      case 'LEAVE':
        return args.onMouseLeave;
      default:
        throw new Error(`Mouse event type '${type}' not supported.`);
    }
  };

  const next$ = new Subject<MouseEvent>();
  const fireNext = (e: MouseEventInternal) => {
    next$.next(e);
    const singular = getSingleHandler(e.type);
    if (singular) {
      singular(e._react);
    }
  };

  const get: MouseHandlerFactory = type => {
    const hasSingularEvent = Boolean(getSingleHandler(type));
    const handlers = handler || hasSingularEvent ? [fireNext, handler] : [];
    return handler || hasSingularEvent ? handle(type, ...(handlers as any[])) : undefined;
  };

  return {
    isActive,
    events$: next$.pipe(share()),
    events: {
      onClick: get('CLICK'),
      onDoubleClick: get('DOUBLE_CLICK'),
      onMouseDown: get('DOWN'),
      onMouseUp: get('UP'),
      onMouseEnter: get('ENTER'),
      onMouseLeave: get('LEAVE'),
    },
  };
}

/**
 * Factory for a mouse handler for a single event type.
 */
export const handle: MouseHandlerFactory = (type, ...handler) => {
  const handlers = (handler === undefined
    ? []
    : Array.isArray(handler)
    ? handler
    : [handler]
  ).filter(h => Boolean(h)) as MouseEventHandler[];

  if (handlers.length === 0) {
    return undefined;
  }

  return (e: React.MouseEvent) => {
    handlers.forEach(handler => {
      const args: MouseEventInternal = {
        type,
        button: toButton(e),
        cancel: () => {
          e.preventDefault();
          e.stopPropagation();
        },
        _react: e, // NB: Used internally only.
      };
      handler(args);
    });
  };
};

/**
 * INTERNAL
 */
const toButton = (e: React.MouseEvent): MouseEvent['button'] => {
  const button = e.button;
  switch (button) {
    case 2:
      return 'RIGHT';

    default:
      return 'LEFT';
  }
};
