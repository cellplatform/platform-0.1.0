import { useEffect, useState } from 'react';
import { filter } from 'rxjs/operators';

import { rx, t } from '../common';
import { StateController, StateControllerArgs } from './State.Controller';

export type UseStateControllerArgs = StateControllerArgs & {
  enabled?: boolean;
  onChange?: (e: t.CmdCardState) => void;
};

/**
 * <CmdCard> controller state.
 */
export function useStateController(args: UseStateControllerArgs) {
  const { bus, instance, enabled = true } = args;
  const [state, setState] = useState<undefined | t.CmdCardState>(args.initial);

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const controller = StateController({ bus, instance, initial: state });

    controller.state$.pipe(filter(() => enabled)).subscribe((state) => {
      setState(state);
      args.onChange?.(state);
    });

    return () => controller.dispose();
  }, [instance.id, bus, enabled]); // eslint-disable-line

  /**
   * API
   */
  return {
    instance: { bus: bus ? rx.bus.instance(bus) : '', id: instance.id },
    enabled,
    state,
  };
}
