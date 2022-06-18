import { useEffect, useState } from 'react';
import { filter } from 'rxjs/operators';

import { t, rx } from '../common';
import { CmdBarControllerArgs, CmdBarController } from './Controller';
import { Util } from '../Util';

export type UseCmdBarControllerArgs = CmdBarControllerArgs & {
  enabled?: boolean;
  onStateChange?: t.CmdBarStateChangeHandler;
};

/**
 * Stateful <CmdBar> controller.
 */
export function useCmdBarController(args: UseCmdBarControllerArgs) {
  const { instance, enabled = true } = args;
  const busid = rx.bus.instance(instance.bus);

  const [state, setState] = useState<t.CmdBarState>(args.initial ?? Util.defaultState());

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const events = CmdBarController({ instance, initial: state });

    events.state.$.pipe(filter(() => enabled)).subscribe((state) => {
      setState(state);
      args.onStateChange?.({ state });
    });

    return () => events.dispose();
  }, [instance.id, busid, enabled]); // eslint-disable-line

  /**
   * [API]
   */
  return {
    instance: { bus: busid, id: instance.id },
    enabled,
    state,
  };
}
