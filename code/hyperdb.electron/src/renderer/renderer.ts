import { Factory } from '@platform/hyperdb/lib/factory/Factory';
import * as t from '../types';
import { creator } from './create';

export * from '../types';
export * from '@platform/electron/lib/renderer';

export type IInitResult = {
  factory: t.IDbRendererFactory;
  create: t.IDbRendererFactory['create'];
  get: t.IDbRendererFactory['get'];
  getOrCreate: t.IDbRendererFactory['getOrCreate'];
};

/**
 * Initializes a new renderer DB/Network process.
 */
export function init(args: { ipc: t.IpcClient }): IInitResult {
  const { ipc } = args;

  const factory = new Factory<t.IDbRenderer, t.INetworkRenderer>({
    create: creator({ ipc }),
  }) as t.IDbRendererFactory;

  const { create, get, getOrCreate } = factory;
  return { factory, create, get, getOrCreate };
}
