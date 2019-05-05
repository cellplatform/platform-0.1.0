import * as t from '../types';

export type IThreadStore = t.IStore<IThreadModel, ThreadEvent>;

export type IThreadModel = {
  count: number;
};

/**
 * [Events]
 */
export type ThreadEvent = IIncrementEvent | IDecrementEvent;

export type IIncrementEvent = {
  type: 'TEST/increment';
  payload: { by: number };
};
export type IDecrementEvent = {
  type: 'TEST/decrement';
  payload: { by: number };
};
