import { t } from './common';
import { NetworkBus } from './NetworkBus';

/**
 * A mock network bus.
 * NOTE: useful for when an environment does not support the kind of
 *       bus being requested, but an object needs to be returned.
 */
export function NetworkBusMock<E extends t.Event = t.Event>() {
  const pump: t.NetworkPump<E> = {
    in: (fn) => null,
    out: (e) => null,
  };
  const local = async () => '';
  const remotes = async () => [] as string[];
  return NetworkBus<E>({ pump, local, remotes });
}
