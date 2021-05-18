import { t, rx } from './common';

type Scope = 'local' | 'remote';
type E = t.Event;

/**
 * An event-bus distributed across a network of peers.
 */
export function NetworkBus<T extends E = E>(args: {
  pump: t.NetworkPump<T>;
  local: () => Promise<t.NetworkBusUri>;
  remotes: () => Promise<t.NetworkBusUri[]>;
}): t.NetworkBus<T> {
  const { pump } = args;
  const bus = rx.bus<T>();

  pump.in((e) => bus.fire(e));

  const fire = async (event: T, scope: Scope[], filter?: t.NetworkBusFilter) => {
    const local = await args.local();
    const targetted: t.NetworkBusUri[] = [];

    /**
     * Broadcast through LOCAL observable.
     */
    if (filter) {
      // Test the filter against the local peer, and fire locally if any matches found.
      if (filter({ uri: local })) {
        bus.fire(event);
        targetted.push(local);
      }
    } else {
      // NB: No filter was given, so default to firing out of the local bus.
      bus.fire(event);
      targetted.push(local);
    }

    /**
     * Broadcast event to REMOTE targets.
     */
    if (scope.includes('remote')) {
      const targets = (await args.remotes()).filter((uri) => (filter ? filter({ uri }) : true));
      targetted.push(...targets);
      pump.out({ targets, event });
    }

    return { event, targetted };
  };

  const api: t.NetworkBus<T> = {
    $: bus.$,

    fire(event: T) {
      fire(event, ['local', 'remote']);
    },

    /**
     * Target events at specific peers.
     */
    target: {
      /**
       * Fires an event over the local bus only.
       */
      async local(event) {
        return fire(event, ['local']);
      },

      /**
       * Fires an event to remote peers only.
       */
      async remote(event) {
        return fire(event, ['remote']);
      },

      /**
       * Broadcasts to a subset of peers.
       */
      filter(fn?: t.NetworkBusFilter) {
        return {
          fire: (event) => fire(event, ['local', 'remote'], fn),
        };
      },

      /**
       * Broadcasts to a subset of peers.
       */
      node(...target: t.NetworkBusUri[]) {
        return {
          fire: (event) => fire(event, ['local', 'remote'], (e) => target.includes(e.uri)),
        };
      },
    },
  };

  return api;
}
