import { NetworkBus } from '@platform/cell.runtime/lib/NetworkBus';
import * as t from './types';

type Uri = string;

/**
 * TODO 🐷
 *
 * Move to [cell.runtime.web]
 *
 */

type Args = {
  pump: t.NetworkPump<any>;
  local(): Promise<Uri>;
  remotes(): Promise<Uri[]>;
};

/**
 * Derives a [NetworkBus] from that runs across the
 * WebWorker process boundary.
 */
export function WorkerBus<E extends t.Event>(args: Args): t.NetworkBus<E> {
  const { local, remotes } = args;
  const pump = args.pump as t.NetworkPump<E>;
  return NetworkBus<E>({ pump, local, remotes });
}
