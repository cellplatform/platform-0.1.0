import { Subject } from 'rxjs';
import { Client, t } from '../common';
import { createStore } from '../state';

/**
 * Creates an environment context.
 */
export function create(args: { env: t.IEnv }) {
  const event$ = new Subject<t.FinderEvent>();
  const env = { ...args.env, event$ } as t.IEnv<t.FinderEvent>;
  const client = Client.typesystem(env.host);
  const store = createStore({ env, event$ });

  const ctx: t.IFinderContext = {
    env,
    client,
    getState: () => store.state,
    dispatch: (e) => event$.next(e),
  };

  return { ctx, store };
}
