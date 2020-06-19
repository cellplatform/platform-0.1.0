import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';

import { Client, t, ui } from '../common';
import { createStore, init } from '../state';

/**
 * Creates an environment context.
 */
export function create(args: { env: t.IEnv }) {
  const { env } = args;
  const event$ = env.event$ as Subject<t.AppEvent>;
  const store = createStore({ event$ });

  event$.subscribe((e) => {
    console.log('🐷', e); // TEMP 🐷
  });

  // Create the context.
  const ctx: t.IAppContext = {
    env,
    client: Client.env(env),
    event$: event$.pipe(share()),
    getState: () => store.state,
    fire: (e) => event$.next(e),
  };

  // Finish up.
  init({ ctx, store });
  const Provider = ui.createProvider({ ctx });
  return { ctx, Provider };
}
