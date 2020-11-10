import { Store } from '@platform/state';
import { IStateContext } from '@platform/state.react/lib/types';

export * from '@platform/cli.ui/lib/types';
export * from '@platform/state.react/lib/types';

/**
 * [Provider/Context]
 */
export type IMyContextProps = { foo: number; getAsync: () => Promise<boolean> };
export type IMyContext = IStateContext<IMyContextProps>;

/**
 * [CLI]
 */
export type ITestCommandProps = {
  store: Store<IMyModel, MyEvent>;
};

export type IMyModel = {
  count: number;
  debug: 'SINGLE' | 'SPLIT';
};

/**
 * [Events]
 */
export type MyEvent = IMyIncrementEvent | IMyDecrementEvent | IDebugEvent;
export type IMyIncrementEvent = {
  type: 'TEST/increment';
  payload: { by?: number };
};
export type IMyDecrementEvent = {
  type: 'TEST/decrement';
  payload: { by?: number };
};
export type IDebugEvent = {
  type: 'TEST/debug';
  payload: { debug: IMyModel['debug'] };
};
