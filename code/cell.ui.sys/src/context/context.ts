import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';

import { Client, t } from '../common';

/**
 * Creates an environment context.
 */
export function create(args: { env: t.IEnv }) {
  const { env } = args;
  const event$ = env.event$;

  const client = Client.env(env);

  const ctx: t.IEnvContext = {
    client,
    event$: (event$ as Subject<t.TypedSheetEvent>).pipe(share()),
    fire: (e) => event$.next(e),
  };

  return { ctx };
}
