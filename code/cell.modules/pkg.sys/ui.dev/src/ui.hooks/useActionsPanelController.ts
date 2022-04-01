import { useEffect } from 'react';

import { rx, t, time } from '../common';
import { ActionsController } from '../web.bus';

type InstanceId = string;

/**
 * Controller for handling actions.
 */
export function useActionsPanelController(args: {
  id?: InstanceId;
  bus: t.EventBus;
  actions: t.Actions;
}) {
  const { id, actions } = args;
  const bus = rx.busAsType<t.ActionEvent>(args.bus);

  useEffect(() => {
    const ctrl = ActionsController({ bus, actions, id });

    /**
     * INITIALIZE: Setup initial state.
     * NOTE:
     *    Delaying for a tick allows all interested  components to setup
     *    their hooks before the initial state configuration is established.
     */
    time.delay(0, () => {
      const { namespace } = actions.toObject();
      bus.fire({
        type: 'sys.ui.dev/actions/init',
        payload: { namespace },
      });
    });

    return () => ctrl.dispose();
  }, [bus, actions, id]);
}
