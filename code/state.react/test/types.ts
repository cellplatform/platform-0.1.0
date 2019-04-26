export * from '@platform/ui.cli/lib/types';
export * from '../src/types';

import { Store } from '@platform/state';

export type ITestCommandProps = {
  store: Store<IMyModel, MyEvent>;
};

export type IMyModel = {
  count: number;
};

export type MyEvent = IMyIncrementEvent | IMyDecrementEvent;
export type IMyIncrementEvent = {
  type: 'TEST/increment';
  payload: { by?: number };
};
export type IMyDecrementEvent = {
  type: 'TEST/decrement';
  payload: { by?: number };
};
