import { Subject } from 'rxjs';

import { AppWindowModel, Client, t, ui, rx } from '../common';
import { behavior, createStore } from '../state';
import { fireSheetChanged } from './context.sheetChanged';

/**
 * Creates an environment context.
 */
export async function create(args: { env: t.IEnv }) {
  const { env } = args;
  const source = env.def;
  const event$ = env.event$ as Subject<t.AppEvent>;
  const store = createStore({ event$ });

  const client = Client.env(env);
  const window = await AppWindowModel.load({ client, uri: env.def });

  // Create the context.
  const ctx: t.IAppContext = {
    env,
    client,
    window,
    bus: rx.bus(event$),
    getState: () => store.state,
    sheetChanged: (changes: t.ITypedSheetChanges) => fireSheetChanged({ event$, changes, source }),
  };

  // Finish up.
  behavior.init({ ctx, store });
  const Provider = ui.createProvider({ ctx });
  return { ctx, Provider };
}
