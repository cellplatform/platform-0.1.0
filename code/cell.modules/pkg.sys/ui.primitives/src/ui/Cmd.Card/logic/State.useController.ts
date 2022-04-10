import { useEffect, useState } from 'react';
import { filter } from 'rxjs/operators';

import { rx, t } from '../common';
import { StateController } from './State.Controller';

export type UseStateControllerArgs = t.CmdCardStateControllerArgs & {
  enabled?: boolean;
  controller?: (args: t.CmdCardStateControllerArgs) => t.CmdCardStateController; // Wrapper controller (the call-site's behavioral logic)
  onChange?: (e: t.CmdCardState) => void;
};

/**
 * <CmdCard> controller state.
 */
export function useStateController(args: UseStateControllerArgs) {
  const { instance, enabled = true } = args;
  const busid = rx.bus.instance(instance.bus);
  const [state, setState] = useState<undefined | t.CmdCardState>(args.initial);

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const controller =
      typeof args.controller === 'function'
        ? args.controller(args)
        : StateController({ instance, initial: state });

    controller.state$.pipe(filter(() => enabled)).subscribe((next) => {
      setState(next);
      args.onChange?.(next);
    });

    return () => controller.dispose();
  }, [instance.id, busid, enabled]); // eslint-disable-line

  /**
   * API
   */
  return {
    instance: { bus: busid, id: instance.id },
    enabled,
    state,
  };
}
