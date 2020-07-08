import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';

import { Client, t, ui, AppWindowModel } from '../common';
import { createStore, behavior } from '../state';

/**
 * Creates an environment context.
 */
export async function create(args: { env: t.IEnv }) {
  const { env } = args;
  const event$ = env.event$ as Subject<t.AppEvent>;
  const store = createStore({ event$ });

  const client = Client.env(env);
  const window = await AppWindowModel.load({ client, uri: env.def });

  /**
   * TODO 🐷 TEMP
   */
  event$.subscribe((e) => {
    // console.log('🐷', e);
  });

  // Create the context.
  const ctx: t.IAppContext = {
    env,
    client,
    window,
    event$: event$.pipe(share()),
    getState: () => store.state,
    fire: (e) => event$.next(e),
  };

  // Finish up.
  behavior.init({ ctx, store });
  const Provider = ui.createProvider({ ctx });
  return { ctx, Provider };
}
