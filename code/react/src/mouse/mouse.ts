import * as React from 'react';
import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';
import { IMouseEvent } from '../events/types';
import * as t from './types';

export {
  MouseEvent,
  MouseEventHandler,
  MouseEventType,
  IMouseEventProps,
  IMouseHandlers,
} from './types';

export type MouseHandlerFactory = (args: {
  type: t.MouseEvent['type'];
  handlers?: t.MouseEventHandler[];
  getEnabled?: () => boolean;
}) => React.MouseEventHandler | undefined;

type MouseEventInternal = t.MouseEvent & {
  _react: IMouseEvent; // NB: Used internally, should not be called externally as may cause pooling errors.
};

const EVENT_TYPES: t.MouseEventType[] = ['CLICK', 'DOUBLE_CLICK', 'UP', 'DOWN', 'ENTER', 'LEAVE'];
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
export const fromProps = (
  props: t.IMouseEventProps,
  args: {
    force?: t.MouseEventType[] | boolean; // Ensures a handler for the event-type is created, even if one is not passed as a prop.
    getEnabled?: () => boolean;
  } = {},
) => {
  const { getEnabled } = args;
  const force = args.force === true ? EVENT_TYPES : Array.isArray(args.force) ? args.force : [];

  const prep = (type: t.MouseEventType, handler?: React.MouseEventHandler) => {
    return handler ? handler : force.includes(type) ? dummy : undefined;
  };

  return handlers(props.onMouse, {
    getEnabled,
    onClick: prep('CLICK', props.onClick),
    onDoubleClick: prep('DOUBLE_CLICK', props.onDoubleClick),
    onMouseDown: prep('DOWN', props.onMouseDown),
    onMouseUp: prep('UP', props.onMouseUp),
    onMouseEnter: prep('ENTER', props.onMouseEnter),
    onMouseLeave: prep('LEAVE', props.onMouseLeave),
  });
};

/**
 * Retrieves a set of mouse-handlers to apply to a component, eg:
 *
 *    const mouse = mouse.handlers(this.props.onMouse)
 *    <div {...mouse.props} />
 *
 */
export const handlers = (
  handler?: t.MouseEventHandler,
  args: {
    getEnabled?: () => boolean;
    onClick?: React.MouseEventHandler;
    onDoubleClick?: React.MouseEventHandler;
    onMouseDown?: React.MouseEventHandler;
    onMouseUp?: React.MouseEventHandler;
    onMouseEnter?: React.MouseEventHandler;
    onMouseLeave?: React.MouseEventHandler;
  } = {},
): t.IMouseHandlers => {
  const { getEnabled } = args;

  const isActive =
    Boolean(handler) || Object.keys(args).some(key => typeof args[key] === 'function');

  const getSingleHandler = (type: t.MouseEventType) => {
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

  const next$ = new Subject<t.MouseEvent>();
  const fireNext = (e: MouseEventInternal) => {
    next$.next(e as any);
    const singular = getSingleHandler(e.type as any);
    if (singular) {
      singular(e._react as any);
    }
  };

  const get: MouseHandlerFactory = args => {
    const hasSingularEvent = Boolean(getSingleHandler(args.type));
    const handlers: any[] = handler || hasSingularEvent ? [fireNext, handler] : [];
    return handler || hasSingularEvent ? handle({ ...args, getEnabled, handlers }) : undefined;
  };

  return {
    isActive,
    events$: next$.pipe(share()),
    events: {
      onClick: get({ type: 'CLICK' }),
      onDoubleClick: get({ type: 'DOUBLE_CLICK' }),
      onMouseDown: get({ type: 'DOWN' }),
      onMouseUp: get({ type: 'UP' }),
      onMouseEnter: get({ type: 'ENTER' }),
      onMouseLeave: get({ type: 'LEAVE' }),
    },
  };
};

/**
 * Factory for a mouse handler for a single event type.
 */
export const handle: MouseHandlerFactory = args => {
  const { type, getEnabled } = args;
  const handlers = (args.handlers || []).filter(e => Boolean(e));

  if (handlers.length === 0) {
    return undefined;
  }

  return (e: React.MouseEvent) => {
    if (getEnabled && !getEnabled()) {
      return;
    }

    handlers.forEach(handler => {
      const args: MouseEventInternal = {
        type,
        button: toButton(e as any),
        cancel: () => {
          e.preventDefault();
          e.stopPropagation();
        },
        _react: e as IMouseEvent, // NB: Used internally only.
      };
      handler(args as any);
    });
  };
};

/**
 * [Helpers]
 */
const toButton = (e: React.MouseEvent): t.MouseEvent['button'] => {
  switch (e.button) {
    case 2:
      return 'RIGHT';

    default:
      return 'LEFT';
  }
};
