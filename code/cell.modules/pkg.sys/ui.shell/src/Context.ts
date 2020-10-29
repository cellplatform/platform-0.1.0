import { Subject } from 'rxjs';
import { Client, t, ui, rx, MemoryCache } from './common';

type E = t.Event;

export const Context = {
  /**
   * Creates an environment context.
   */
  create(args: { env: t.IEnv }) {
    const { env } = args;
    const event$ = env.event$ as Subject<E>;
    const bus = rx.bus<E>(event$);
    const client = Client.env(env);
    const ctx: t.IEnvContext = { env, bus, client };
    const Provider = ui.createProvider({ ctx });
    return { ctx, Provider };
  },

  /**
   * Generate an environment object.
   * NOTE:
   *    A proper environmment would have all these values
   *    injected into it.  Creation from partial set of values
   *    using dummy defaults is helpful for testing.
   */
  env(args: Partial<t.IEnv>): t.IEnv {
    const {
      host = '',
      def = 'cell:foo:A1',
      cache = MemoryCache.create(),
      event$ = new Subject<t.Event>(),
    } = args;
    return { host, def, cache, event$ };
  },
};
