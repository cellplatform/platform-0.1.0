import { useEffect, useState, useRef } from 'react';

import { t, rx } from './common';

/**
 *
 */
export function useStateController(args: {
  event: t.CmdCardBusArgs;
  enabled?: boolean;
  state?: t.CmdCardState;
  redrawOnChange?: boolean;
}) {
  const { enabled = true, redrawOnChange = true } = args;

  const stateRef = useRef(args.state ?? defaultState());
  const [, setRedraw] = useState(0);
  const redraw = () => setRedraw((prev) => prev + 1);

  /**
   * Cause redraw on state change.
   */
  useEffect(() => {
    if (enabled) {
      const changed = args.state !== stateRef.current;
      if (args.state) stateRef.current = args.state;
      if (changed && redrawOnChange) redraw();
    }
  }, [args.state, enabled, redrawOnChange]);

  /**
   * API
   */
  return {
    enabled,
    get state() {
      return stateRef.current;
    },
  };
}

/**
 * [Helpers]
 */

function defaultState(): t.CmdCardState {
  return { bus: rx.bus(), tmp: 0 };
}
