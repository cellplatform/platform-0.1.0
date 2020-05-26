import { Subject } from 'rxjs';
import { Client, t } from '../common';

/**
 * Creates an environment context.
 */
export function create(args: { env: t.IEnv }): t.IFinderContext {
  const event$ = new Subject<t.FinderEvent>();
  const env = { ...args.env, event$ } as t.IEnv<t.FinderEvent>;
  const client = Client.typesystem(env.host);
  return { env, client, dispatch: (e) => event$.next(e) };
}
