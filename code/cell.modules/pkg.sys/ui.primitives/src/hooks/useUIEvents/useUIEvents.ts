import { MouseEventHandler, TouchEventHandler, UIEvent, TouchEvent, MouseEvent } from 'react';

import { rx, t } from '../common';

type O = Record<string, unknown>;
type Id = string;
type H = HTMLElement;

export type UIEventBusHookArgs<Ctx extends O = O> = {
  bus: t.EventBus<any>;
  instance: Id;
  ctx: Ctx;
};

/**
 * Hook for abstracting a set of DOM events through an event-bus.
 */
export function useUIEvents<Ctx extends O = O, T extends H = H>(
  args: UIEventBusHookArgs<Ctx>,
): t.UIEventsHook<T> {
  const { instance, ctx } = args;
  const bus = rx.busAsType<t.UIEvent>(args.bus);

  const mouseHandler = (kind: keyof t.UIEventsMouse): MouseEventHandler<T> => {
    return (e) => {
      const { button, buttons } = e;
      const mouse: t.UIMouseEventProps = {
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
      bus.fire({
        type: 'sys.ui.event/Mouse',
        payload: { instance, ctx, mouse },
      });
    };
  };

  const touchHandler = (kind: keyof t.UIEventsTouch): TouchEventHandler<T> => {
    return (e) => {
      const { touches, targetTouches, changedTouches } = e;
      const touch: t.UITouchEventProps = {
        kind,
        ...Util.toBase(e),
        ...Util.toKeys(e),
        touches,
        targetTouches,
        changedTouches,
      };
      bus.fire({
        type: 'sys.ui.event/Touch',
        payload: { instance, ctx, touch },
      });
    };
  };

  const mouse: t.UIEventsMouse<T> = {
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

  const touch: t.UIEventsTouch<T> = {
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
  return { instance, mouse, touch };
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
