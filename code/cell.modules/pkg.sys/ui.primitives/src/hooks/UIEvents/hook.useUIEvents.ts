import React, { RefObject, useRef } from 'react';

import { rx, t } from '../common';

type O = Record<string, unknown>;
type Id = string;

export type UIEventBusHookArgs<Ctx extends O = O> = {
  bus: t.EventBus<any>;
  instance: Id;
  ctx: Ctx;
};

/**
 * Hook for abstracting a set of DOM events through an event-bus.
 */
export function useUIEvents<Ctx extends O = O, H extends HTMLElement = HTMLElement>(
  args: UIEventBusHookArgs<Ctx>,
): t.UIEventsHook<H> {
  const { instance, ctx } = args;
  const bus = rx.busAsType<t.UIEvent>(args.bus);

  const ref = useRef<H>(null);
  const target = Util.toTarget(ref);

  const mouseHandler = (kind: keyof t.UIEventsMouse): React.MouseEventHandler<H> => {
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
        payload: { instance, kind, mouse, target, ctx },
      });
    };
  };

  const touchHandler = (kind: keyof t.UIEventsTouch): React.TouchEventHandler<H> => {
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
        payload: { instance, kind, touch, target, ctx },
      });
    };
  };

  const focusHandler = (kind: keyof t.UIEventsFocus): React.FocusEventHandler<H> => {
    return (e) => {
      const isFocused = kind === 'onFocus' || kind === 'onFocusCapture';
      const isBlurred = kind === 'onBlur' || kind === 'onBlurCapture';
      const focus: t.UIFocusEventProps = Util.toBase(e);
      bus.fire({
        type: 'sys.ui.event/Focus',
        payload: { instance, kind, focus, target, isFocused, isBlurred, ctx },
      });
    };
  };

  const mouse: t.UIEventsMouse<H> = {
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

  const touch: t.UIEventsTouch<H> = {
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

  const focus: t.UIEventsFocus<H> = {
    onFocus: focusHandler('onFocus'),
    onFocusCapture: focusHandler('onFocusCapture'),
    onBlur: focusHandler('onBlur'),
    onBlurCapture: focusHandler('onBlurCapture'),
  };

  /**
   * API
   */
  return { instance, ref, mouse, touch, focus };
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
        const active = document.activeElement;
        return active && ref.current ? ref.current.contains(active) : false;
      },
    };
  },
};
