import React, { RefObject, useRef } from 'react';

import { rx, t } from '../common';
import { containsFocus, withinFocus } from '../Focus';
import { useFocus } from '../Focus';

type O = Record<string, unknown>;
type Id = string;

export type UIEventBusHookArgs<Ctx extends O, H extends HTMLElement> = {
  bus: t.EventBus<any>;
  instance: Id;
  ctx: Ctx;
  ref?: RefObject<H>;
  focusRedraw?: boolean; // Cause redraw when focus/blur events fire on the [ref] element.
};

/**
 * Hook for abstracting a set of DOM events through an event-bus.
 */
export function useUIEvents<Ctx extends O, H extends HTMLElement>(
  args: UIEventBusHookArgs<Ctx, H>,
): t.UIEventsHook<H> {
  const { instance, ctx, focusRedraw: redrawOnFocus = false } = args;
  const bus = rx.busAsType<t.UIEvent>(args.bus);

  const _ref = useRef<H>(null);
  const ref = args.ref || _ref;
  const target = Util.toTarget(ref);

  useFocus(ref, { redraw: redrawOnFocus });

  const element: t.UIEventsHookElement<H> = {
    ref,
    get containsFocus() {
      return containsFocus(ref);
    },
    get withinFocus() {
      return withinFocus(ref);
    },
  };

  const mouseHandler = (name: keyof t.UIEventHandlersMouse): React.MouseEventHandler<H> => {
    return (e) => {
      const { button, buttons } = e;
      const mouse: t.UIMouseEventProps = {
        ...Util.toBase(e),
        ...Util.toKeys(e),
        button,
        buttons,
        client: { x: e.clientX, y: e.clientY },
        movement: { x: e.movementX, y: e.movementY },
        page: { x: e.pageX, y: e.pageY },
        screen: { x: e.screenX, y: e.screenY },
      };
      bus.fire({
        type: 'sys.ui.event/Mouse',
        payload: { instance, name, mouse, target, ctx },
      });
    };
  };

  const touchHandler = (name: keyof t.UIEventHandlersTouch): React.TouchEventHandler<H> => {
    return (e) => {
      const { touches, targetTouches, changedTouches } = e;
      const touch: t.UITouchEventProps = {
        ...Util.toBase(e),
        ...Util.toKeys(e),
        touches,
        targetTouches,
        changedTouches,
      };
      bus.fire({
        type: 'sys.ui.event/Touch',
        payload: { instance, name, touch, target, ctx },
      });
    };
  };

  const focusHandler = (name: keyof t.UIEventHandlersFocus): React.FocusEventHandler<H> => {
    return (e) => {
      const isFocused = name === 'onFocus' || name === 'onFocusCapture';
      const isBlurred = name === 'onBlur' || name === 'onBlurCapture';
      const focus: t.UIFocusEventProps = Util.toBase(e);
      bus.fire({
        type: 'sys.ui.event/Focus',
        payload: { instance, name, focus, target, isFocused, isBlurred, ctx },
      });
    };
  };

  const mouse: t.UIEventHandlersMouse<H> = {
    onClick: mouseHandler('onClick'),
    onMouseDown: mouseHandler('onMouseDown'),
    onMouseDownCapture: mouseHandler('onMouseDownCapture'),
    onMouseEnter: mouseHandler('onMouseEnter'),
    onMouseLeave: mouseHandler('onMouseLeave'),
    onMouseMove: mouseHandler('onMouseMove'),
    onMouseMoveCapture: mouseHandler('onMouseMoveCapture'),
    onMouseOut: mouseHandler('onMouseOut'),
    onMouseOutCapture: mouseHandler('onMouseOutCapture'),
    onMouseOver: mouseHandler('onMouseOver'),
    onMouseOverCapture: mouseHandler('onMouseOverCapture'),
    onMouseUp: mouseHandler('onMouseUp'),
    onMouseUpCapture: mouseHandler('onMouseUpCapture'),
  };

  const touch: t.UIEventHandlersTouch<H> = {
    onTouchCancel: touchHandler('onTouchCancel'),
    onTouchCancelCapture: touchHandler('onTouchCancelCapture'),
    onTouchEnd: touchHandler('onTouchEnd'),
    onTouchEndCapture: touchHandler('onTouchEndCapture'),
    onTouchMove: touchHandler('onTouchMove'),
    onTouchMoveCapture: touchHandler('onTouchMoveCapture'),
    onTouchStart: touchHandler('onTouchStart'),
    onTouchStartCapture: touchHandler('onTouchStartCapture'),
    onTouchOut: touchHandler('onTouchOut'),
    onTouchOutCapture: touchHandler('onTouchOutCapture'),
  };

  const focus: t.UIEventHandlersFocus<H> = {
    onFocus: focusHandler('onFocus'),
    onFocusCapture: focusHandler('onFocusCapture'),
    onBlur: focusHandler('onBlur'),
    onBlurCapture: focusHandler('onBlurCapture'),
  };

  /**
   * API
   */
  return {
    instance,
    element,
    ref,
    mouse,
    touch,
    focus,
  };
}

/**
 * [Helpers]
 */

const Util = {
  toBase(e: React.UIEvent | React.FocusEvent): t.UIEventBase {
    const {
      bubbles,
      cancelable,
      eventPhase,
      timeStamp,
      isTrusted,
      preventDefault,
      stopPropagation,
    } = e;

    return {
      bubbles,
      cancelable,
      eventPhase,
      timeStamp,
      isTrusted,
      preventDefault,
      stopPropagation,
    };
  },

  toKeys(e: React.MouseEvent | React.TouchEvent): t.UIModifierKeys {
    const { ctrlKey, altKey, metaKey, shiftKey } = e;
    return { ctrlKey, altKey, metaKey, shiftKey };
  },

  toTarget(ref: RefObject<HTMLElement>): t.UIEventTarget {
    return {
      get containsFocus() {
        return containsFocus(ref);
      },
    };
  },
};
