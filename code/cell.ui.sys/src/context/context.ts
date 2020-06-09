import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';

import { Client, t, ui } from '../common';

/**
 * Creates an environment context.
 */
export function create(args: { env: t.IEnv }) {
  const { env } = args;
  const { def, event$ } = env;

  const client = Client.env(env);

  const ctx: t.IEnvContext = {
    def,
    client,
    event$: (event$ as Subject<t.TypedSheetEvent>).pipe(share()),
    fire: (e) => event$.next(e),
  };

  const Provider = ui.createProvider({ ctx });

  return { ctx, Provider };
}
