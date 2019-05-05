import * as t from '../types';

export type IThreadStore = t.IStore<IMyModel, MyEvent>;

export type IMyModel = {
  count: number;
};

export type MyEvent = IIncrementEvent | IDecrementEvent;
export type IIncrementEvent = {
  type: 'TEST/increment';
  payload: { by: number };
};
export type IDecrementEvent = {
  type: 'TEST/decrement';
  payload: { by: number };
};
