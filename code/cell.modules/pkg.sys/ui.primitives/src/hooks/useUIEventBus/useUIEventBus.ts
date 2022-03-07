import { MouseEventHandler, TouchEventHandler, UIEvent, TouchEvent, MouseEvent } from 'react';

import { t } from '../common';

type ID = string;
type H = HTMLElement;

export type PointerBusArgs = {
  bus: t.EventBus<any>;
  instance: ID;
  namespace: string; // The root namespace to fire events within.
  onMouse?: (e: t.UIMouse) => void;
  onTouch?: (e: t.UITouch) => void;
};

/**
 * Hook for abstracting a set of DOM events through an event-bus.
 */
export function useUIEventBus<T extends H = H>(args: PointerBusArgs): t.UIEventBusHook<T> {
  const { bus, instance } = args;
  const namespace = Util.trimNamespace(args.namespace);

  const mouseHandler = (kind: keyof t.UIEventBusMouse): MouseEventHandler<T> => {
    return (e) => {
      const { button, buttons } = e;
      const payload: t.UIMouse = {
        instance,
        kind,
        ...Util.toBase(e),
        ...Util.toKeys(e),
        button,
        buttons,
        client: { x: e.clientX, y: e.clientY },
        movement: { x: e.movementX, y: e.movementY },
        page: { x: e.pageX, y: e.pageY },
        screen: { x: e.screenX, y: e.screenY },
      };
      args.onMouse?.(payload);
      bus.fire({ type: `${namespace}/Mouse`, payload });
    };
  };

  const touchHandler = (kind: keyof t.UIEventBusTouch): TouchEventHandler<T> => {
    return (e) => {
      const { touches, targetTouches, changedTouches } = e;
      const payload: t.UITouch = {
        instance,
        kind,
        ...Util.toBase(e),
        ...Util.toKeys(e),
        touches,
        targetTouches,
        changedTouches,
      };
      args.onTouch?.(payload);
      bus.fire({ type: `${namespace}/Touch`, payload });
    };
  };

  const mouse: t.UIEventBusMouse<T> = {
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

  const touch: t.UIEventBusTouch<T> = {
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

  /**
   * API
   */
  return { instance, namespace, mouse, touch };
}

/**
 * [Helpers]
 */

const Util = {
  trimNamespace(input: string) {
    return (input || '').trim().replace(/\/*$/, '');
  },

  toBase(e: UIEvent): t.UIEventBase {
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

  toKeys(e: MouseEvent | TouchEvent): t.UIModifierKeys {
    const { ctrlKey, altKey, metaKey, shiftKey } = e;
    return { ctrlKey, altKey, metaKey, shiftKey };
  },
};
