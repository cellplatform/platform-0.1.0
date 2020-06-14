import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';

import { Client, t, ui } from '../common';

type E = t.SysEvent;

/**
 * Creates an environment context.
 */
export function create(args: { env: t.IEnv }) {
  const { env } = args;
  const { def } = env;
  const event$ = env.event$ as Subject<E>;

  /**
   * TODO 🐷 TEMP
   */
  event$.subscribe((e) => {
    // console.log('🐷TMP ui.sys', e);
  });

  // Create the context.
  const ctx: t.ISysContext = {
    def,
    client: Client.env(env),
    event$: event$.pipe(share()),
    fire: (e) => event$.next(e),
  };

  // Finish up.
  const Provider = ui.createProvider({ ctx });
  return { ctx, Provider };
}
