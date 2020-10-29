import { Subject } from 'rxjs';

import { Client, t, ui, rx } from '../common';

type E = t.Event;

/**
 * Creates an environment context.
 */
export function create(args: { env: t.IEnv }) {
  const { env } = args;
  const event$ = env.event$ as Subject<E>;
  const bus = rx.bus<E>(event$);
  const client = Client.env(env);

  // Create the context.
  const ctx: t.IEnvContext = { env, bus, client };

  // Finish up.
  const Provider = ui.createProvider({ ctx });
  return { ctx, Provider };
}
