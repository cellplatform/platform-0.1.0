import { Subject } from 'rxjs';

import { Client, t, ui, rx } from '../common';
import { createStore, behavior } from '../state';

/**
 * Creates an environment context.
 */
export function create(args: { env: t.IEnv }) {
  const { env } = args;
  const event$ = env.event$ as Subject<t.AppEvent>;
  const store = createStore({ event$ });
  const bus = rx.bus<t.AppEvent>(event$);

  // Create the context.
  const ctx: t.IAppContext = {
    env,
    bus,
    client: Client.env(env),
    getState: () => store.state,
  };

  // Finish up.
  behavior.init({ ctx, store });
  const Provider = ui.createProvider({ ctx });
  return { ctx, store, Provider };
}
