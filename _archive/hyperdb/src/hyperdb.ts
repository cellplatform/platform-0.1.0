import { Db } from './db';
import { create as creator, DbFactory } from './factory';
import { Network } from './network';
import * as t from './types';

export { Db, Network, DbFactory as Factory };
export * from './types';

export const factory = DbFactory.create<t.IDb, t.INetwork>({ create: creator });
export const create = factory.create;
export const get = factory.get;
export const getOrCreate = factory.getOrCreate;
