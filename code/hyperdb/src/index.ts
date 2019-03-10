import { Db } from './db';
import { Network } from './network';
import { Factory, create as creator } from './factory';

export { Db, Network, Factory };
export * from './types';

export const factory = new Factory({ create: creator });
export const create = factory.create;
export const get = factory.get;
export const getOrCreate = factory.getOrCreate;
