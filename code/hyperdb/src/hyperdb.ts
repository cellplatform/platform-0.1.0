import { Db } from './db';
import { Network } from './network';
import { DbFactory, create as creator } from './factory';

export { Db, Network, DbFactory as Factory };
export * from './types';

export const factory = new DbFactory({ create: creator });
export const create = factory.create;
export const get = factory.get;
export const getOrCreate = factory.getOrCreate;
