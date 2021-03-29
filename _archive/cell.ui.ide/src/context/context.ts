import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';

import { Client, t, ui, rx } from '../common';
import { createStore, behavior } from '../state';

type E = t.AppEvent;

/**
 * Creates an environment context.
 */
export function create(args: { env: t.IEnv }) {
  const { env } = args;
  const event$ = env.event$ as Subject<t.AppEvent>;
  const store = createStore({ event$ });

  event$.subscribe((e) => {
    // console.log('🐷', e);
  });

  const bus = rx.bus<E>(event$);

  // Create the context.
  const ctx: t.IAppContext = {
    env,
    client: Client.env(env),
    bus,
    getState: () => store.state,
  };

  // Finish up.
  behavior.init({ ctx, store });
  const Provider = ui.createProvider({ ctx });
  return { ctx, Provider };
}
